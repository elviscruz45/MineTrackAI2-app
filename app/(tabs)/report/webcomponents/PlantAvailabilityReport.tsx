import React, { useEffect, useState } from "react";
import {
  getPlantAvailabilityData,
  type PlantAvailabilityData,
  type TagAvailability,
} from "@/lib/db/plantAvailability";

const C = {
  brand: "#2A3B76",
  accent: "#1976d2",
  green: "#198754",
  yellow: "#e6a817",
  red: "#dc3545",
  bg: "#f0f4f8",
  card: "#ffffff",
};

const pctColor = (val: number, target: number) => {
  const gap = val - target;
  if (gap >= 0) return C.green;
  if (gap >= -3) return C.yellow;
  return C.red;
};

const fmtPct = (n: number) => `${n.toFixed(1)}%`;
const fmtHrs = (n: number) =>
  n >= 1000 ? `${(n / 1000).toFixed(1)}k h` : `${n.toFixed(0)} h`;
const fmtMt = (n: number) => `${n.toFixed(0)} h`;

const ESTADO_COLORS: Record<string, string> = {
  operativo: C.green,
  limitado: C.yellow,
  parado: C.red,
  en_mantenimiento: C.accent,
  sin_dato: "#94a3b8",
};

const PlantAvailabilityReport: React.FC = () => {
  const [data, setData] = useState<PlantAvailabilityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<"disponibilidad" | "paradas">(
    "disponibilidad",
  );

  useEffect(() => {
    getPlantAvailabilityData()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ padding: 48, textAlign: "center", color: C.brand }}>
        Cargando reporte de disponibilidad de planta…
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ padding: 48, textAlign: "center", color: C.red }}>
        No se pudo cargar el reporte de disponibilidad.
      </div>
    );
  }

  const { planta, porArea, porEquipo, mensual, alertas, year, periodStart, periodEnd, hasRealData } =
    data;

  const gapPlanta = planta.disponibilidad - planta.objetivoDisponibilidad;
  const maxMensual = Math.max(...mensual.map((m) => m.disponibilidad), 1);

  const sortedEquipos = [...porEquipo].sort((a, b) =>
    sortBy === "disponibilidad"
      ? a.disponibilidad - b.disponibilidad
      : b.paradas - a.paradas,
  );

  const topRiesgo = sortedEquipos.slice(0, 5);

  return (
    <div style={{ padding: "24px 0" }}>
      {/* ── Encabezado ejecutivo ─────────────────────────────── */}
      <div
        style={{
          background: `linear-gradient(135deg, ${C.brand} 0%, #1565c0 100%)`,
          borderRadius: 14,
          padding: "24px 28px",
          marginBottom: 24,
          color: "white",
          boxShadow: "0 4px 16px rgba(42,59,118,0.2)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: 1.2,
                textTransform: "uppercase",
                opacity: 0.75,
                marginBottom: 6,
              }}
            >
              Reporte Gerencia de Mantenimiento
            </div>
            <h1 style={{ fontSize: 26, fontWeight: 800, margin: 0 }}>
              Disponibilidad Acumulada de Planta
            </h1>
            <p style={{ margin: "8px 0 0", opacity: 0.85, fontSize: 14 }}>
              Período: 1 ene {year} —{" "}
              {periodEnd.toLocaleDateString("es-PE", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
              {!hasRealData && (
                <span
                  style={{
                    marginLeft: 8,
                    background: "rgba(255,255,255,0.2)",
                    padding: "2px 8px",
                    borderRadius: 4,
                    fontSize: 11,
                  }}
                >
                  Estimado por estado de equipos
                </span>
              )}
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 48, fontWeight: 900, lineHeight: 1 }}>
              {fmtPct(planta.disponibilidad)}
            </div>
            <div style={{ fontSize: 12, opacity: 0.8 }}>
              Objetivo: {planta.objetivoDisponibilidad}% · Δ{" "}
              <span
                style={{
                  color: gapPlanta >= 0 ? "#86efac" : "#fca5a5",
                  fontWeight: 700,
                }}
              >
                {gapPlanta >= 0 ? "+" : ""}
                {gapPlanta.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── KPIs principales ─────────────────────────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: 14,
          marginBottom: 24,
        }}
      >
        {[
          {
            label: "Confiabilidad",
            value: fmtPct(planta.confiabilidad),
            sub: "MTBF / (MTBF + MTTR)",
            color: pctColor(planta.confiabilidad, 85),
          },
          {
            label: "MTBF",
            value: fmtMt(planta.mtbf),
            sub: "Tiempo medio entre fallas",
            color: C.brand,
          },
          {
            label: "MTTR",
            value: fmtMt(planta.mttr),
            sub: "Tiempo medio de reparación",
            color: planta.mttr > 8 ? C.red : C.green,
          },
          {
            label: "Horas parada YTD",
            value: fmtHrs(planta.horasParadaTotal),
            sub: `de ${fmtHrs(planta.horasCalendarioTotal)} calendario`,
            color: C.red,
          },
          {
            label: "Equipos operativos",
            value: `${planta.equiposOperativos}/${planta.equiposTotal}`,
            sub: `${planta.equiposParados} parado(s) · ${planta.equiposEnMantenimiento} en mant.`,
            color: C.green,
          },
          {
            label: "Mant. preventivo",
            value: String(planta.preventivo),
            sub: `Correctivo: ${planta.correctivo}`,
            color: C.accent,
          },
        ].map((kpi) => (
          <div
            key={kpi.label}
            style={{
              background: C.card,
              borderRadius: 12,
              padding: "16px 18px",
              boxShadow: "0 2px 8px rgba(42,59,118,0.07)",
              borderLeft: `4px solid ${kpi.color}`,
            }}
          >
            <div style={{ fontSize: 11, color: "#64748b", marginBottom: 4 }}>
              {kpi.label}
            </div>
            <div
              style={{ fontSize: 26, fontWeight: 800, color: kpi.color }}
            >
              {kpi.value}
            </div>
            <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>
              {kpi.sub}
            </div>
          </div>
        ))}
      </div>

      {/* ── Alertas gerenciales ──────────────────────────────── */}
      <div
        style={{
          background: C.card,
          borderRadius: 12,
          padding: "16px 20px",
          marginBottom: 24,
          boxShadow: "0 2px 8px rgba(42,59,118,0.07)",
        }}
      >
        <h3
          style={{
            color: C.brand,
            fontSize: 14,
            fontWeight: 700,
            marginBottom: 12,
            textTransform: "uppercase",
            letterSpacing: 0.5,
          }}
        >
          Alertas y oportunidades de mejora
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {alertas.map((a, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 14px",
                borderRadius: 8,
                background:
                  a.nivel === "red"
                    ? "#fef2f2"
                    : a.nivel === "yellow"
                      ? "#fffbeb"
                      : "#f0fdf4",
                borderLeft: `3px solid ${a.nivel === "red" ? C.red : a.nivel === "yellow" ? C.yellow : C.green}`,
                fontSize: 13,
              }}
            >
              <span>
                {a.nivel === "red" ? "🔴" : a.nivel === "yellow" ? "🟡" : "🟢"}
              </span>
              {a.texto}
            </div>
          ))}
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
          gap: 20,
          marginBottom: 24,
        }}
      >
        {/* ── Disponibilidad por área ─────────────────────────── */}
        <div
          style={{
            background: C.card,
            borderRadius: 12,
            padding: 20,
            boxShadow: "0 2px 8px rgba(42,59,118,0.07)",
          }}
        >
          <h3 style={{ color: C.brand, fontSize: 15, fontWeight: 700, marginBottom: 16 }}>
            Disponibilidad por área (YTD)
          </h3>
          {porArea.map((area) => (
            <div key={area.area} style={{ marginBottom: 16 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 6,
                  fontSize: 13,
                }}
              >
                <span style={{ fontWeight: 600 }}>
                  <span
                    style={{
                      display: "inline-block",
                      width: 10,
                      height: 10,
                      borderRadius: 2,
                      background: area.color,
                      marginRight: 8,
                    }}
                  />
                  {area.area}
                  <span style={{ color: "#94a3b8", fontWeight: 400, marginLeft: 6 }}>
                    ({area.equipos} equipos)
                  </span>
                </span>
                <span>
                  <strong
                    style={{
                      color: pctColor(area.disponibilidad, area.objetivo),
                    }}
                  >
                    {fmtPct(area.disponibilidad)}
                  </strong>
                  <span style={{ color: "#94a3b8", fontSize: 11, marginLeft: 6 }}>
                    obj. {area.objetivo}%
                  </span>
                </span>
              </div>
              <div
                style={{
                  height: 10,
                  background: "#f1f5f9",
                  borderRadius: 5,
                  overflow: "hidden",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${area.disponibilidad}%`,
                    background: area.color,
                    borderRadius: 5,
                    transition: "width 0.4s ease",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: `${area.objetivo}%`,
                    width: 2,
                    height: "100%",
                    background: C.brand,
                    opacity: 0.5,
                  }}
                />
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 11,
                  color: "#94a3b8",
                  marginTop: 4,
                }}
              >
                <span>Confiabilidad: {fmtPct(area.confiabilidad)}</span>
                <span>
                  Parada: {fmtHrs(area.horasParada)} · Δ{" "}
                  <span
                    style={{
                      color: area.gap >= 0 ? C.green : C.red,
                      fontWeight: 600,
                    }}
                  >
                    {area.gap >= 0 ? "+" : ""}
                    {area.gap.toFixed(1)}%
                  </span>
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* ── Tendencia mensual ───────────────────────────────── */}
        <div
          style={{
            background: C.card,
            borderRadius: 12,
            padding: 20,
            boxShadow: "0 2px 8px rgba(42,59,118,0.07)",
          }}
        >
          <h3 style={{ color: C.brand, fontSize: 15, fontWeight: 700, marginBottom: 16 }}>
            Tendencia mensual {year}
          </h3>
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              gap: 6,
              height: 160,
              paddingBottom: 8,
            }}
          >
            {mensual.map((m) => (
              <div
                key={m.mes}
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: pctColor(m.disponibilidad, planta.objetivoDisponibilidad),
                  }}
                >
                  {m.disponibilidad.toFixed(0)}%
                </span>
                <div
                  style={{
                    width: "100%",
                    height: `${(m.disponibilidad / maxMensual) * 120}px`,
                    minHeight: 4,
                    background: pctColor(
                      m.disponibilidad,
                      planta.objetivoDisponibilidad,
                    ),
                    borderRadius: "4px 4px 0 0",
                    opacity: 0.85,
                  }}
                />
                <span style={{ fontSize: 11, color: "#64748b" }}>{m.mes}</span>
              </div>
            ))}
          </div>
          <div
            style={{
              borderTop: "1px dashed #e2e8f0",
              paddingTop: 12,
              marginTop: 8,
              fontSize: 12,
              color: "#64748b",
            }}
          >
            Línea de objetivo planta:{" "}
            <strong style={{ color: C.brand }}>
              {planta.objetivoDisponibilidad}%
            </strong>
          </div>
        </div>
      </div>

      {/* ── Equipos de mayor riesgo ───────────────────────────── */}
      <div
        style={{
          background: C.card,
          borderRadius: 12,
          padding: 20,
          marginBottom: 24,
          boxShadow: "0 2px 8px rgba(42,59,118,0.07)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
            flexWrap: "wrap",
            gap: 8,
          }}
        >
          <h3 style={{ color: C.brand, fontSize: 15, fontWeight: 700, margin: 0 }}>
            Equipos críticos — prioridad de intervención
          </h3>
          <div style={{ display: "flex", gap: 8 }}>
            {(["disponibilidad", "paradas"] as const).map((key) => (
              <button
                key={key}
                onClick={() => setSortBy(key)}
                style={{
                  padding: "5px 12px",
                  borderRadius: 6,
                  border: `1px solid ${sortBy === key ? C.brand : "#e2e8f0"}`,
                  background: sortBy === key ? C.brand : "white",
                  color: sortBy === key ? "white" : "#64748b",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {key === "disponibilidad" ? "Menor disponibilidad" : "Más paradas"}
              </button>
            ))}
          </div>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 12,
          }}
        >
          {topRiesgo.map((eq, idx) => (
            <EquipoRiesgoCard key={eq.tagCode} eq={eq} rank={idx + 1} />
          ))}
        </div>
      </div>

      {/* ── Tabla completa por equipo ─────────────────────────── */}
      <div
        style={{
          background: C.card,
          borderRadius: 12,
          overflow: "hidden",
          boxShadow: "0 2px 8px rgba(42,59,118,0.07)",
        }}
      >
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9" }}>
          <h3 style={{ color: C.brand, fontSize: 15, fontWeight: 700, margin: 0 }}>
            Detalle por equipo — acumulado YTD
          </h3>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: 13,
            }}
          >
            <thead>
              <tr style={{ background: "#f8fafc" }}>
                {[
                  "Tag",
                  "Equipo",
                  "Área",
                  "Disponibilidad",
                  "Confiabilidad",
                  "MTBF",
                  "MTTR",
                  "Paradas",
                  "Prev.",
                  "Corr.",
                  "H. parada",
                  "Estado",
                ].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "11px 14px",
                      textAlign: "left",
                      color: C.brand,
                      fontWeight: 600,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedEquipos.map((eq) => (
                <tr
                  key={eq.tagCode}
                  style={{ borderBottom: "1px solid #f1f5f9" }}
                >
                  <td style={{ padding: "10px 14px", fontWeight: 700 }}>
                    {eq.tagCode}
                  </td>
                  <td style={{ padding: "10px 14px", maxWidth: 200 }}>
                    {eq.nombre}
                  </td>
                  <td style={{ padding: "10px 14px" }}>{eq.area}</td>
                  <td
                    style={{
                      padding: "10px 14px",
                      fontWeight: 700,
                      color: pctColor(eq.disponibilidad, AREA_TARGET(eq.area)),
                    }}
                  >
                    {fmtPct(eq.disponibilidad)}
                  </td>
                  <td style={{ padding: "10px 14px" }}>
                    {fmtPct(eq.confiabilidad)}
                  </td>
                  <td style={{ padding: "10px 14px" }}>{fmtMt(eq.mtbf)}</td>
                  <td style={{ padding: "10px 14px" }}>{fmtMt(eq.mttr)}</td>
                  <td style={{ padding: "10px 14px" }}>{eq.paradas}</td>
                  <td style={{ padding: "10px 14px" }}>{eq.preventivo}</td>
                  <td style={{ padding: "10px 14px" }}>{eq.correctivo}</td>
                  <td style={{ padding: "10px 14px", color: C.red }}>
                    {eq.horasParada.toFixed(1)} h
                  </td>
                  <td style={{ padding: "10px 14px" }}>
                    <EstadoBadge estado={eq.ultimoEstado} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Nota metodológica ─────────────────────────────────── */}
      <div
        style={{
          marginTop: 20,
          padding: "14px 18px",
          background: "#f8fafc",
          borderRadius: 8,
          fontSize: 12,
          color: "#64748b",
          lineHeight: 1.6,
        }}
      >
        <strong style={{ color: C.brand }}>Metodología:</strong> Disponibilidad =
        (Horas calendario − Horas parada) / Horas calendario × 100. Período
        acumulado desde el 1 de enero de {year}. Horas parada incluyen registros
        de mantenimiento diario y eventos de parada. MTBF y MTTR calculados
        sobre intervenciones correctivas y paradas registradas. Objetivos por
        área basados en estándares de operación continua en planta
        concentradora.
      </div>
    </div>
  );
};

const AREA_TARGET = (area: string) => {
  const targets: Record<string, number> = {
    Chancado: 92,
    Molienda: 90,
    Flotacion: 88,
    Remolienda: 89,
    Filtrado: 87,
  };
  return targets[area] ?? 90;
};

const EstadoBadge: React.FC<{ estado: string }> = ({ estado }) => {
  const color = ESTADO_COLORS[estado] ?? "#94a3b8";
  return (
    <span
      style={{
        background: `${color}18`,
        color,
        padding: "3px 10px",
        borderRadius: 12,
        fontSize: 11,
        fontWeight: 600,
        textTransform: "capitalize",
      }}
    >
      {estado.replace(/_/g, " ")}
    </span>
  );
};

const EquipoRiesgoCard: React.FC<{ eq: TagAvailability; rank: number }> = ({
  eq,
  rank,
}) => (
  <div
    style={{
      border: "1px solid #f1f5f9",
      borderRadius: 10,
      padding: "14px 16px",
      borderLeft: `4px solid ${pctColor(eq.disponibilidad, AREA_TARGET(eq.area))}`,
    }}
  >
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
      }}
    >
      <div>
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: "#94a3b8",
            textTransform: "uppercase",
          }}
        >
          #{rank} · {eq.area}
        </span>
        <div style={{ fontWeight: 700, color: C.brand, fontSize: 14 }}>
          {eq.tagCode}
        </div>
        <div style={{ fontSize: 12, color: "#64748b" }}>{eq.nombre}</div>
      </div>
      <div style={{ textAlign: "right" }}>
        <div
          style={{
            fontSize: 22,
            fontWeight: 800,
            color: pctColor(eq.disponibilidad, AREA_TARGET(eq.area)),
          }}
        >
          {fmtPct(eq.disponibilidad)}
        </div>
        <div style={{ fontSize: 11, color: "#94a3b8" }}>disponibilidad</div>
      </div>
    </div>
    <div
      style={{
        display: "flex",
        gap: 12,
        marginTop: 10,
        fontSize: 11,
        color: "#64748b",
      }}
    >
      <span>{eq.paradas} parada(s)</span>
      <span>MTBF {fmtMt(eq.mtbf)}</span>
      <span>MTTR {fmtMt(eq.mttr)}</span>
    </div>
  </div>
);

export default PlantAvailabilityReport;
