import React, { useState, useMemo } from "react";
import {
  calculateAvanceFromActivities,
  formatAvancePercent,
  getCompletedPlannedHours,
  getPlannedHoursAtTime,
  getTotalPlannedHours,
  parseActivityDate,
} from "@/utils/calculateAvance";

interface GerenciaDashboardProps {
  data?: any[];
}

const C = {
  brand: "#2A3B76",
  accent: "#1976d2",
  green: "#198754",
  yellow: "#e6a817",
  red: "#dc3545",
  bg: "#f0f4f8",
  card: "#ffffff",
};

const fmtUSD = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);

const isRutaCritica = (v: any) =>
  v === true || String(v || "").trim().toLowerCase() === "si";

const getEventTs = (ev: any): number => {
  if (ev?.createdAt?.seconds) return ev.createdAt.seconds * 1000;
  if (ev?.createdAt instanceof Date) return ev.createdAt.getTime();
  if (ev?.fechaPostFormato) {
    const d = new Date(ev.fechaPostFormato);
    if (!isNaN(d.getTime())) return d.getTime();
  }
  return 0;
};

const mapAreaToProcess = (area: string): string | null => {
  const a = (area || "").toUpperCase();
  if (a.includes("CHANCAD") && a.includes("PRIM")) return "CHANCADO PRIMARIO";
  if (a.includes("CHANCAD") || a.includes("PEBBLE")) return "CHANCADO SECUNDARIO";
  if (a.includes("MOLIEND") || a.includes("SAG")) return "MOLIENDA";
  if (a.includes("FLOT")) return "FLOTACIÓN";
  if (a.includes("ESPESAD") || a.includes("RELAV")) return "ESPESADORES";
  if (a.includes("FILTRO")) return "FILTRADO";
  return null;
};

const PROCESS_CHAIN = [
  { label: "Chancado\nPrimario", key: "CHANCADO PRIMARIO" },
  { label: "Chancado\nSecundario", key: "CHANCADO SECUNDARIO" },
  { label: "Molienda", key: "MOLIENDA" },
  { label: "Flotación", key: "FLOTACIÓN" },
  { label: "Espesadores", key: "ESPESADORES" },
  { label: "Filtrado", key: "FILTRADO" },
];

const semColor = (val: number, ok: number, warn: number, invert = false) => {
  if (!invert) return val >= ok ? C.green : val >= warn ? C.yellow : C.red;
  return val <= ok ? C.green : val <= warn ? C.yellow : C.red;
};

