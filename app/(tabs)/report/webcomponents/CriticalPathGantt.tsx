import React, { useMemo } from "react";
import type { CriticalPathResult, CpmTask } from "@/utils/criticalPath";

interface CriticalPathGanttProps {
  result: CriticalPathResult;
}

const MS_PER_HOUR = 3600000;

function formatTick(date: Date, showTime: boolean): string {
  const datePart = date.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
  });
  if (!showTime) return datePart;
  const timePart = date.toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  return `${datePart}\n${timePart}`;
}

function getBarStyle(startMs: number, endMs: number, min: number, max: number) {
  const span = Math.max(max - min, 1);
  const left = ((startMs - min) / span) * 100;
  const width = Math.max(0.6, ((endMs - startMs) / span) * 100);
  return { left: `${left}%`, width: `${width}%` };
}

function getRealBar(task: CpmTask, min: number, max: number, now: number) {
  const start = task.realStart?.getTime();
  if (!start) return null;

  const end = task.realEnd?.getTime() || now;
  if (end <= start) return null;

  return getBarStyle(start, end, min, max);
}

function getProjectedBar(task: CpmTask, min: number, max: number) {
  if (!task.projectedEnd) return null;
  const planEnd = task.planEnd.getTime();
  const projectedEnd = task.projectedEnd.getTime();
  if (projectedEnd <= planEnd) return null;

  return getBarStyle(planEnd, projectedEnd, min, max);
}

