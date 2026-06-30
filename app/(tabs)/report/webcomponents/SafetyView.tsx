import React, { useMemo } from "react";

interface SafetyViewProps {
  data?: any[];
}

interface FieldEvent {
  id: string;
  titulo: string;
  comentarios: string;
  tipoEvento: string;
  clasificacionHSE: string;
  equipoAfectado: string;
  horasPerdidas: number;
  causa: string;
  servicio: string;
  ait: string;
  fecha: string;
  fechaTs: number;
  hseTareo: number;
}

const isRutaCritica = (value: any): boolean =>
  value === true || String(value || "").trim().toLowerCase() === "si";

const getEventTimestamp = (event: any): number => {
  if (event?.createdAt?.seconds) return event.createdAt.seconds * 1000;
  if (event?.createdAt instanceof Date) return event.createdAt.getTime();
  if (typeof event?.createdAt === "number") return event.createdAt;
  if (event?.fechaPostFormato) {
    const parsed = new Date(event.fechaPostFormato);
    if (!isNaN(parsed.getTime())) return parsed.getTime();
  }
  return 0;
};

const formatFecha = (ts: number): string => {
  if (!ts) return "—";
  return new Date(ts).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const clasificacionColor = (c: string): string => {
  const u = c.toUpperCase();
  if (u === "FAT") return "#7f0000";
  if (u === "LTI") return "#c62828";
  if (u.includes("PRIMEROS")) return "#e65100";
  if (u.includes("NEAR")) return "#f9a825";
  return "#546e7a";
};

const clasificacionLabel = (c: string): string => {
  if (!c) return "Sin clasificar";
  return c;
};

const SafetyView: React.FC<SafetyViewProps> = ({ data }) => {
  const { events, hseEvents, kpis, criticaEnEjecucion, breakdown } = useMemo(() => {
    const services = Array.isArray(data) ? data : [];
    const allEvents: FieldEvent[] = [];

    services.forEach((svc: any) => {
      const svcName = svc.NombreServicio || svc.AITNombreServicio || "—";
      const ait = svc.NumeroAIT || svc.AITNumero || "—";
      const eventList = Array.isArray(svc.events) ? svc.events : [];

      eventList.forEach((ev: any, idx: number) => {
        const fechaTs = getEventTimestamp(ev);
        allEvents.push({
          id: ev.idDocFirestoreDB || ev.unicoID || `${svc.idServiciosAIT}-${idx}`,
          titulo: ev.titulo || "Sin título",
          comentarios: ev.comentarios || "",
          tipoEvento: ev.tipoEvento || "",
          clasificacionHSE: ev.clasificacionHSE || "",
          equipoAfectado: ev.equipoAfectado || "",
          horasPerdidas: Number(ev.horasPerdidas) || 0,
          causa: ev.causa || "",
          servicio: ev.AITNombreServicio || svcName,
          ait,
          fecha: formatFecha(fechaTs),
          fechaTs,
          hseTareo: Number(ev.HSE) || 0,
        });
      });
    });

    allEvents.sort((a, b) => b.fechaTs - a.fechaTs);

    const hseOnly = allEvents.filter(
      (e) =>
        e.tipoEvento === "HSE" ||
        (e.clasificacionHSE && e.clasificacionHSE.trim() !== "")
    );

    const hhPerdidas = hseOnly.reduce((s, e) => s + e.horasPerdidas, 0);
    const hhSupervisionHSE = allEvents.reduce((s, e) => s + e.hseTareo * 12, 0);

    const severe = hseOnly.filter((e) =>
      ["LTI", "FAT"].includes(e.clasificacionHSE.toUpperCase())
    );
    const lastSevere = severe.sort((a, b) => b.fechaTs - a.fechaTs)[0];
    const diasSinLTI = lastSevere
      ? Math.floor((Date.now() - lastSevere.fechaTs) / 86400000)
      : null;

    const nearMiss = hseOnly.filter((e) =>
      e.clasificacionHSE.toUpperCase().includes("NEAR")
    ).length;
    const primerosAuxilios = hseOnly.filter((e) =>
      e.clasificacionHSE.toUpperCase().includes("PRIMEROS")
    ).length;
    const ltiCount = hseOnly.filter((e) => e.clasificacionHSE.toUpperCase() === "LTI").length;
    const fatCount = hseOnly.filter((e) => e.clasificacionHSE.toUpperCase() === "FAT").length;

    const breakdownItems = [
      { label: "Near Miss", count: nearMiss, color: "#f9a825" },
      { label: "Primeros Auxilios", count: primerosAuxilios, color: "#e65100" },
      { label: "LTI", count: ltiCount, color: "#c62828" },
      { label: "FAT", count: fatCount, color: "#7f0000" },
    ].filter((b) => b.count > 0);

    const ganttCritica = services
      .filter((s: any) => s.isGlobalProject && isRutaCritica(s.esRutaCritica))
      .flatMap((s: any) =>
        (Array.isArray(s.activitiesData) ? s.activitiesData : [])
          .filter(
            (a: any) =>
              isRutaCritica(a.esRutaCritica) &&
              !a.RealFechaFin &&
              a.avance !== "100%"
          )
          .map((a: any) => ({
            codigo: a.Codigo || "—",
            nombre: a.NombreServicio || "—",
            tag: a.TagEquipo || s.TagEquipo || "—",
          }))
      )
      .slice(0, 8);

    const hasSevereToday =
      lastSevere && diasSinLTI !== null && diasSinLTI === 0;

    return {
      events: allEvents,
      hseEvents: hseOnly,
      breakdown: breakdownItems,
      criticaEnEjecucion: ganttCritica,
      kpis: {
        totalEventos: allEvents.length,
        eventosHSE: hseOnly.length,
        hhPerdidas,
        hhSupervisionHSE,
        diasSinLTI,
        hasSevereToday,
        hasLTI: ltiCount > 0 || fatCount > 0,
        nearMiss,
      },
    };
  }, [data]);

  const semaforo = kpis.hasSevereToday
    ? { color: "#c62828", bg: "#ffebee", label: "ALERTA CRÍTICA", icon: "🚨", msg: "Se registró LTI/FAT hoy. Activar protocolo de respuesta inmediata." }
    : kpis.hasLTI
    ? { color: "#e65100", bg: "#fff3e0", label: "PRECAUCIÓN", icon: "⚠️", msg: `Último LTI/FAT hace ${kpis.diasSinLTI} días. Reforzar controles en actividades críticas.` }
    : kpis.nearMiss > 0
    ? { color: "#f9a825", bg: "#fffde7", label: "ATENCIÓN", icon: "👁️", msg: `${kpis.nearMiss} Near Miss reportados. Revisar condiciones antes de continuar.` }
    : { color: "#198754", bg: "#e8f5e9", label: "OPERACIÓN SEGURA", icon: "✅", msg: kpis.diasSinLTI !== null ? `${kpis.diasSinLTI} días sin LTI/FAT registrados.` : "Sin incidentes LTI/FAT en bitácora." };

  const maxBreakdown = Math.max(...breakdown.map((b) => b.count), 1);

  return (
    <div style={{ background: "#f0f4f8", minHeight: "100%", paddingBottom: 32 }}>
      <style>{`
        .sf-kpi { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; padding: 16px 16px 0; }
        @media (min-width: 700px) { .sf-kpi { grid-template-columns: repeat(5, 1fr); } }
        .sf-table th { padding: 10px 12px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.3px; text-align: left; background: #1a237e; color: white; }
        .sf-table td { padding: 10px 12px; font-size: 13px; border-bottom: 1px solid #f0f4f8; vertical-align: top; }
        .sf-table tr:hover td { background: #f8fbff; }
      `}</style>

      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #1a237e 0%, #283593 100%)", padding: "20px 20px 24px" }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "white" }}>
          🛡️ Seguridad & HSE — Bitácora de Campo
        </h2>
        <p style={{ margin: "4px 0 0", fontSize: 12, color: "rgba(255,255,255,0.75)" }}>
          Datos reales de eventos reportados · Clasificación HSE · Impacto en horas ·{" "}
          {new Date().toLocaleDateString("es-ES")}
        </p>
      </div>

      {/* Semáforo hero */}
      <div style={{ padding: "16px 16px 0" }}>
        <div
          style={{
            background: semaforo.bg,
            border: `2px solid ${semaforo.color}`,
            borderRadius: 12,
            padding: "20px 24px",
            display: "flex",
            alignItems: "center",
            gap: 20,
            boxShadow: `0 4px 20px ${semaforo.color}22`,
          }}
        >
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              background: semaforo.color,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 36,
              flexShrink: 0,
              boxShadow: `0 0 0 6px ${semaforo.color}33`,
            }}
          >
            {semaforo.icon}
          </div>
          <div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: 1.5,
                color: semaforo.color,
                marginBottom: 4,
              }}
            >
              {semaforo.label}
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#1a1a2e", marginBottom: 4 }}>
              {kpis.diasSinLTI !== null
                ? `${kpis.diasSinLTI} días sin LTI/FAT`
                : "Sin LTI/FAT registrados"}
            </div>
            <div style={{ fontSize: 13, color: "#555", lineHeight: 1.4 }}>{semaforo.msg}</div>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="sf-kpi">
        {[
          { label: "Eventos HSE", value: kpis.eventosHSE, icon: "🦺", color: "#1565c0", sub: "Con clasificación HSE" },
          { label: "HH Perdidas", value: `${kpis.hhPerdidas}h`, icon: "⏱️", color: kpis.hhPerdidas > 0 ? "#c62828" : "#198754", sub: "Impacto acumulado" },
          { label: "Near Miss", value: kpis.nearMiss, icon: "👁️", color: "#f9a825", sub: "Casi accidentes" },
          { label: "HH Supervisión HSE", value: `${kpis.hhSupervisionHSE}h`, icon: "📋", color: "#4527a0", sub: "Personal HSE en tareo" },
          { label: "Total Eventos", value: kpis.totalEventos, icon: "📡", color: "#37474f", sub: "Bitácora completa" },
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
            <div style={{ background: k.color, padding: "8px 12px", display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 16 }}>{k.icon}</span>
              <span style={{ color: "white", fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.4 }}>
                {k.label}
              </span>
            </div>
            <div style={{ padding: "10px 12px" }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: "#1a1a2e" }}>{k.value}</div>
              <div style={{ fontSize: 10, color: "#999", marginTop: 2 }}>{k.sub}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ padding: 16, display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: 16 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 16,
          }}
        >
          {/* Breakdown por clasificación */}
          {breakdown.length > 0 && (
            <div
              style={{
                background: "white",
                borderRadius: 10,
                padding: 20,
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              }}
            >
              <div style={{ fontSize: 15, fontWeight: 700, color: "#1a1a2e", marginBottom: 16 }}>
                📊 Incidentes por Clasificación
              </div>
              {breakdown.map((item) => (
                <div key={item.label} style={{ marginBottom: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#333" }}>{item.label}</span>
                    <span style={{ fontSize: 13, fontWeight: 800, color: item.color }}>{item.count}</span>
                  </div>
                  <div style={{ height: 10, background: "#f0f4f8", borderRadius: 5, overflow: "hidden" }}>
                    <div
                      style={{
                        height: "100%",
                        width: `${(item.count / maxBreakdown) * 100}%`,
                        background: item.color,
                        borderRadius: 5,
                        transition: "width 0.5s",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Actividades críticas sin cerrar */}
          {criticaEnEjecucion.length > 0 && (
            <div
              style={{
                background: "white",
                borderRadius: 10,
                padding: 20,
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                borderLeft: "4px solid #c62828",
              }}
            >
              <div style={{ fontSize: 15, fontWeight: 700, color: "#c62828", marginBottom: 4 }}>
                ⛓️ Ruta Crítica en Ejecución
              </div>
              <div style={{ fontSize: 12, color: "#666", marginBottom: 14 }}>
                Actividades críticas pendientes — priorizar controles HSE
              </div>
              {criticaEnEjecucion.map((act: any) => (
                <div
                  key={act.codigo}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "8px 0",
                    borderBottom: "1px solid #f0f4f8",
                  }}
                >
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: "#c62828",
                      background: "#ffebee",
                      padding: "2px 6px",
                      borderRadius: 4,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {act.codigo}
                  </span>
                  <span style={{ fontSize: 12, color: "#333", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {act.nombre}
                  </span>
                  {act.tag !== "—" && (
                    <span style={{ fontSize: 10, color: "#1565c0", background: "#e3f2fd", padding: "2px 6px", borderRadius: 4 }}>
                      {act.tag}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tabla de eventos HSE */}
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
              padding: "14px 20px",
              borderBottom: "1px solid #e9ecef",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#1a1a2e" }}>
                🦺 Registro de Eventos HSE
              </div>
              <div style={{ fontSize: 11, color: "#6c757d", marginTop: 2 }}>
                Reportados desde campo con tipo &quot;HSE&quot; o clasificación asignada
              </div>
            </div>
            <span
              style={{
                background: "#e8eaf6",
                color: "#1a237e",
                padding: "4px 12px",
                borderRadius: 12,
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              {hseEvents.length} registros
            </span>
          </div>

          {hseEvents.length === 0 ? (
            <div style={{ padding: 40, textAlign: "center", color: "#6c757d" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🛡️</div>
              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>
                Sin eventos HSE registrados
              </div>
              <div style={{ fontSize: 13, maxWidth: 400, margin: "0 auto", lineHeight: 1.5 }}>
                Los supervisores pueden reportar incidentes desde la app seleccionando{" "}
                <strong>Tipo de Evento → HSE</strong> y la clasificación correspondiente
                (Near Miss, Primeros Auxilios, LTI, FAT).
              </div>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className="sf-table" style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    {["Fecha", "Clasificación", "Servicio / AIT", "HH Perd.", "Componente", "Descripción"].map((h) => (
                      <th key={h}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {hseEvents.map((ev) => (
                    <tr
                      key={ev.id}
                      style={{
                        background:
                          ["LTI", "FAT"].includes(ev.clasificacionHSE.toUpperCase())
                            ? "#fff5f5"
                            : "white",
                      }}
                    >
                      <td style={{ whiteSpace: "nowrap", color: "#555", fontSize: 12 }}>{ev.fecha}</td>
                      <td>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "3px 10px",
                            borderRadius: 12,
                            fontSize: 11,
                            fontWeight: 700,
                            color: "white",
                            background: clasificacionColor(ev.clasificacionHSE),
                            whiteSpace: "nowrap",
                          }}
                        >
                          {clasificacionLabel(ev.clasificacionHSE)}
                        </span>
                      </td>
                      <td style={{ fontSize: 12, maxWidth: 200 }}>
                        <div style={{ fontWeight: 600, color: "#333" }}>{ev.servicio}</div>
                        <div style={{ color: "#888", fontSize: 11 }}>AIT {ev.ait}</div>
                      </td>
                      <td
                        style={{
                          textAlign: "center",
                          fontWeight: 700,
                          color: ev.horasPerdidas > 0 ? "#c62828" : "#6c757d",
                        }}
                      >
                        {ev.horasPerdidas > 0 ? `+${ev.horasPerdidas}h` : "—"}
                      </td>
                      <td style={{ fontSize: 12, color: "#555" }}>{ev.equipoAfectado || "—"}</td>
                      <td style={{ fontSize: 12, color: "#444", maxWidth: 280 }}>
                        <div style={{ fontWeight: 600, marginBottom: 2 }}>{ev.titulo}</div>
                        {ev.comentarios && (
                          <div style={{ color: "#777", lineHeight: 1.4 }}>{ev.comentarios}</div>
                        )}
                        {ev.causa && (
                          <div style={{ marginTop: 4, fontSize: 11, color: "#1565c0" }}>
                            Causa: {ev.causa}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SafetyView;
