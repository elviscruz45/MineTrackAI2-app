import React, { useState, useEffect, useMemo } from "react";
import { calculateAvanceFromMappedTasks } from "@/utils/calculateAvance";
import { sortByCodigo } from "@/utils/sortByCodigo";
import { getTagEquipoLabel } from "@/utils/tagEquipoList";

interface CriticalRouteViewProps {
  data: any;
}

interface MappedTask {
  id: string;
  wbs: string;
  tag: string;
  status: string;
  task: string;
  hours: number;
  startDateProg: { date: string; time: string };
  endDateProg: { date: string; time: string };
  startDateReal: { date: string; time: string };
  endDateReal: { date: string; time: string };
  avance: string;
  esRutaCritica: boolean;
  delayHours: number | null;
  displayStatus: string;
}

interface MappedSection {
  id: string;
  title: string;
  type: string;
  isOpen: boolean;
  progressPercent: number;
  esRutaCritica: boolean;
  tagEquipo: string;
  tasks: MappedTask[];
}

type StatusFilter = "all" | "pendiente" | "progreso" | "retrasada" | "completada";

const isRutaCritica = (value: any): boolean =>
  value === true || String(value || "").trim().toLowerCase() === "si";

function toDateTimeObj(fecha: any): { date: string; time: string } {
  if (!fecha) return { date: "", time: "" };
  let d: Date;
  if (typeof fecha === "string") {
    d = new Date(fecha);
  } else if (fecha.seconds) {
    d = new Date(fecha.seconds * 1000);
  } else if (typeof fecha.toDate === "function") {
    d = fecha.toDate();
  } else {
    return { date: "", time: "" };
  }
  if (isNaN(d.getTime())) return { date: "", time: "" };
  return {
    date: d.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
    }),
    time: d.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }),
  };
}

const getTimestamp = (dateObj: { date: string; time: string }): number => {
  if (!dateObj.date) return 0;
  const [day, month, year] = dateObj.date.split("/");
  const time = dateObj.time || "00:00";
  const [hours, minutes] = time.split(":");
  const fullYear = year?.length === 2 ? `20${year}` : year;
  return new Date(
    `${fullYear}-${month.padStart(2, "0")}-${day.padStart(2, "0")}T${hours}:${minutes}`
  ).getTime();
};

const formatDateTime = (dt: { date: string; time: string }) => {
  if (!dt.date) return "—";
  return dt.time ? `${dt.date} ${dt.time}` : dt.date;
};

const getRealHours = (task: MappedTask): number | null => {
  const start = getTimestamp(task.startDateReal);
  const end = getTimestamp(task.endDateReal);
  if (!start || !end || end <= start) return null;
  return Math.round(((end - start) / 3600000) * 10) / 10;
};

const getDelayHours = (task: MappedTask): number | null => {
  const progEnd = getTimestamp(task.endDateProg);
  if (!progEnd) return null;

  if (task.status === "Completada" && task.endDateReal.date) {
    return Math.round(
      ((getTimestamp(task.endDateReal) - progEnd) / 3600000) * 10
    ) / 10;
  }

  const now = Date.now();
  if (task.status !== "Completada" && now > progEnd) {
    return Math.round(((now - progEnd) / 3600000) * 10) / 10;
  }

  return 0;
};

const getDisplayStatus = (task: MappedTask): string => {
  const delay = getDelayHours(task);
  if (task.status === "Completada") {
    return delay && delay > 0 ? "Completada con retraso" : "Completada";
  }
  if (delay && delay > 0) return "Retrasada";
  if (task.status === "En Progreso") return "En Progreso";
  return "Pendiente";
};

const statusColor = (displayStatus: string): string => {
  if (displayStatus === "Completada") return "#198754";
  if (displayStatus === "Completada con retraso") return "#f9a825";
  if (displayStatus === "Retrasada") return "#dc3545";
  if (displayStatus === "En Progreso") return "#1976d2";
  return "#6c757d";
};

const progressColor = (percent: number): string => {
  if (percent >= 80) return "#198754";
  if (percent > 0) return "#f9a825";
  return "#dc3545";
};