const GerenciaDashboard: React.FC<GerenciaDashboardProps> = ({ data }) => {
  const [tph, setTph] = useState(5000);
  const [margen, setMargen] = useState(10);

  const m = useMemo(() => {
    const services = Array.isArray(data) ? data : [];
    const now = new Date();
    const ganttData = services.filter((s: any) => s.isGlobalProject === true);
    const aitData = services.filter((s: any) => s.isGlobalProject !== true);

    const allActivities: any[] = [];
    ganttData.forEach((svc: any) => {
      (Array.isArray(svc.activitiesData) ? svc.activitiesData : []).forEach(
        (act: any) => allActivities.push({ ...act, _tag: act.TagEquipo || svc.TagEquipo })
      );
    });

    const projectDates = { start: null as Date | null, end: null as Date | null };
    const trackDate = (d: Date | null, kind: "start" | "end") => {
      if (!d) return;
      const key = kind === "start" ? "start" : "end";
      const cur = projectDates[key];
      if (!cur || (kind === "start" ? d < cur : d > cur)) {
        projectDates[key] = d;
      }
    };
    ganttData.forEach((svc: any) => {
      trackDate(parseActivityDate(svc.FechaInicio), "start");
      trackDate(parseActivityDate(svc.FechaFin), "end");
    });
    allActivities.forEach((act: any) => {
      trackDate(parseActivityDate(act.FechaInicio), "start");
      trackDate(parseActivityDate(act.FechaFin), "end");
    });
    const projectStart = projectDates.start;
    const projectEnd = projectDates.end;

    const totalHoras = getTotalPlannedHours(allActivities);
    const avanceReal = calculateAvanceFromActivities(allActivities);
    const startMs = projectStart?.getTime() ?? 0;
    const horasActuales = startMs > 0 ? Math.max(0, (now.getTime() - startMs) / 3600000) : 0;
    const avanceProgramado =
      startMs > 0 && totalHoras > 0 && projectStart
        ? formatAvancePercent(
            getPlannedHoursAtTime(allActivities, projectStart, horasActuales),
            totalHoras
          )
        : 0;
    const avanceGap = avanceReal - avanceProgramado;

    let criticalDelayed = 0;
    let totalDelayHrs = 0;
    const delayedCritical: { codigo: string; nombre: string; hrs: number }[] = [];

    ganttData.forEach((svc: any) => {
      if (!isRutaCritica(svc.esRutaCritica)) return;
      const planEnd = parseActivityDate(svc.FechaFin);
      const avance = parseFloat(svc.AvanceEjecucion) || 0;
      if (planEnd && planEnd < now && avance < 95) {
        criticalDelayed++;
        const hrs = (now.getTime() - planEnd.getTime()) / 3600000;
        totalDelayHrs += hrs;
        delayedCritical.push({
          codigo: svc.Codigo || "—",
          nombre: svc.NombreServicio || "—",
          hrs: Math.round(hrs * 10) / 10,
        });
      }
    });

    allActivities.forEach((act: any) => {
      if (!isRutaCritica(act.esRutaCritica)) return;
      const planEnd = parseActivityDate(act.FechaFin);
      const done = !!(act.RealFechaFin || act.avance === "100%");
      if (planEnd && planEnd < now && !done) {
        const hrs = (now.getTime() - planEnd.getTime()) / 3600000;
        totalDelayHrs += hrs;
        delayedCritical.push({
          codigo: act.Codigo || "—",
          nombre: act.NombreServicio || "—",
          hrs: Math.round(hrs * 10) / 10,
        });
      }
    });

    let actNoEjecutadas = 0;
    allActivities.forEach((act: any) => {
      if (act.RealFechaInicio || act.RealFechaFin) return;
      const planEnd = parseActivityDate(act.FechaFin);
      if (planEnd && planEnd < now) actNoEjecutadas++;
    });

    const hhPlan = Math.round(totalHoras || ganttData.reduce((s, x) => s + (parseFloat(x.HorasTotales) || 0), 0));
    const hhCompletadas = Math.round(getCompletedPlannedHours(allActivities));
    const hhDesvPct = hhPlan > 0 ? Math.round(((hhCompletadas - avanceProgramado / 100 * hhPlan) / hhPlan) * 100) : 0;

    const totalMonto = services.reduce((s, x) => s + (parseFloat(x.Monto) || 0), 0);
    const trabajosAdicionales = aitData.length;
    const hhAdicionales = Math.round(
      aitData.reduce((s, x) => s + (parseFloat(x.HorasTotales) || 0), 0)
    );

    const allEvents = services.flatMap((s: any) =>
      (Array.isArray(s.events) ? s.events : []).map((ev: any) => ({
        ...ev,
        _servicio: s.NombreServicio,
      }))
    );

    const hseEvents = allEvents.filter(
      (e: any) =>
        e.tipoEvento === "HSE" ||
        (e.clasificacionHSE && String(e.clasificacionHSE).trim())
    );
    const hhPerdidasHSE = hseEvents.reduce(
      (s: number, e: any) => s + (Number(e.horasPerdidas) || 0),
      0
    );
    const severe = hseEvents.filter((e: any) =>
      ["LTI", "FAT"].includes(String(e.clasificacionHSE || "").toUpperCase())
    );
    const lastSevere = [...severe].sort((a, b) => getEventTs(b) - getEventTs(a))[0];
    const diasSinLTI = lastSevere
      ? Math.floor((Date.now() - getEventTs(lastSevere)) / 86400000)
      : null;

    const causaMap: Record<string, number> = {};
    allEvents.forEach((e: any) => {
      const c = (e.causa || "").trim();
      if (!c) return;
      causaMap[c] = (causaMap[c] || 0) + 1;
    });
    const paretoCausas = Object.entries(causaMap)
      .map(([causa, count]) => ({ causa, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    const totalCausas = paretoCausas.reduce((s, c) => s + c.count, 0);

    const areaAvailMap: Record<string, { sum: number; n: number }> = {};
    ganttData.forEach((svc: any) => {
      const key = mapAreaToProcess(svc.AreaServicio || "");
      if (!key) return;
      const av = parseFloat(svc.AvanceEjecucion) || calculateAvanceFromActivities(svc.activitiesData);
      if (!areaAvailMap[key]) areaAvailMap[key] = { sum: 0, n: 0 };
      areaAvailMap[key].sum += av;
      areaAvailMap[key].n++;
    });
    const processAvail = PROCESS_CHAIN.map((node) => {
      const e = areaAvailMap[node.key];
      return e && e.n > 0 ? Math.round(e.sum / e.n) : null;
    });
    const availValues = processAvail.filter((v) => v !== null) as number[];
    const bottleneckIdx =
      availValues.length > 0
        ? processAvail.indexOf(Math.min(...availValues.filter((v) => v !== null) as number[]))
        : -1;

    const contratistasMap: Record<string, { plan: number; real: number }> = {};
    services.forEach((svc: any) => {
      const emp = svc.EmpresaMinera || svc.companyName || "Sin asignar";
      if (!contratistasMap[emp]) contratistasMap[emp] = { plan: 0, real: 0 };
      const plan = parseFloat(svc.HorasTotales) || 0;
      const mod = parseFloat(svc.HHModificado) || 0;
      contratistasMap[emp].plan += plan;
      contratistasMap[emp].real += mod > 0 ? mod : plan;
    });
    const contratistas = Object.entries(contratistasMap)
      .map(([name, v]) => ({
        name,
        plan: Math.round(v.plan),
        real: Math.round(v.real),
      }))
      .sort((a, b) => b.plan - a.plan)
      .slice(0, 6);

    const correctivo = services.filter((s) =>
      (s.TipoServicio || "").toLowerCase().includes("correctivo")
    ).length;
    const pctPM = services.length > 0 ? Math.round(((services.length - correctivo) / services.length) * 100) : 0;

    const riskScore = Math.min(
      99,
      Math.round(
        Math.max(0, -avanceGap) * 1.5 +
          criticalDelayed * 8 +
          Math.min(30, totalDelayHrs) +
          (severe.length > 0 ? 20 : 0) +
          actNoEjecutadas * 3
      )
    );

    const alerts: { icon: string; text: string; level: "red" | "yellow" | "green" }[] = [];
    if (severe.length > 0)
      alerts.push({
        icon: "🚨",
        text: `${severe.length} incidente(s) LTI/FAT en bitácora HSE`,
        level: "red",
      });
    if (criticalDelayed > 0 || delayedCritical.length > 0)
      alerts.push({
        icon: "⛓️",
        text: `Ruta crítica con ${Math.max(criticalDelayed, delayedCritical.length)} retraso(s) — +${Math.round(totalDelayHrs)}h acumuladas`,
        level: "red",
      });
    if (avanceGap < -10)
      alerts.push({
        icon: "📉",
        text: `Avance real ${avanceReal}% vs programado ${avanceProgramado}% (Δ ${avanceGap}%)`,
        level: "yellow",
      });
    if (actNoEjecutadas > 0)
      alerts.push({
        icon: "⛔",
        text: `${actNoEjecutadas} actividad(es) del Gantt vencidas sin iniciar`,
        level: "yellow",
      });
    if (trabajosAdicionales > 0)
      alerts.push({
        icon: "➕",
        text: `${trabajosAdicionales} trabajo(s) adicional(es) fuera del plan (+${hhAdicionales}h scope)`,
        level: trabajosAdicionales > 3 ? "yellow" : "green",
      });
    if (paretoCausas[0])
      alerts.push({
        icon: "🔍",
        text: `Causa #1 de demora: ${paretoCausas[0].causa} (${paretoCausas[0].count} eventos)`,
        level: "yellow",
      });
    if (alerts.length === 0)
      alerts.push({
        icon: "✅",
        text: "Parada dentro de parámetros — sin alertas críticas activas",
        level: "green",
      });

    const verdict =
      riskScore >= 60
        ? { label: "RIESGO ALTO", color: C.red, icon: "🚨", msg: "Se requiere escalamiento gerencial y plan de recuperación inmediato." }
        : riskScore >= 30
        ? { label: "ATENCIÓN", color: C.yellow, icon: "⚠️", msg: "Desviaciones detectadas. Monitoreo reforzado en ruta crítica y contratistas." }
        : { label: "EN CONTROL", color: C.green, icon: "✅", msg: "La parada avanza dentro de los parámetros planificados." };

    return {
      avanceReal,
      avanceProgramado,
      avanceGap,
      criticalDelayed,
      totalDelayHrs: Math.round(totalDelayHrs * 10) / 10,
      delayedCritical: delayedCritical.slice(0, 5),
      actNoEjecutadas,
      hhPlan,
      hhCompletadas,
      hhDesvPct,
      totalMonto,
      trabajosAdicionales,
      hhAdicionales,
      hseEvents: hseEvents.length,
      hhPerdidasHSE,
      diasSinLTI,
      hasLTI: severe.length > 0,
      paretoCausas,
      totalCausas,
      processAvail,
      bottleneckIdx,
      contratistas,
      pctPM,
      pctCorrectivo: 100 - pctPM,
      riskScore,
      alerts,
      verdict,
      totalServicios: services.length,
      totalActividades: allActivities.length,
      hasData: services.length > 0,
    };
  }, [data]);

  const perdidaUSD = m.totalDelayHrs * tph * margen;
  const riskColor = m.riskScore >= 60 ? C.red : m.riskScore >= 30 ? C.yellow : C.green;

  if (!m.hasData) {
    return (
      <div style={{ background: C.bg, minHeight: "100%", paddingBottom: 32 }}>
        <div style={{ background: `linear-gradient(135deg, ${C.brand}, #1565c0)`, padding: "24px 20px" }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "white" }}>
            📊 Dashboard Gerencia
          </h2>
        </div>
        <div style={{ margin: 24, padding: 40, background: "white", borderRadius: 12, textAlign: "center", color: "#6c757d" }}>
          Cargue el proyecto Gantt para ver el panel ejecutivo.
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: C.bg, minHeight: "100%", paddingBottom: 40 }}>
      <style>{`
        .gd-kpi { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; padding: 16px 16px 0; }
        @media (min-width: 800px) { .gd-kpi { grid-template-columns: repeat(4, 1fr); } }
        @media (min-width: 1200px) { .gd-kpi { grid-template-columns: repeat(6, 1fr); } }
        .gd-2col { display: grid; grid-template-columns: 1fr; gap: 16px; padding: 0 16px; }
        @media (min-width: 900px) { .gd-2col { grid-template-columns: 1fr 1fr; } }
        .gd-table th { background: linear-gradient(135deg, #2A3B76, #1565c0); color: white; padding: 10px 12px; font-size: 11px; font-weight: 700; text-transform: uppercase; text-align: left; }
        .gd-table td { padding: 10px 12px; font-size: 13px; border-bottom: 1px solid #f0f4f8; }
        .gd-table tr:hover td { background: #f8fbff; }
      `}</style>

      {/* Header */}
      <div style={{ background: `linear-gradient(135deg, ${C.brand} 0%, #0d47a1 100%)`, padding: "20px 20px 24px" }}>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "white" }}>
          📊 Centro de Comando — Gerencia
        </h2>
        <p style={{ margin: "6px 0 0", fontSize: 12, color: "rgba(255,255,255,0.75)" }}>
          {m.totalServicios} servicios · {m.totalActividades} actividades Gantt · Datos en vivo ·{" "}
          {new Date().toLocaleString("es-ES")}
        </p>
      </div>

      {/* Veredicto ejecutivo */}
      <div style={{ padding: "16px 16px 0" }}>
        <div
          style={{
            background: "white",
            borderRadius: 14,
            padding: "24px 28px",
            display: "flex",
            alignItems: "center",
            gap: 24,
            boxShadow: `0 4px 24px ${m.verdict.color}22`,
            border: `2px solid ${m.verdict.color}`,
          }}
        >
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: m.verdict.color,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 40,
              flexShrink: 0,
              boxShadow: `0 0 0 8px ${m.verdict.color}22`,
            }}
          >
            {m.verdict.icon}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.5, color: m.verdict.color }}>
              {m.verdict.label}
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color: "#1a1a2e", margin: "4px 0 8px" }}>
              Avance Real {m.avanceReal}% · Programado {m.avanceProgramado}%
              <span
                style={{
                  marginLeft: 12,
                  fontSize: 18,
                  color: m.avanceGap >= 0 ? C.green : C.red,
                }}
              >
                ({m.avanceGap >= 0 ? "+" : ""}
                {m.avanceGap}%)
              </span>
            </div>
            <div style={{ fontSize: 14, color: "#555", lineHeight: 1.5 }}>{m.verdict.msg}</div>
          </div>
          <div style={{ textAlign: "center", flexShrink: 0 }}>
            <div style={{ fontSize: 11, color: "#888", fontWeight: 600, marginBottom: 4 }}>
              ÍNDICE DE RIESGO
            </div>
            <div style={{ fontSize: 48, fontWeight: 900, color: riskColor, lineHeight: 1 }}>
              {m.riskScore}
            </div>
            <div style={{ fontSize: 10, color: "#aaa" }}>/ 100</div>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="gd-kpi">
        {[
          { label: "Avance Real", value: `${m.avanceReal}%`, sub: "Por horas programadas", color: semColor(m.avanceReal, 70, 40), icon: "✅" },
          { label: "Avance Programado", value: `${m.avanceProgramado}%`, sub: "Curva S al momento", color: C.accent, icon: "📅" },
          { label: "Retraso Ruta Crítica", value: `+${m.totalDelayHrs}h`, sub: `${m.criticalDelayed} paquetes críticos`, color: semColor(m.totalDelayHrs, 2, 8, true), icon: "⛓️" },
          { label: "HH Ejecutadas", value: `${m.hhCompletadas}h`, sub: `De ${m.hhPlan}h planificadas`, color: C.brand, icon: "👷" },
          { label: "HSE — HH Perdidas", value: `${m.hhPerdidasHSE}h`, sub: m.diasSinLTI !== null ? `${m.diasSinLTI}d sin LTI/FAT` : "Sin LTI/FAT", color: m.hhPerdidasHSE > 0 ? C.red : C.green, icon: "🦺" },
          { label: "Scope Adicional", value: `+${m.hhAdicionales}h`, sub: `${m.trabajosAdicionales} trabajos AIT`, color: m.trabajosAdicionales > 3 ? C.yellow : C.green, icon: "➕" },
        ].map((k, i) => (
          <div key={i} style={{ background: "white", borderRadius: 10, overflow: "hidden", boxShadow: "0 2px 10px rgba(0,0,0,0.07)" }}>
            <div style={{ background: k.color, padding: "8px 12px", display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 16 }}>{k.icon}</span>
              <span style={{ color: "white", fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.4 }}>{k.label}</span>
            </div>
            <div style={{ padding: "10px 12px" }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: "#1a1a2e" }}>{k.value}</div>
              <div style={{ fontSize: 10, color: "#999", marginTop: 2 }}>{k.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Alertas accionables */}
      <div style={{ padding: "16px 16px 0" }}>
        <div style={{ background: "white", borderRadius: 12, padding: "16px 20px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.brand, marginBottom: 12 }}>
            🎯 Acciones Prioritarias para Gerencia
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {m.alerts.map((a, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 14px",
                  borderRadius: 8,
                  background:
                    a.level === "red" ? "#fff5f5" : a.level === "yellow" ? "#fffde7" : "#e8f5e9",
                  borderLeft: `4px solid ${a.level === "red" ? C.red : a.level === "yellow" ? C.yellow : C.green}`,
                }}
              >
                <span style={{ fontSize: 18 }}>{a.icon}</span>
                <span style={{ fontSize: 13, color: "#333", fontWeight: 500 }}>{a.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Calculadora pérdida + Tren proceso */}
      <div className="gd-2col" style={{ marginTop: 16 }}>
        <div style={{ background: "white", borderRadius: 12, padding: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#1a1a2e", marginBottom: 4 }}>
            💰 Impacto Económico del Retraso
          </div>
          <div style={{ fontSize: 12, color: "#888", marginBottom: 16 }}>
            Horas críticas perdidas × TPH × margen
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "flex-end" }}>
            <div>
              <label style={{ fontSize: 10, color: "#999", fontWeight: 600 }}>TPH</label>
              <input
                type="number"
                value={tph}
                onChange={(e) => setTph(Number(e.target.value))}
                style={{ display: "block", border: `1px solid ${C.accent}`, borderRadius: 6, padding: "8px 12px", fontSize: 15, fontWeight: 700, width: 100, marginTop: 4 }}
              />
            </div>
            <span style={{ fontSize: 20, color: "#ccc", paddingBottom: 8 }}>×</span>
            <div>
              <label style={{ fontSize: 10, color: "#999", fontWeight: 600 }}>USD/Ton</label>
              <input
                type="number"
                value={margen}
                onChange={(e) => setMargen(Number(e.target.value))}
                style={{ display: "block", border: `1px solid ${C.accent}`, borderRadius: 6, padding: "8px 12px", fontSize: 15, fontWeight: 700, width: 90, marginTop: 4 }}
              />
            </div>
            <span style={{ fontSize: 20, color: "#ccc", paddingBottom: 8 }}>×</span>
            <div style={{ padding: "8px 12px", background: "#f8f9fa", borderRadius: 6, fontWeight: 700, color: "#666" }}>
              {m.totalDelayHrs}h
            </div>
            <span style={{ fontSize: 20, color: "#ccc", paddingBottom: 8 }}>=</span>
            <div style={{ background: `${C.red}12`, border: `2px solid ${C.red}`, borderRadius: 10, padding: "12px 20px" }}>
              <div style={{ fontSize: 10, color: C.red, fontWeight: 700 }}>PÉRDIDA ESTIMADA</div>
              <div style={{ fontSize: 28, fontWeight: 900, color: C.red }}>{fmtUSD(perdidaUSD)}</div>
            </div>
          </div>
          {m.totalMonto > 0 && (
            <div style={{ marginTop: 12, fontSize: 12, color: "#888" }}>
              Monto contratos cargados: <strong>{fmtUSD(m.totalMonto)}</strong>
            </div>
          )}
        </div>

        <div style={{ background: "white", borderRadius: 12, padding: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#1a1a2e", marginBottom: 4 }}>
            🔗 Tren de Proceso — Avance por Área
          </div>
          <div style={{ fontSize: 12, color: "#888", marginBottom: 16 }}>
            Cuello de botella identificado en rojo
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", overflowX: "auto", gap: 4 }}>
            {PROCESS_CHAIN.map((node, i) => {
              const avail = m.processAvail[i];
              if (avail === null) return null;
              const color = avail >= 80 ? C.green : avail >= 60 ? C.yellow : C.red;
              const isBottleneck = i === m.bottleneckIdx;
              return (
                <div key={node.key} style={{ textAlign: "center", minWidth: 72 }}>
                  <div
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: "50%",
                      border: `3px solid ${color}`,
                      background: `${color}15`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto",
                      fontWeight: 800,
                      fontSize: 14,
                      color,
                      boxShadow: isBottleneck ? `0 0 0 4px ${color}40` : "none",
                    }}
                  >
                    {avail}%
                  </div>
                  <div style={{ fontSize: 10, fontWeight: 600, color: "#555", marginTop: 6, whiteSpace: "pre-line", lineHeight: 1.2 }}>
                    {node.label}
                  </div>
                  {isBottleneck && (
                    <div style={{ fontSize: 9, color: C.red, fontWeight: 700, marginTop: 2 }}>CUELLO</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Pareto + PM/Correctivo */}
      <div className="gd-2col" style={{ marginTop: 16 }}>
        <div style={{ background: "white", borderRadius: 12, padding: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#1a1a2e", marginBottom: 16 }}>
            📊 Top Causas de Demora
            <span style={{ fontSize: 11, fontWeight: 400, color: "#888", marginLeft: 8 }}>
              (bitácora de campo)
            </span>
          </div>
          {m.paretoCausas.length === 0 ? (
            <div style={{ color: "#999", fontSize: 13, textAlign: "center", padding: 20 }}>
              Sin causas registradas en eventos. Use el campo &quot;Causa&quot; al reportar desde campo.
            </div>
          ) : (
            m.paretoCausas.map((item, i) => {
              const pct = m.totalCausas > 0 ? Math.round((item.count / m.totalCausas) * 100) : 0;
              const barColor = i === 0 ? C.red : i === 1 ? C.yellow : "#6c757d";
              return (
                <div key={item.causa} style={{ marginBottom: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#333" }}>{item.causa}</span>
                    <span style={{ fontSize: 12, color: "#888" }}>{pct}% · {item.count} eventos</span>
                  </div>
                  <div style={{ height: 10, background: "#f0f4f8", borderRadius: 5, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${pct}%`, background: barColor, borderRadius: 5 }} />
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div style={{ background: "white", borderRadius: 12, padding: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#1a1a2e", marginBottom: 16 }}>
            📋 Mix PM vs Correctivo
          </div>
          {[
            { label: "Preventivo / PM", pct: m.pctPM, color: C.green },
            { label: "Correctivo", pct: m.pctCorrectivo, color: m.pctCorrectivo > 30 ? C.red : C.green },
          ].map((item) => (
            <div key={item.label} style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{item.label}</span>
                <span style={{ fontSize: 16, fontWeight: 800, color: item.color }}>{item.pct}%</span>
              </div>
              <div style={{ height: 14, background: "#f0f4f8", borderRadius: 7, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${item.pct}%`, background: item.color, borderRadius: 7 }} />
              </div>
            </div>
          ))}
          {m.pctCorrectivo > 30 && (
            <div style={{ background: "#fff3cd", padding: "8px 12px", borderRadius: 6, fontSize: 12, color: "#856404" }}>
              ⚠️ Correctivo supera 30% — revisar madurez del plan de mantenimiento
            </div>
          )}
        </div>
      </div>

      {/* Contratistas + Retrasos críticos */}
      <div style={{ padding: 16 }}>
        <div style={{ background: "white", borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", overflow: "hidden", marginBottom: 16 }}>
          <div style={{ padding: "14px 20px", borderBottom: "1px solid #eee" }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#1a1a2e" }}>🏗️ Desempeño por Contratista</div>
            <div style={{ fontSize: 11, color: "#888" }}>HH planificadas vs ejecutadas</div>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table className="gd-table" style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["Contratista", "HH Plan", "HH Real", "Δ", "Estado"].map((h) => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {m.contratistas.map((c) => {
                  const delta = c.real - c.plan;
                  const pct = c.plan > 0 ? Math.round((delta / c.plan) * 100) : 0;
                  const status = pct <= 5 ? "Óptimo" : pct <= 15 ? "Aceptable" : "Crítico";
                  const sc = pct <= 5 ? C.green : pct <= 15 ? C.yellow : C.red;
                  return (
                    <tr key={c.name}>
                      <td style={{ fontWeight: 700, color: C.brand }}>{c.name}</td>
                      <td>{c.plan.toLocaleString()}</td>
                      <td>{c.real.toLocaleString()}</td>
                      <td style={{ fontWeight: 700, color: delta > 0 ? C.red : C.green }}>
                        {delta > 0 ? "+" : ""}
                        {delta.toLocaleString()} ({pct > 0 ? "+" : ""}
                        {pct}%)
                      </td>
                      <td>
                        <span style={{ background: `${sc}22`, color: sc, padding: "3px 10px", borderRadius: 12, fontSize: 11, fontWeight: 700 }}>
                          {status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {m.delayedCritical.length > 0 && (
          <div style={{ background: "white", borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", overflow: "hidden" }}>
            <div style={{ padding: "14px 20px", borderBottom: "1px solid #ffcdd2", background: "#fff5f5" }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: C.red }}>⛓️ Retrasos en Ruta Crítica</div>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table className="gd-table" style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    {["WBS", "Actividad", "Retraso"].map((h) => (
                      <th key={h}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {m.delayedCritical.map((d, i) => (
                    <tr key={`${d.codigo}-${i}`}>
                      <td style={{ fontWeight: 700, color: C.red }}>{d.codigo}</td>
                      <td>{d.nombre}</td>
                      <td style={{ fontWeight: 700, color: C.red }}>+{d.hrs}h</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GerenciaDashboard;