const CriticalPathGantt: React.FC<CriticalPathGanttProps> = ({ result }) => {
  const now = Date.now();

  const timeline = useMemo(() => {
    const starts = result.ganttTasks.map((task) => task.planStart.getTime());
    const ends = result.ganttTasks.flatMap((task) => [
      task.planEnd.getTime(),
      task.projectedEnd?.getTime() || task.planEnd.getTime(),
      task.realEnd?.getTime() || 0,
    ]);

    const min = Math.min(result.projectStart.getTime(), ...starts.filter(Boolean));
    const max = Math.max(
      result.plannedEnd.getTime(),
      result.projectedEnd.getTime(),
      ...ends.filter(Boolean),
      now
    );

    const spanHours = (max - min) / MS_PER_HOUR;
    const tickCount = spanHours <= 72 ? 8 : spanHours <= 336 ? 7 : 6;
    const ticks = Array.from({ length: tickCount }, (_, index) => {
      const ms = min + ((max - min) * index) / (tickCount - 1);
      return { ms, label: formatTick(new Date(ms), spanHours <= 168) };
    });

    return { min, max, ticks, spanHours };
  }, [result, now]);

  const todayLeft = ((now - timeline.min) / Math.max(timeline.max - timeline.min, 1)) * 100;
  const plannedEndLeft =
    ((result.plannedEnd.getTime() - timeline.min) /
      Math.max(timeline.max - timeline.min, 1)) *
    100;
  const projectedEndLeft =
    ((result.projectedEnd.getTime() - timeline.min) /
      Math.max(timeline.max - timeline.min, 1)) *
    100;

  return (
    <div
      style={{
        background: "white",
        borderRadius: 10,
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          borderBottom: "1px solid #e9ecef",
          padding: "14px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 10,
        }}
      >
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#1a1a2e" }}>
            Gantt — Ruta Crítica (estilo MS Project)
          </div>
          <div style={{ fontSize: 11, color: "#6c757d", marginTop: 2 }}>
            Baseline azul · Real verde/rojo · Proyección CPM naranja · ★ = crítica dinámica
          </div>
        </div>
        <div style={{ display: "flex", gap: 12, fontSize: 11, color: "#555", flexWrap: "wrap" }}>
          <span>
            <span style={{ display: "inline-block", width: 12, height: 8, background: "#1976d2", opacity: 0.45, borderRadius: 2, marginRight: 4 }} />
            Plan
          </span>
          <span>
            <span style={{ display: "inline-block", width: 12, height: 8, background: "#198754", borderRadius: 2, marginRight: 4 }} />
            Real a tiempo
          </span>
          <span>
            <span style={{ display: "inline-block", width: 12, height: 8, background: "#dc3545", borderRadius: 2, marginRight: 4 }} />
            Real con retraso
          </span>
          <span>
            <span style={{ display: "inline-block", width: 12, height: 8, background: "#ff9800", borderRadius: 2, marginRight: 4, border: "1px dashed #e65100" }} />
            Proyección CPM
          </span>
        </div>
      </div>

      {result.useApproximateNetwork && (
        <div
          style={{
            margin: "12px 20px 0",
            padding: "10px 12px",
            background: "#fff8e1",
            border: "1px solid #ffe082",
            borderRadius: 8,
            fontSize: 12,
            color: "#795548",
          }}
        >
          Red de precedencias aproximada por orden WBS. Para CPM exacto, importe la columna{" "}
          <strong>Predecesor</strong> desde MS Project.
        </div>
      )}

      <div style={{ overflowX: "auto", padding: "12px 0 20px" }}>
        <div style={{ minWidth: 920 }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "280px 1fr",
              borderBottom: "1px solid #e9ecef",
              margin: "0 20px",
            }}
          >
            <div
              style={{
                padding: "8px 12px",
                fontSize: 11,
                fontWeight: 700,
                color: "#64748b",
                textTransform: "uppercase",
              }}
            >
              Actividad
            </div>
            <div style={{ position: "relative", height: 48, padding: "8px 0" }}>
              {timeline.ticks.map((tick) => {
                const left = ((tick.ms - timeline.min) / Math.max(timeline.max - timeline.min, 1)) * 100;
                return (
                  <div
                    key={tick.ms}
                    style={{
                      position: "absolute",
                      left: `${left}%`,
                      transform: "translateX(-50%)",
                      fontSize: 10,
                      color: "#64748b",
                      textAlign: "center",
                      whiteSpace: "pre-line",
                      lineHeight: 1.2,
                    }}
                  >
                    {tick.label}
                  </div>
                );
              })}
            </div>
          </div>

          {result.ganttTasks.map((task) => {
            const planBar = getBarStyle(
              task.planStart.getTime(),
              task.planEnd.getTime(),
              timeline.min,
              timeline.max
            );
            const realBar = getRealBar(task, timeline.min, timeline.max, now);
            const projectedBar = getProjectedBar(task, timeline.min, timeline.max);
            const realColor = task.delayHours > 0 ? "#dc3545" : "#198754";
            const isCritical = task.isCriticalDynamic || task.isCriticalPlanned;

            return (
              <div
                key={task.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "280px 1fr",
                  borderBottom: "1px solid #f1f5f9",
                  background: isCritical ? "#fff8f8" : "white",
                }}
              >
                <div style={{ padding: "10px 12px", minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    {task.isCriticalDynamic ? (
                      <span style={{ color: "#c62828", fontSize: 12 }}>★</span>
                    ) : null}
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#c62828" }}>
                      {task.codigo}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "#334155",
                      marginTop: 2,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                    title={task.nombre}
                  >
                    {task.nombre}
                  </div>
                  <div style={{ fontSize: 10, color: "#64748b", marginTop: 4 }}>
                    {Math.round(task.plannedDurationHours * 10) / 10}h plan ·{" "}
                    {task.delayHours > 0 ? `+${task.delayHours}h atraso` : "a tiempo"} ·{" "}
                    {task.avance}
                  </div>
                </div>

                <div
                  style={{
                    position: "relative",
                    height: 54,
                    margin: "8px 12px 8px 0",
                    background: "#f8fafc",
                    borderRadius: 6,
                    border: isCritical ? "1px solid #ffcdd2" : "1px solid #e2e8f0",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      bottom: 0,
                      left: `${todayLeft}%`,
                      width: 2,
                      background: "#64748b",
                      opacity: 0.35,
                      zIndex: 1,
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      top: 10,
                      bottom: 10,
                      left: planBar.left,
                      width: planBar.width,
                      background: "#1976d2",
                      opacity: 0.28,
                      borderRadius: 4,
                    }}
                  />
                  {realBar ? (
                    <div
                      style={{
                        position: "absolute",
                        top: 18,
                        bottom: 18,
                        left: realBar.left,
                        width: realBar.width,
                        background: realColor,
                        borderRadius: 4,
                      }}
                    />
                  ) : null}
                  {projectedBar ? (
                    <div
                      style={{
                        position: "absolute",
                        top: 24,
                        bottom: 24,
                        left: projectedBar.left,
                        width: projectedBar.width,
                        background: "repeating-linear-gradient(45deg, #ff9800, #ff9800 6px, #ffe0b2 6px, #ffe0b2 12px)",
                        borderRadius: 4,
                        opacity: 0.95,
                      }}
                    />
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: 16,
          flexWrap: "wrap",
          padding: "0 20px 16px",
          fontSize: 11,
          color: "#64748b",
        }}
      >
        <span>
          Fin planificado:{" "}
          <strong style={{ color: "#1e293b" }}>
            {result.plannedEnd.toLocaleString("es-ES")}
          </strong>
        </span>
        <span>
          Fin proyectado CPM:{" "}
          <strong style={{ color: result.extensionHours > 0 ? "#c62828" : "#1e293b" }}>
            {result.projectedEnd.toLocaleString("es-ES")}
          </strong>
        </span>
        <span style={{ position: "relative", paddingLeft: 14 }}>
          <span
            style={{
              position: "absolute",
              left: 0,
              top: 2,
              bottom: 2,
              width: 2,
              background: "#64748b",
              opacity: 0.5,
            }}
          />
          Hoy
        </span>
        <span style={{ position: "relative", paddingLeft: 14 }}>
          <span
            style={{
              position: "absolute",
              left: 0,
              top: 2,
              bottom: 2,
              width: 2,
              background: "#1976d2",
              opacity: 0.5,
            }}
          />
          Fin plan ({plannedEndLeft.toFixed(0)}%)
        </span>
        {result.extensionHours > 0 ? (
          <span style={{ position: "relative", paddingLeft: 14 }}>
            <span
              style={{
                position: "absolute",
                left: 0,
                top: 2,
                bottom: 2,
                width: 2,
                background: "#ff9800",
              }}
            />
            Fin proyectado ({projectedEndLeft.toFixed(0)}%)
          </span>
        ) : null}
      </div>
    </div>
  );
};

export default CriticalPathGantt;