const filterBtn = (active: boolean) => ({
  backgroundColor: active ? "#c62828" : "white",
  color: active ? "white" : "#333",
  border: active ? "none" : "1px solid #dee2e6",
  borderRadius: 6,
  padding: "6px 14px",
  fontSize: 13,
  cursor: "pointer",
  fontWeight: active ? 700 : 500,
});

const CriticalRouteView: React.FC<CriticalRouteViewProps> = ({ data }) => {
  const [sections, setSections] = useState<MappedSection[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  useEffect(() => {
    if (!data || !Array.isArray(data)) return;

    const ganttData = data.filter((s: any) => s.isGlobalProject === true);

    const mapped = sortByCodigo(ganttData).reduce<MappedSection[]>(
      (acc, section: any, idx: number) => {
        const sectionCritical = isRutaCritica(section.esRutaCritica);

        const tasks = (Array.isArray(section.activitiesData)
          ? section.activitiesData
          : []
        )
          .map((act: any, i: number) => {
            const taskCritical =
              sectionCritical || isRutaCritica(act.esRutaCritica);
            if (!taskCritical) return null;

            const status =
              act.avance === "100%" || act.RealFechaFin
                ? "Completada"
                : act.RealFechaInicio
                ? "En Progreso"
                : "Pendiente";

            const mappedTask: MappedTask = {
              id: act.Codigo || act.id || `task-${i + 1}`,
              wbs: act.Codigo || "",
              tag: getTagEquipoLabel(act.TagEquipo || section.TagEquipo) || "—",
              status,
              task: act.NombreServicio || "",
              hours: parseFloat(act.HorasTotales) || 0,
              startDateProg: toDateTimeObj(act.FechaInicio),
              endDateProg: toDateTimeObj(act.FechaFin),
              startDateReal: toDateTimeObj(act.RealFechaInicio),
              endDateReal: toDateTimeObj(act.RealFechaFin),
              avance:
                act.avance ||
                (act.RealFechaFin ? "100%" : act.RealFechaInicio ? "50%" : "0%"),
              esRutaCritica: taskCritical,
              delayHours: 0,
              displayStatus: "Pendiente",
            };

            mappedTask.delayHours = getDelayHours(mappedTask);
            mappedTask.displayStatus = getDisplayStatus(mappedTask);
            return mappedTask;
          })
          .filter(Boolean) as MappedTask[];

        if (tasks.length === 0) return acc;

        acc.push({
          id: section.Codigo || section.id || `section-${idx + 1}`,
          title: section.NombreServicio || "",
          type: section.TipoServicio || "Actividad",
          isOpen: acc.length === 0,
          progressPercent: calculateAvanceFromMappedTasks(tasks),
          esRutaCritica: true,
          tagEquipo: getTagEquipoLabel(section.TagEquipo),
          tasks,
        });

        return acc;
      },
      []
    );

    setSections(mapped);
  }, [data]);

  const allTasks = useMemo(
    () => sections.flatMap((s) => s.tasks),
    [sections]
  );

  const kpis = useMemo(() => {
    const completed = allTasks.filter((t) => t.status === "Completada").length;
    const delayed = allTasks.filter((t) => (t.delayHours ?? 0) > 0).length;
    const pending = allTasks.filter((t) => t.status === "Pendiente").length;
    const inProgress = allTasks.filter((t) => t.status === "En Progreso").length;
    const totalHours = allTasks.reduce((s, t) => s + (t.hours || 0), 0);
    const completedHours = allTasks
      .filter((t) => t.status === "Completada")
      .reduce((s, t) => s + (t.hours || 0), 0);
    const avanceCritico = calculateAvanceFromMappedTasks(allTasks);

    const sortedByEnd = [...allTasks].sort(
      (a, b) => getTimestamp(a.endDateProg) - getTimestamp(b.endDateProg)
    );
    const lastEnd = sortedByEnd[sortedByEnd.length - 1];
    const finPlanificado = lastEnd
      ? formatDateTime(lastEnd.endDateProg)
      : "—";

    return {
      totalTasks: allTasks.length,
      totalSections: sections.length,
      completed,
      delayed,
      pending,
      inProgress,
      avanceCritico,
      totalHours: Math.round(totalHours * 10) / 10,
      completedHours: Math.round(completedHours * 10) / 10,
      finPlanificado,
    };
  }, [allTasks, sections.length]);

  const timelineTasks = useMemo(
    () =>
      [...allTasks].sort(
        (a, b) => getTimestamp(a.startDateProg) - getTimestamp(b.startDateProg)
      ),
    [allTasks]
  );

  const timelineRange = useMemo(() => {
    if (timelineTasks.length === 0) return { min: 0, max: 1 };
    const starts = timelineTasks.map((t) => getTimestamp(t.startDateProg));
    const ends = timelineTasks.map((t) => getTimestamp(t.endDateProg));
    const min = Math.min(...starts.filter(Boolean));
    const max = Math.max(...ends.filter(Boolean));
    return { min, max: max > min ? max : min + 1 };
  }, [timelineTasks]);

  const matchesFilter = (task: MappedTask): boolean => {
    if (statusFilter === "all") return true;
    if (statusFilter === "completada")
      return task.status === "Completada";
    if (statusFilter === "retrasada") return (task.delayHours ?? 0) > 0;
    if (statusFilter === "progreso") return task.status === "En Progreso";
    if (statusFilter === "pendiente")
      return task.status === "Pendiente" && (task.delayHours ?? 0) <= 0;
    return true;
  };

  const filteredSections = useMemo(
    () =>
      sections
        .map((sec) => ({
          ...sec,
          tasks: sec.tasks.filter(matchesFilter),
        }))
        .filter((sec) => sec.tasks.length > 0),
    [sections, statusFilter]
  );

  const toggleSection = (id: string) => {
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isOpen: !s.isOpen } : s))
    );
  };

  const barStyle = (
    start: { date: string; time: string },
    end: { date: string; time: string },
    color: string,
    opacity = 1
  ) => {
    const { min, max } = timelineRange;
    const span = max - min;
    const s = getTimestamp(start);
    const e = getTimestamp(end);
    if (!s || !e) return { display: "none" as const };
    const left = ((s - min) / span) * 100;
    const width = Math.max(0.5, ((e - s) / span) * 100);
    return {
      position: "absolute" as const,
      left: `${left}%`,
      width: `${width}%`,
      height: "100%",
      backgroundColor: color,
      opacity,
      borderRadius: 3,
    };
  };

  if (sections.length === 0) {
    return (
      <div style={{ background: "#f0f4f8", minHeight: "100%", paddingBottom: 32 }}>
        <div
          style={{
            background: "linear-gradient(135deg, #b71c1c 0%, #c62828 100%)",
            padding: "20px 20px 24px",
          }}
        >
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "white" }}>
            ⛓️ Ruta Crítica
          </h2>
          <p style={{ margin: "4px 0 0", fontSize: 12, color: "rgba(255,255,255,0.7)" }}>
            Actividades marcadas como ruta crítica en el Gantt (esRutaCritica = Sí)
          </p>
        </div>
        <div
          style={{
            margin: 24,
            padding: 32,
            background: "white",
            borderRadius: 10,
            textAlign: "center",
            color: "#6c757d",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          }}
        >
          No hay actividades marcadas como ruta crítica en el proyecto cargado.
          <br />
          <span style={{ fontSize: 12 }}>
            Verifique la columna <strong>esRutaCritica</strong> en el Excel del Gantt.
          </span>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "#f0f4f8", minHeight: "100%", paddingBottom: 32 }}>
      <style>{`
        .cr-kpi-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; padding: 16px 16px 0; }
        @media (min-width: 700px) { .cr-kpi-grid { grid-template-columns: repeat(4, 1fr); } }
        @media (min-width: 1100px) { .cr-kpi-grid { grid-template-columns: repeat(8, 1fr); } }
        .cr-table-wrap { overflow-x: auto; }
      `}</style>

      {/* Header */}
      <div
        style={{
          background: "linear-gradient(135deg, #b71c1c 0%, #c62828 100%)",
          padding: "20px 20px 24px",
        }}
      >
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "white" }}>
          ⛓️ Ruta Crítica — Panel del Planificador
        </h2>
        <p style={{ margin: "4px 0 0", fontSize: 12, color: "rgba(255,255,255,0.75)" }}>
          Solo actividades con <strong>esRutaCritica = Sí</strong> · Plan vs. ejecución ·{" "}
          {new Date().toLocaleDateString("es-ES")}
        </p>
      </div>

      {/* KPIs */}
      <div className="cr-kpi-grid">
        {[
          { label: "Actividades Críticas", value: `${kpis.totalTasks}`, icon: "⛓️", color: "#c62828", sub: `${kpis.totalSections} paquetes WBS` },
          { label: "Avance Crítico", value: `${kpis.avanceCritico}%`, icon: "📊", color: "#1976d2", sub: "Por horas programadas" },
          { label: "Completadas", value: `${kpis.completed}`, icon: "✅", color: "#198754", sub: `De ${kpis.totalTasks} tareas` },
          { label: "Con Retraso", value: `${kpis.delayed}`, icon: "⚠️", color: "#f9a825", sub: "Fuera de fin programado" },
          { label: "En Progreso", value: `${kpis.inProgress}`, icon: "🔵", color: "#1565c0", sub: "Ejecutándose ahora" },
          { label: "Pendientes", value: `${kpis.pending}`, icon: "⏳", color: "#6c757d", sub: "Sin iniciar" },
          { label: "HH Críticas", value: `${kpis.totalHours}h`, icon: "⏱️", color: "#4527a0", sub: `${kpis.completedHours}h ejecutadas` },
          { label: "Fin Planificado", value: kpis.finPlanificado.split(" ")[0], icon: "📅", color: "#37474f", sub: kpis.finPlanificado.split(" ")[1] || "—" },
        ].map((k, i) => (
          <div
            key={i}
            style={{
              background: "white",
              borderRadius: 10,
              overflow: "hidden",
              boxShadow: "0 2px 10px rgba(0,0,0,0.07)",
            }}
          >
            <div
              style={{
                background: k.color,
                padding: "8px 10px",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <span style={{ fontSize: 14 }}>{k.icon}</span>
              <span
                style={{
                  color: "white",
                  fontSize: 8,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: 0.3,
                  lineHeight: 1.2,
                }}
              >
                {k.label}
              </span>
            </div>
            <div style={{ padding: "8px 10px" }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: "#1a1a2e" }}>
                {k.value}
              </div>
              <div style={{ fontSize: 9, color: "#999", marginTop: 2 }}>{k.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Alert banner if delays */}
      {kpis.delayed > 0 && (
        <div
          style={{
            margin: "16px 16px 0",
            padding: "12px 16px",
            background: "#fff3cd",
            border: "1px solid #ffc107",
            borderRadius: 8,
            display: "flex",
            alignItems: "center",
            gap: 10,
            fontSize: 13,
            color: "#856404",
          }}
        >
          <span style={{ fontSize: 18 }}>⚠️</span>
          <span>
            <strong>{kpis.delayed} actividad(es) crítica(s)</strong> con retraso respecto al
            fin programado. Priorice su cierre para no impactar la parada.
          </span>
        </div>
      )}

      <div style={{ padding: "16px" }}>
        {/* Timeline */}
        <div
          style={{
            background: "white",
            borderRadius: 10,
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            marginBottom: 16,
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
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 4,
                  height: 26,
                  borderRadius: 2,
                  background: "linear-gradient(180deg, #c62828, #b71c1c)",
                }}
              />
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#1a1a2e" }}>
                  Secuencia Crítica — Línea de Tiempo
                </div>
                <div style={{ fontSize: 11, color: "#6c757d" }}>
                  Barras azules = plan · Barras verdes/rojas = ejecución real
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 12, fontSize: 11, color: "#555" }}>
              <span>
                <span style={{ display: "inline-block", width: 12, height: 8, background: "#1976d2", borderRadius: 2, marginRight: 4 }} />
                Programado
              </span>
              <span>
                <span style={{ display: "inline-block", width: 12, height: 8, background: "#198754", borderRadius: 2, marginRight: 4 }} />
                Real a tiempo
              </span>
              <span>
                <span style={{ display: "inline-block", width: 12, height: 8, background: "#dc3545", borderRadius: 2, marginRight: 4 }} />
                Real con retraso
              </span>
            </div>
          </div>

          <div style={{ padding: "12px 20px 20px" }}>
            {timelineTasks.map((task) => {
              const hasReal =
                task.startDateReal.date && task.endDateReal.date;
              const realColor =
                (task.delayHours ?? 0) > 0 ? "#dc3545" : "#198754";

              return (
                <div
                  key={task.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    marginBottom: 10,
                  }}
                >
                  <div style={{ width: 72, flexShrink: 0 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#c62828" }}>
                      {task.wbs}
                    </div>
                  </div>
                  <div
                    style={{
                      flex: 1,
                      minWidth: 0,
                      fontSize: 12,
                      color: "#333",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                    title={task.task}
                  >
                    {task.task}
                  </div>
                  <div
                    style={{
                      width: "42%",
                      minWidth: 180,
                      height: 22,
                      background: "#f1f3f5",
                      borderRadius: 4,
                      position: "relative",
                      flexShrink: 0,
                    }}
                  >
                    <div
                      style={barStyle(
                        task.startDateProg,
                        task.endDateProg,
                        "#1976d2",
                        0.35
                      )}
                    />
                    {hasReal && (
                      <div
                        style={barStyle(
                          task.startDateReal,
                          task.endDateReal,
                          realColor,
                          0.95
                        )}
                      />
                    )}
                    {!hasReal && task.status === "En Progreso" && (
                      <div
                        style={{
                          position: "absolute",
                          left: barStyle(task.startDateProg, task.endDateProg, "", 1).left,
                          width: 6,
                          height: "100%",
                          background: "#1976d2",
                          borderRadius: 3,
                        }}
                      />
                    )}
                  </div>
                  <div
                    style={{
                      width: 56,
                      textAlign: "right",
                      fontSize: 12,
                      fontWeight: 700,
                      color: progressColor(
                        parseInt(task.avance.replace("%", "")) || 0
                      ),
                      flexShrink: 0,
                    }}
                  >
                    {task.avance}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Filters */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
            marginBottom: 16,
            alignItems: "center",
          }}
        >
          <span style={{ fontSize: 13, fontWeight: 600, color: "#333", marginRight: 4 }}>
            Filtrar:
          </span>
          {(
            [
              ["all", "Todas"],
              ["pendiente", "Pendientes"],
              ["progreso", "En Progreso"],
              ["retrasada", "Con Retraso"],
              ["completada", "Completadas"],
            ] as [StatusFilter, string][]
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              style={filterBtn(statusFilter === key)}
              onClick={() => setStatusFilter(key)}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Sections + Table */}
        {filteredSections.map((section) => (
          <div key={section.id} style={{ marginBottom: 20 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "12px 16px",
                backgroundColor: "#fff1f0",
                borderLeft: "4px solid #c62828",
                borderRadius: "8px 8px 0 0",
                cursor: "pointer",
                boxShadow: "inset 0 0 0 1px #ffcdd2",
              }}
              onClick={() => toggleSection(section.id)}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                style={{
                  transform: section.isOpen ? "rotate(0deg)" : "rotate(-90deg)",
                  transition: "transform 0.2s",
                }}
              >
                <path
                  d="M19 9L12 16L5 9"
                  stroke="#333"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span style={{ fontWeight: 700, color: "#1a1a2e" }}>
                {section.id}
              </span>
              <span style={{ fontWeight: 600, color: "#333" }}>{section.title}</span>
              {section.tagEquipo ? (
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#1565c0",
                    backgroundColor: "#e3f2fd",
                    padding: "2px 8px",
                    borderRadius: 8,
                  }}
                >
                  {section.tagEquipo}
                </span>
              ) : null}
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "white",
                  backgroundColor: progressColor(section.progressPercent),
                  padding: "2px 8px",
                  borderRadius: 4,
                }}
              >
                {section.progressPercent}%
              </span>
              <span
                style={{
                  fontSize: 12,
                  color: "#666",
                  marginLeft: "auto",
                  backgroundColor: "#ffe0e0",
                  padding: "2px 8px",
                  borderRadius: 4,
                  fontWeight: 600,
                }}
              >
                ⛓️ {section.tasks.length} tareas críticas
              </span>
            </div>

            {section.isOpen && (
              <div
                className="cr-table-wrap"
                style={{
                  background: "white",
                  borderRadius: "0 0 8px 8px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                }}
              >
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: 13,
                  }}
                >
                  <thead>
                    <tr style={{ backgroundColor: "#fff5f5", textAlign: "left" }}>
                      {[
                        "WBS",
                        "TAG",
                        "Tarea",
                        "Estado",
                        "HH Prog.",
                        "HH Real",
                        "Inicio Prog.",
                        "Fin Prog.",
                        "Fin Real",
                        "Δ Retraso",
                        "Avance",
                      ].map((h) => (
                        <th
                          key={h}
                          style={{
                            padding: 10,
                            border: "1px solid #dee2e6",
                            fontSize: 11,
                            textTransform: "uppercase",
                            letterSpacing: 0.3,
                            color: "#495057",
                            textAlign: h.includes("HH") || h.startsWith("Δ") || h === "Avance" ? "center" : "left",
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {section.tasks.map((task) => {
                      const realH = getRealHours(task);
                      const delay = task.delayHours ?? 0;
                      const rowBg =
                        delay > 0 && task.status !== "Completada"
                          ? "#fff5f5"
                          : delay > 0 && task.status === "Completada"
                          ? "#fffde7"
                          : "white";

                      return (
                        <tr key={task.id} style={{ backgroundColor: rowBg }}>
                          <td
                            style={{
                              padding: 10,
                              border: "1px solid #dee2e6",
                              fontWeight: 700,
                              color: "#c62828",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {task.wbs}
                          </td>
                          <td
                            style={{
                              padding: 10,
                              border: "1px solid #dee2e6",
                              fontSize: 11,
                            }}
                          >
                            {task.tag}
                          </td>
                          <td
                            style={{
                              padding: 10,
                              border: "1px solid #dee2e6",
                              minWidth: 180,
                            }}
                          >
                            {task.task}
                          </td>
                          <td style={{ padding: 10, border: "1px solid #dee2e6" }}>
                            <span
                              style={{
                                display: "inline-block",
                                padding: "3px 8px",
                                borderRadius: 4,
                                fontSize: 11,
                                fontWeight: 600,
                                color: "white",
                                backgroundColor: statusColor(task.displayStatus),
                                whiteSpace: "nowrap",
                              }}
                            >
                              {task.displayStatus}
                            </span>
                          </td>
                          <td
                            style={{
                              padding: 10,
                              border: "1px solid #dee2e6",
                              textAlign: "center",
                            }}
                          >
                            {task.hours > 0 ? task.hours : "—"}
                          </td>
                          <td
                            style={{
                              padding: 10,
                              border: "1px solid #dee2e6",
                              textAlign: "center",
                            }}
                          >
                            {realH !== null ? realH : "—"}
                          </td>
                          <td
                            style={{
                              padding: 10,
                              border: "1px solid #dee2e6",
                              whiteSpace: "nowrap",
                              fontSize: 12,
                            }}
                          >
                            {formatDateTime(task.startDateProg)}
                          </td>
                          <td
                            style={{
                              padding: 10,
                              border: "1px solid #dee2e6",
                              whiteSpace: "nowrap",
                              fontSize: 12,
                            }}
                          >
                            {formatDateTime(task.endDateProg)}
                          </td>
                          <td
                            style={{
                              padding: 10,
                              border: "1px solid #dee2e6",
                              whiteSpace: "nowrap",
                              fontSize: 12,
                            }}
                          >
                            {formatDateTime(task.endDateReal)}
                          </td>
                          <td
                            style={{
                              padding: 10,
                              border: "1px solid #dee2e6",
                              textAlign: "center",
                              fontWeight: 700,
                              color:
                                delay > 0
                                  ? "#dc3545"
                                  : delay < 0
                                  ? "#198754"
                                  : "#6c757d",
                            }}
                          >
                            {delay === 0
                              ? "A tiempo"
                              : delay > 0
                              ? `+${delay}h`
                              : `${delay}h`}
                          </td>
                          <td
                            style={{
                              padding: 10,
                              border: "1px solid #dee2e6",
                              textAlign: "center",
                              fontWeight: 700,
                              color: progressColor(
                                parseInt(task.avance.replace("%", "")) || 0
                              ),
                            }}
                          >
                            {task.avance}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}

        {filteredSections.length === 0 && (
          <div
            style={{
              padding: 24,
              textAlign: "center",
              color: "#6c757d",
              background: "white",
              borderRadius: 8,
            }}
          >
            No hay tareas críticas con el filtro seleccionado.
          </div>
        )}
      </div>
    </div>
  );
};

export default CriticalRouteView;
