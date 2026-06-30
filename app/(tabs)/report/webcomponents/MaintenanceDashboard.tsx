import React, { useEffect, useMemo, useState } from "react";
import { getMaintenanceLogsByDateRange } from "@/lib/db/maintenanceLogs";
import type { FirebaseMaintenanceLogDoc } from "@/lib/db/types";

const C = {
  brand: "#2A3B76",
  accent: "#1976d2",
  green: "#198754",
  orange: "#e67e22",
  bg: "#f0f4f8",
  card: "#ffffff",
};

const startOfWeek = (d: Date) => {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  date.setHours(0, 0, 0, 0);
  return date;
};

const MaintenanceDashboard: React.FC = () => {
  const [logs, setLogs] = useState<FirebaseMaintenanceLogDoc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 56);
    getMaintenanceLogsByDateRange(start, end)
      .then(setLogs)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const stats = useMemo(() => {
    const now = new Date();
    const weekStart = startOfWeek(now);
    const thisWeek = logs.filter((l) => {
      const f = new Date(String(l.fecha ?? ""));
      return f >= weekStart;
    });

    const planta = thisWeek.filter((l) => l.personnelType === "planta");
    const contratista = thisWeek.filter(
      (l) => l.personnelType === "contratista"
    );

    const byTipo: Record<string, number> = {};
    thisWeek.forEach((l) => {
      const t = String(l.tipoMantenimiento ?? "otro");
      byTipo[t] = (byTipo[t] ?? 0) + 1;
    });

    const weekly: { label: string; planta: number; contratista: number }[] =
      [];
    for (let i = 3; i >= 0; i--) {
      const ws = new Date(weekStart);
      ws.setDate(ws.getDate() - i * 7);
      const we = new Date(ws);
      we.setDate(we.getDate() + 7);
      const weekLogs = logs.filter((l) => {
        const f = new Date(String(l.fecha ?? ""));
        return f >= ws && f < we;
      });
      weekly.push({
        label: `Sem ${4 - i}`,
        planta: weekLogs.filter((l) => l.personnelType === "planta").length,
        contratista: weekLogs.filter((l) => l.personnelType === "contratista")
          .length,
      });
    }

    const horasPlanta = planta.reduce(
      (s, l) => s + (Number(l.horas) || 0),
      0
    );
    const horasContratista = contratista.reduce(
      (s, l) => s + (Number(l.horas) || 0),
      0
    );

    return {
      totalSemana: thisWeek.length,
      planta: planta.length,
      contratista: contratista.length,
      horasPlanta,
      horasContratista,
      byTipo,
      weekly,
    };
  }, [logs]);

  if (loading) {
    return (
      <div style={{ padding: 32, textAlign: "center", color: C.brand }}>
        Cargando mantenimiento diario…
      </div>
    );
  }

  const maxWeekly = Math.max(
    1,
    ...stats.weekly.map((w) => w.planta + w.contratista)
  );

  return (
    <div style={{ padding: "24px 0" }}>
      <h2
        style={{
          color: C.brand,
          fontSize: 22,
          fontWeight: 700,
          marginBottom: 20,
        }}
      >
        Mantenimiento Diario — Operaciones
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 16,
          marginBottom: 28,
        }}
      >
        {[
          { label: "Registros esta semana", value: stats.totalSemana },
          { label: "Planta", value: stats.planta, color: C.green },
          { label: "Contratista", value: stats.contratista, color: C.orange },
          {
            label: "HH Planta",
            value: stats.horasPlanta.toFixed(1),
            color: C.green,
          },
          {
            label: "HH Contratista",
            value: stats.horasContratista.toFixed(1),
            color: C.orange,
          },
        ].map((kpi) => (
          <div
            key={kpi.label}
            style={{
              background: C.card,
              borderRadius: 12,
              padding: "16px 20px",
              boxShadow: "0 2px 8px rgba(42,59,118,0.08)",
              borderLeft: `4px solid ${kpi.color ?? C.brand}`,
            }}
          >
            <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>
              {kpi.label}
            </div>
            <div
              style={{
                fontSize: 28,
                fontWeight: 700,
                color: kpi.color ?? C.brand,
              }}
            >
              {kpi.value}
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: 20,
        }}
      >
        <div
          style={{
            background: C.card,
            borderRadius: 12,
            padding: 20,
            boxShadow: "0 2px 8px rgba(42,59,118,0.08)",
          }}
        >
          <h3 style={{ color: C.brand, marginBottom: 16, fontSize: 15 }}>
            Registros por semana (planta vs contratista)
          </h3>
          {stats.weekly.map((w) => (
            <div key={w.label} style={{ marginBottom: 12 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 12,
                  marginBottom: 4,
                }}
              >
                <span>{w.label}</span>
                <span>
                  {w.planta + w.contratista} total
                </span>
              </div>
              <div style={{ display: "flex", height: 14, borderRadius: 4, overflow: "hidden" }}>
                <div
                  style={{
                    width: `${(w.planta / maxWeekly) * 100}%`,
                    background: C.green,
                  }}
                />
                <div
                  style={{
                    width: `${(w.contratista / maxWeekly) * 100}%`,
                    background: C.orange,
                  }}
                />
              </div>
            </div>
          ))}
          <div style={{ display: "flex", gap: 16, marginTop: 12, fontSize: 12 }}>
            <span>
              <span style={{ color: C.green }}>■</span> Planta
            </span>
            <span>
              <span style={{ color: C.orange }}>■</span> Contratista
            </span>
          </div>
        </div>

        <div
          style={{
            background: C.card,
            borderRadius: 12,
            padding: 20,
            boxShadow: "0 2px 8px rgba(42,59,118,0.08)",
          }}
        >
          <h3 style={{ color: C.brand, marginBottom: 16, fontSize: 15 }}>
            Tipo de mantenimiento (esta semana)
          </h3>
          {Object.keys(stats.byTipo).length === 0 ? (
            <p style={{ color: "#94a3b8", fontSize: 13 }}>
              Sin registros esta semana
            </p>
          ) : (
            Object.entries(stats.byTipo).map(([tipo, count]) => (
              <div
                key={tipo}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "8px 0",
                  borderBottom: "1px solid #f1f5f9",
                  fontSize: 13,
                }}
              >
                <span style={{ textTransform: "capitalize" }}>{tipo}</span>
                <strong style={{ color: C.brand }}>{count}</strong>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default MaintenanceDashboard;
