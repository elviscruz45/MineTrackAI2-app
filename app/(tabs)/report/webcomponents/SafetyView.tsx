import React from "react";

// Define tipos para nuestros datos de seguridad
interface IncidenteSeguridad {
  id: string;
  fecha: string;
  tipo: string;
  gravedad: "Alta" | "Media" | "Baja";
  descripcion: string;
  ubicacion: string;
  estado: "Abierto" | "Cerrado" | "En Progreso";
  acciones: string[];
  responsable: string;
}

interface KPISeguridad {
  etiqueta: string;
  valor: number;
  meta: number;
  unidad: string;
  tendencia: "subiendo" | "bajando" | "estable";
}

interface Props {
  selectedProject?: string;
}

const SafetyView: React.FC<Props> = ({ selectedProject }) => {
  // Datos KPI de ejemplo
  const kpisSeguridad: KPISeguridad[] = [
    {
      etiqueta: "Tasa Total de Incidentes Registrables (TTIR)",
      valor: 0.45,
      meta: 0.5,
      unidad: "incidentes por 200,000 horas",
      tendencia: "bajando",
    },
    {
      etiqueta: "Tasa de Frecuencia de Lesiones con Tiempo Perdido (LTIFR)",
      valor: 0.12,
      meta: 0.2,
      unidad: "incidentes por 1,000,000 horas",
      tendencia: "bajando",
    },
    {
      etiqueta: "Reportes de Casi Accidentes",
      valor: 24,
      meta: 20,
      unidad: "reportes este mes",
      tendencia: "subiendo",
    },
    {
      etiqueta: "Cumplimiento de Capacitación en Seguridad",
      valor: 95,
      meta: 100,
      unidad: "%",
      tendencia: "subiendo",
    },
  ];

  // Datos de incidentes de ejemplo
  const incidentesSeguridad: IncidenteSeguridad[] = [
    {
      id: "INC-001",
      fecha: "2025-08-09",
      tipo: "Casi Accidente",
      gravedad: "Media",
      descripcion: "Equipo suelto detectado durante inspección rutinaria",
      ubicacion: "Sección 1 - Chancadora Primaria",
      estado: "Cerrado",
      acciones: [
        "Equipo asegurado inmediatamente",
        "Protocolo de inspección actualizado",
        "Reunión informativa realizada con el personal",
      ],
      responsable: "Equipo de Mantenimiento",
    },
    {
      id: "INC-002",
      fecha: "2025-08-08",
      tipo: "Observación de Seguridad",
      gravedad: "Baja",
      descripcion:
        "Problema de cumplimiento de EPP observado durante cambio de turno",
      ubicacion: "Punto de Acceso Principal",
      estado: "Cerrado",
      acciones: [
        "Recordatorio enviado a todo el personal",
        "Estaciones adicionales de EPP instaladas",
      ],
      responsable: "Departamento de Seguridad",
    },
  ];

  const getColorEstado = (estado: string) => {
    switch (estado) {
      case "Abierto":
        return "#dc3545";
      case "En Progreso":
        return "#ffc107";
      case "Cerrado":
        return "#198754";
      default:
        return "#6c757d";
    }
  };

  const getColorGravedad = (gravedad: string) => {
    switch (gravedad) {
      case "Alta":
        return "#dc3545";
      case "Media":
        return "#ffc107";
      case "Baja":
        return "#198754";
      default:
        return "#6c757d";
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      {/* Sección de KPIs */}
      <div style={{ marginBottom: "40px" }}>
        <h2 style={{ marginBottom: "20px", color: "#1976d2" }}>
          KPIs de Seguridad
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "20px",
          }}
        >
          {kpisSeguridad.map((kpi) => (
            <div
              key={kpi.etiqueta}
              style={{
                background: "white",
                padding: "20px",
                borderRadius: "8px",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              }}
            >
              <div style={{ fontSize: "14px", color: "#666" }}>
                {kpi.etiqueta}
              </div>
              <div
                style={{
                  fontSize: "24px",
                  fontWeight: "bold",
                  color: kpi.valor <= kpi.meta ? "#198754" : "#dc3545",
                  marginTop: "8px",
                }}
              >
                {kpi.valor} {kpi.unidad}
              </div>
              <div
                style={{
                  fontSize: "12px",
                  color: "#666",
                  marginTop: "4px",
                }}
              >
                Meta: {kpi.meta} {kpi.unidad}
              </div>
              <div
                style={{
                  fontSize: "12px",
                  color: kpi.tendencia === "subiendo" ? "#198754" : "#dc3545",
                  marginTop: "4px",
                }}
              >
                {kpi.tendencia === "subiendo" ? "▲" : "▼"} Tendencia
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sección de Incidentes de Seguridad */}
      <div>
        <h2 style={{ marginBottom: "20px", color: "#1976d2" }}>
          Eventos Recientes de Seguridad
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {incidentesSeguridad.map((incidente) => (
            <div
              key={incidente.id}
              style={{
                background: "white",
                padding: "20px",
                borderRadius: "8px",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "12px",
                }}
              >
                <div style={{ fontWeight: "bold" }}>{incidente.tipo}</div>
                <div
                  style={{
                    padding: "4px 8px",
                    borderRadius: "4px",
                    fontSize: "12px",
                    backgroundColor: getColorEstado(incidente.estado),
                    color: "white",
                  }}
                >
                  {incidente.estado}
                </div>
              </div>

              <div style={{ marginBottom: "8px", fontSize: "14px" }}>
                <strong>Fecha:</strong> {incidente.fecha}
              </div>

              <div style={{ marginBottom: "8px", fontSize: "14px" }}>
                <strong>Ubicación:</strong> {incidente.ubicacion}
              </div>

              <div style={{ marginBottom: "8px", fontSize: "14px" }}>
                <strong>Gravedad:</strong>{" "}
                <span
                  style={{
                    color: getColorGravedad(incidente.gravedad),
                    fontWeight: "bold",
                  }}
                >
                  {incidente.gravedad}
                </span>
              </div>

              <div style={{ marginBottom: "12px", fontSize: "14px" }}>
                <strong>Descripción:</strong> {incidente.descripcion}
              </div>

              <div style={{ marginBottom: "8px", fontSize: "14px" }}>
                <strong>Acciones Tomadas:</strong>
                <ul
                  style={{
                    margin: "8px 0 0 20px",
                    padding: 0,
                    fontSize: "13px",
                  }}
                >
                  {incidente.acciones.map((accion, index) => (
                    <li key={index}>{accion}</li>
                  ))}
                </ul>
              </div>

              <div style={{ fontSize: "14px" }}>
                <strong>Responsable:</strong> {incidente.responsable}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SafetyView;
