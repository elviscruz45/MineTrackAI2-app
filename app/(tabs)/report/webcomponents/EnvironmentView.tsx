import React, { useState } from "react";

// Define tipos para datos ambientales
interface IncidenteAmbiental {
  id: string;
  fecha: string;
  tipo: "Derrame" | "Emisión" | "Residuo" | "Agua" | "Otro";
  gravedad: "Crítico" | "Mayor" | "Menor";
  ubicacion: string;
  estado: "Activo" | "Contenido" | "Resuelto";
  descripcion: string;
  areaImpacto: string[];
  accionesMitigacion: string[];
  equipoResponsable: string;
}

interface EventoAmbientalMantenimiento {
  codigo: string;
  nombre: string;
  fechaInicio: string;
  fechaFin: string;
  duracion: number;
  estado: "Pendiente" | "En Progreso" | "Completado";
  area: string;
  impactoAmbiental: "Alto" | "Medio" | "Bajo" | "Ninguno";
  recursos: string[];
  responsable: string;
  medidas: string[];
}

interface KPIAmbiental {
  categoria: string;
  metricas: {
    etiqueta: string;
    actual: number;
    meta: number;
    unidad: string;
    tendencia: "mejorando" | "declinando" | "estable";
    cumplimiento: "dentro" | "cerca" | "excedido";
  }[];
}

interface Props {
  selectedProject?: string;
}

const EnvironmentView: React.FC<Props> = ({ selectedProject }) => {
  const [activeTab, setActiveTab] = useState<
    "Indicadores" | "Incidentes" | "Mantenimiento"
  >("Indicadores");
  const [filtroImpacto, setFiltroImpacto] = useState<
    "Todos" | "Alto" | "Medio" | "Bajo" | "Ninguno"
  >("Todos");

  // KPIs ambientales de ejemplo
  const kpisAmbientales: KPIAmbiental[] = [
    {
      categoria: "Gestión del Agua",
      metricas: [
        {
          etiqueta: "Consumo de Agua",
          actual: 850,
          meta: 1000,
          unidad: "m³/día",
          tendencia: "mejorando",
          cumplimiento: "dentro",
        },
        {
          etiqueta: "Tasa de Reciclaje de Agua",
          actual: 85,
          meta: 80,
          unidad: "%",
          tendencia: "mejorando",
          cumplimiento: "dentro",
        },
        {
          etiqueta: "Nivel de pH",
          actual: 7.2,
          meta: 7.0,
          unidad: "pH",
          tendencia: "estable",
          cumplimiento: "dentro",
        },
      ],
    },
    {
      categoria: "Calidad del Aire",
      metricas: [
        {
          etiqueta: "Emisiones de Polvo",
          actual: 48,
          meta: 45,
          unidad: "µg/m³",
          tendencia: "declinando",
          cumplimiento: "cerca",
        },
        {
          etiqueta: "Emisiones de CO2",
          actual: 95,
          meta: 100,
          unidad: "ton/día",
          tendencia: "mejorando",
          cumplimiento: "dentro",
        },
      ],
    },
    {
      categoria: "Gestión de Residuos",
      metricas: [
        {
          etiqueta: "Reciclaje de Residuos Sólidos",
          actual: 75,
          meta: 80,
          unidad: "%",
          tendencia: "mejorando",
          cumplimiento: "cerca",
        },
        {
          etiqueta: "Residuos Peligrosos",
          actual: 3.2,
          meta: 4.0,
          unidad: "ton/día",
          tendencia: "mejorando",
          cumplimiento: "dentro",
        },
      ],
    },
    {
      categoria: "Eficiencia Energética",
      metricas: [
        {
          etiqueta: "Consumo de Energía",
          actual: 280,
          meta: 300,
          unidad: "MWh/día",
          tendencia: "mejorando",
          cumplimiento: "dentro",
        },
        {
          etiqueta: "Uso de Energía Renovable",
          actual: 28,
          meta: 30,
          unidad: "%",
          tendencia: "mejorando",
          cumplimiento: "cerca",
        },
      ],
    },
  ];

  // Incidentes ambientales de ejemplo
  const incidentesAmbientales: IncidenteAmbiental[] = [
    {
      id: "ENV-001",
      fecha: "2025-08-09",
      tipo: "Agua",
      gravedad: "Menor",
      ubicacion: "Área de Chancado Primario - Sistema de Drenaje",
      estado: "Resuelto",
      descripcion:
        "Niveles elevados de sedimentos detectados en la descarga de agua",
      areaImpacto: ["Cuenca local", "Pozas de sedimentación"],
      accionesMitigacion: [
        "Incremento del tiempo de sedimentación en pozas de retención",
        "Sistema de filtración adicional instalado",
        "Monitoreo diario de calidad de agua implementado",
      ],
      equipoResponsable: "Gestión Ambiental",
    },
    {
      id: "ENV-002",
      fecha: "2025-08-08",
      tipo: "Emisión",
      gravedad: "Mayor",
      ubicacion: "Sistema de Colección de Polvo del Chancador",
      estado: "Activo",
      descripcion:
        "Mal funcionamiento del sistema de supresión de polvo que lleva a mayores emisiones de partículas",
      areaImpacto: [
        "Calidad del aire",
        "Seguridad del trabajador",
        "Comunidad local",
      ],
      accionesMitigacion: [
        "Reparación de emergencia del sistema de colección de polvo",
        "Reducción temporal de operaciones",
        "Notificación emitida a la comunidad",
      ],
      equipoResponsable: "Mantenimiento y Medio Ambiente",
    },
    {
      id: "ENV-003",
      fecha: "2025-08-12",
      tipo: "Derrame",
      gravedad: "Mayor",
      ubicacion: "Alimentador Pebbles 3M - Sistema Hidráulico",
      estado: "Contenido",
      descripcion:
        "Fuga de aceite hidráulico durante operaciones de mantenimiento en Alimentador Pebbles 3M",
      areaImpacto: [
        "Suelo circundante",
        "Posible filtración a agua subterránea",
      ],
      accionesMitigacion: [
        "Contención inmediata del derrame con materiales absorbentes",
        "Excavación de suelo contaminado",
        "Análisis de muestras de suelo y agua cercanos",
        "Revisión de protocolos de mantenimiento",
      ],
      equipoResponsable: "Equipo de Respuesta Ambiental",
    },
  ];

  // Eventos de mantenimiento con impacto ambiental
  const eventosAmbientalesMantenimiento: EventoAmbientalMantenimiento[] = [
    {
      codigo: "1.1.1.1",
      nombre:
        "PM Alimentador Pebbles 3M - PM chute de descarga hacia la chancadora",
      fechaInicio: "31/05/25 08:00",
      fechaFin: "02/06/25 08:00",
      duracion: 48,
      estado: "Completado",
      area: "Chancado Pebbles",
      impactoAmbiental: "Medio",
      recursos: ["Mecánico 1", "Mecánico 2", "Supervisor Ambiental"],
      responsable: "F. García",
      medidas: [
        "Control de polvo durante mantenimiento",
        "Manejo de aceites usados según protocolo",
        "Monitoreo de niveles de ruido",
      ],
    },
    {
      codigo: "1.1.1.1.3",
      nombre: "PM chute de descarga hacia la chancadora",
      fechaInicio: "03/06/25 20:00",
      fechaFin: "04/06/25 20:00",
      duracion: 24,
      estado: "Completado",
      area: "Chancado Pebbles",
      impactoAmbiental: "Alto",
      recursos: ["Mecánico 1", "Mecánico 4", "Soldador", "Monitor Ambiental"],
      responsable: "F. García",
      medidas: [
        "Uso de barreras para contención de polvo",
        "Sistemas de supresión de polvo activos",
        "Monitoreo de calidad de aire en tiempo real",
        "Manejo especial de residuos de soldadura",
      ],
    },
    {
      codigo: "2.1.1.1.4",
      nombre: "Cambio de templadores metálicos (a condición)",
      fechaInicio: "03/06/25 20:00",
      fechaFin: "04/06/25 08:00",
      duracion: 12,
      estado: "Completado",
      area: "Faja Pebbles",
      impactoAmbiental: "Bajo",
      recursos: ["Mecánico 5", "Ayudante"],
      responsable: "C. López",
      medidas: [
        "Recogida de residuos metálicos para reciclaje",
        "Minimización de ruido durante operaciones nocturnas",
      ],
    },
    {
      codigo: "2.1.1.1.7",
      nombre: "Reparación de mesa de faja (lado cola)",
      fechaInicio: "05/06/25 08:00",
      fechaFin: "05/06/25 20:00",
      duracion: 12,
      estado: "Completado",
      area: "Faja Pebbles",
      impactoAmbiental: "Bajo",
      recursos: ["Mecánico 3", "Soldador"],
      responsable: "C. López",
      medidas: [
        "Prevención de caída de materiales",
        "Uso de técnicas de soldadura de bajo impacto",
      ],
    },
    {
      codigo: "2.1.1.1.13",
      nombre: "PM Magneto 23",
      fechaInicio: "08/06/25 08:00",
      fechaFin: "08/06/25 20:00",
      duracion: 12,
      estado: "Pendiente",
      area: "Faja Pebbles",
      impactoAmbiental: "Ninguno",
      recursos: ["Eléctrico 1", "Eléctrico 2"],
      responsable: "M. Torres",
      medidas: [
        "Manejo adecuado de componentes eléctricos",
        "Gestión de residuos electrónicos",
      ],
    },
    {
      codigo: "1.1.1.1.10",
      nombre: "Cambio de liners superiores (lado descarga de silo)",
      fechaInicio: "08/06/25 08:00",
      fechaFin: "08/06/25 20:00",
      duracion: 12,
      estado: "Pendiente",
      area: "Chancado Pebbles",
      impactoAmbiental: "Alto",
      recursos: ["Mecánico 1", "Mecánico 3", "Soldador", "Monitor Ambiental"],
      responsable: "F. García",
      medidas: [
        "Controles de polvo reforzados",
        "Monitoreo continuo de partículas en el aire",
        "Supresión activa de polvo mediante nebulización",
        "Plan de manejo especial de residuos metálicos",
      ],
    },
  ];

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case "Activo":
      case "Pendiente":
        return "#dc3545";
      case "Contenido":
      case "En Progreso":
        return "#ffc107";
      case "Resuelto":
      case "Completado":
        return "#198754";
      default:
        return "#6c757d";
    }
  };

  const getSeverityColor = (gravedad: string) => {
    switch (gravedad) {
      case "Crítico":
        return "#dc3545";
      case "Mayor":
        return "#ffc107";
      case "Menor":
        return "#198754";
      default:
        return "#6c757d";
    }
  };

  const getImpactColor = (impacto: string) => {
    switch (impacto) {
      case "Alto":
        return "#dc3545";
      case "Medio":
        return "#ffc107";
      case "Bajo":
        return "#198754";
      case "Ninguno":
        return "#6c757d";
      default:
        return "#6c757d";
    }
  };

  const getComplianceColor = (cumplimiento: string) => {
    switch (cumplimiento) {
      case "dentro":
        return "#198754";
      case "cerca":
        return "#ffc107";
      case "excedido":
        return "#dc3545";
      default:
        return "#6c757d";
    }
  };

  // Filtra los eventos de mantenimiento según el filtro seleccionado
  const eventosFiltrados =
    filtroImpacto === "Todos"
      ? eventosAmbientalesMantenimiento
      : eventosAmbientalesMantenimiento.filter(
          (evento) => evento.impactoAmbiental === filtroImpacto
        );

  // Calcular estadísticas ambientales
  const totalEventosMantenimiento = eventosAmbientalesMantenimiento.length;
  const eventosAltoImpacto = eventosAmbientalesMantenimiento.filter(
    (e) => e.impactoAmbiental === "Alto"
  ).length;
  const porcentajeAltoImpacto = Math.round(
    (eventosAltoImpacto / totalEventosMantenimiento) * 100
  );

  const medidasAmbientales = eventosAmbientalesMantenimiento.flatMap(
    (e) => e.medidas
  ).length;
  const medidasPromedio =
    Math.round((medidasAmbientales / totalEventosMantenimiento) * 10) / 10;

  // ── Design tokens ──
  const D = { navy: "#2A3B76", teal: "#00897b", green: "#198754", red: "#e53935", amber: "#f9a825", blue: "#1976d2", bg: "#f0f4f8", card: "#ffffff", border: "#e9ecef" };
  const catColors: Record<string, string> = { "Gestión del Agua": "#0288d1", "Calidad del Aire": "#43a047", "Gestión de Residuos": "#6d4c41", "Eficiencia Energética": "#f9a825" };
  const catIcons: Record<string, string> = { "Gestión del Agua": "💧", "Calidad del Aire": "🌿", "Gestión de Residuos": "♻️", "Eficiencia Energética": "⚡" };

  const heroEnv = [
    { label: "Agua Reciclada", value: "85%", trend: "+5%", good: true, sub: "Meta 80% · Consumo 850 m³/d", color: "#0288d1" },
    { label: "Emisiones CO₂", value: "95 t/d", trend: "-5%", good: true, sub: "Meta ≤100 t/d", color: "#43a047" },
    { label: "Reciclaje Residuos", value: "75%", trend: "+3%", good: false, sub: "Meta 80%", color: "#6d4c41" },
    { label: "Energía Renovable", value: "28%", trend: "+2%", good: false, sub: "Meta 30%", color: "#f9a825" },
    { label: "Alto Impacto Ambiental", value: `${porcentajeAltoImpacto}%`, trend: "", good: porcentajeAltoImpacto <= 20, sub: `${eventosAltoImpacto}/${totalEventosMantenimiento} actividades`, color: porcentajeAltoImpacto > 20 ? D.red : D.green },
    { label: "Medidas de Control", value: `${medidasAmbientales}`, trend: "", good: true, sub: `${medidasPromedio} promedio/actividad`, color: D.teal },
  ];

  return (
    <div style={{ background: D.bg, minHeight: "100%", paddingBottom: 32 }}>
      <style>{`
        .ev-tab { padding: 7px 16px; border-radius: 20px; cursor: pointer; font-size: 12px; font-weight: 600; border: none; transition: all 0.2s; }
        .ev-table th { background: linear-gradient(135deg, #00695c, #00897b); color: white; padding: 10px 14px; font-size: 12px; font-weight: 600; text-align: left; white-space: nowrap; }
        .ev-table td { padding: 10px 14px; font-size: 12px; border-bottom: 1px solid #f0f4f8; vertical-align: middle; }
        .ev-table tr:hover td { background: #f0faf8; }
        .ev-badge { display: inline-block; padding: 3px 9px; border-radius: 12px; font-size: 11px; font-weight: 700; color: white; white-space: nowrap; }
      `}</style>

      {/* ── PAGE HEADER ──────────────────────────────────────────────── */}
      <div style={{ background: "linear-gradient(135deg, #004d40 0%, #00695c 100%)", padding: "20px 20px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "white" }}>
              🌿 &nbsp;Medio Ambiente & Sostenibilidad
            </h2>
            <p style={{ margin: "4px 0 0", fontSize: 12, color: "rgba(255,255,255,0.7)" }}>
              {selectedProject ? `Proyecto: ${selectedProject} · ` : ""}Indicadores ambientales y gestión de riesgos · {new Date().toLocaleDateString("es-ES")}
            </p>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {(["Indicadores", "Incidentes", "Mantenimiento"] as const).map((t) => (
              <button key={t} className="ev-tab" onClick={() => setActiveTab(t)}
                style={{ background: activeTab === t ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.08)", color: activeTab === t ? "white" : "rgba(255,255,255,0.6)", border: activeTab === t ? "1px solid rgba(255,255,255,0.4)" : "1px solid transparent" }}>
                {t === "Indicadores" ? "📊 Indicadores" : t === "Incidentes" ? "⚠️ Incidentes" : "🔧 Mantenimiento"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── HERO KPI STRIP ───────────────────────────────────────────── */}
      <div style={{ padding: "16px 16px 0" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12, marginBottom: 20 }}>
          {heroEnv.map((k, i) => (
            <div key={i} style={{ background: D.card, borderRadius: 10, overflow: "hidden", boxShadow: "0 2px 10px rgba(0,0,0,0.07)" }}>
              <div style={{ background: k.color, padding: "8px 12px", display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(255,255,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>
                  {["💧","🌿","♻️","⚡","⚠️","🛡️"][i]}
                </div>
                <span style={{ color: "white", fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, lineHeight: 1.2 }}>{k.label}</span>
              </div>
              <div style={{ padding: "8px 12px" }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: "#1a1a2e" }}>{k.value}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 3 }}>
                  {k.trend && <span style={{ fontSize: 10, fontWeight: 700, color: k.good ? D.green : D.red }}>{k.good ? "▲" : "▼"} {k.trend}</span>}
                  <span style={{ fontSize: 9, color: "#999", lineHeight: 1.3 }}>{k.sub}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: "0 16px 16px" }}>

        {/* ── INDICADORES TAB ───────────────────────────────────────── */}
        {activeTab === "Indicadores" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {kpisAmbientales.map((cat) => {
              const color = catColors[cat.categoria] || D.teal;
              const icon = catIcons[cat.categoria] || "📊";
              return (
                <div key={cat.categoria} style={{ background: D.card, borderRadius: 10, overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
                  <div style={{ background: `linear-gradient(135deg, ${color}dd, ${color})`, padding: "12px 20px", display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 20 }}>{icon}</span>
                    <h3 style={{ margin: 0, color: "white", fontSize: 14, fontWeight: 700 }}>{cat.categoria}</h3>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 0 }}>
                    {cat.metricas.map((m, mi) => {
                      const pct = Math.min(100, Math.round((m.actual / m.meta) * 100));
                      const cc = getComplianceColor(m.cumplimiento);
                      const trendColor = m.tendencia === "mejorando" ? D.green : m.tendencia === "declinando" ? D.red : "#888";
                      return (
                        <div key={mi} style={{ padding: "16px 20px", borderRight: mi < cat.metricas.length - 1 ? `1px solid ${D.border}` : "none", borderBottom: `1px solid ${D.border}` }}>
                          <p style={{ margin: 0, fontSize: 11, color: "#888", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.3 }}>{m.etiqueta}</p>
                          <div style={{ display: "flex", alignItems: "baseline", gap: 6, margin: "6px 0 4px" }}>
                            <span style={{ fontSize: 24, fontWeight: 800, color: cc }}>{m.actual}</span>
                            <span style={{ fontSize: 12, color: "#888" }}>{m.unidad}</span>
                          </div>
                          <div style={{ height: 5, background: "#eee", borderRadius: 3, marginBottom: 6 }}>
                            <div style={{ width: `${pct}%`, height: "100%", background: cc, borderRadius: 3 }} />
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontSize: 10, color: trendColor, fontWeight: 600 }}>{m.tendencia === "mejorando" ? "▲" : m.tendencia === "declinando" ? "▼" : "►"} {m.tendencia}</span>
                            <span style={{ fontSize: 10, color: "#aaa" }}>Meta: {m.meta} {m.unidad}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── INCIDENTES TAB ────────────────────────────────────────── */}
        {activeTab === "Incidentes" && (
          <div style={{ background: D.card, borderRadius: 10, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", overflow: "hidden" }}>
            <div style={{ background: "linear-gradient(135deg, #004d40, #00695c)", padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0, color: "white", fontSize: 15, fontWeight: 700 }}>⚠️ Incidentes Ambientales</h3>
              <span style={{ background: "rgba(255,255,255,0.2)", color: "white", padding: "3px 10px", borderRadius: 12, fontSize: 12 }}>{incidentesAmbientales.length} registros</span>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table className="ev-table" style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    {["ID", "Fecha", "Tipo", "Gravedad", "Ubicación", "Estado", "Descripción", "Responsable"].map(h => <th key={h}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {incidentesAmbientales.map((inc) => (
                    <tr key={inc.id}>
                      <td style={{ fontWeight: 700, color: D.teal }}>{inc.id}</td>
                      <td>{inc.fecha}</td>
                      <td><span className="ev-badge" style={{ background: "#e0f2f1", color: D.teal }}>{inc.tipo}</span></td>
                      <td><span className="ev-badge" style={{ background: getSeverityColor(inc.gravedad) }}>{inc.gravedad}</span></td>
                      <td style={{ maxWidth: 200 }}>{inc.ubicacion}</td>
                      <td><span className="ev-badge" style={{ background: getStatusColor(inc.estado) }}>{inc.estado}</span></td>
                      <td style={{ maxWidth: 260, color: "#555" }}>{inc.descripcion}</td>
                      <td>{inc.equipoResponsable}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── MANTENIMIENTO TAB ─────────────────────────────────────── */}
        {activeTab === "Mantenimiento" && (
          <div>
            <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
              {(["Todos", "Alto", "Medio", "Bajo", "Ninguno"] as const).map((f) => (
                <button key={f} onClick={() => setFiltroImpacto(f)} style={{ padding: "6px 14px", borderRadius: 20, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600, background: filtroImpacto === f ? (f === "Alto" ? D.red : f === "Medio" ? D.amber : f === "Bajo" ? D.green : f === "Ninguno" ? "#888" : D.navy) : "#e9ecef", color: filtroImpacto === f ? "white" : "#555" }}>
                  {f === "Todos" ? "Todos" : `Impacto ${f}`}
                </button>
              ))}
              <span style={{ marginLeft: "auto", fontSize: 12, color: "#888", alignSelf: "center" }}>{eventosFiltrados.length} actividades</span>
            </div>
            <div style={{ background: D.card, borderRadius: 10, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", overflow: "hidden" }}>
              <div style={{ background: "linear-gradient(135deg, #004d40, #00695c)", padding: "14px 20px" }}>
                <h3 style={{ margin: 0, color: "white", fontSize: 15, fontWeight: 700 }}>🔧 Actividades con Impacto Ambiental</h3>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table className="ev-table" style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      {["Código", "Nombre", "Área", "Impacto", "Inicio", "Fin", "Hrs", "Estado", "Medidas", "Responsable"].map(h => <th key={h}>{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {eventosFiltrados.map((ev) => (
                      <tr key={ev.codigo}>
                        <td style={{ fontWeight: 700, color: D.teal, whiteSpace: "nowrap" }}>{ev.codigo}</td>
                        <td style={{ maxWidth: 240, fontSize: 11 }}>{ev.nombre}</td>
                        <td><span style={{ background: "#e0f2f1", color: D.teal, padding: "2px 7px", borderRadius: 10, fontSize: 11, fontWeight: 600 }}>{ev.area}</span></td>
                        <td><span className="ev-badge" style={{ background: getImpactColor(ev.impactoAmbiental) }}>{ev.impactoAmbiental}</span></td>
                        <td style={{ whiteSpace: "nowrap" }}>{ev.fechaInicio}</td>
                        <td style={{ whiteSpace: "nowrap" }}>{ev.fechaFin}</td>
                        <td style={{ textAlign: "right", fontWeight: 700, color: D.navy }}>{ev.duracion}h</td>
                        <td><span className="ev-badge" style={{ background: getStatusColor(ev.estado) }}>{ev.estado}</span></td>
                        <td style={{ textAlign: "center", fontWeight: 700, color: D.teal }}>{ev.medidas.length}</td>
                        <td style={{ fontSize: 11 }}>{ev.responsable}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnvironmentView;
