import React from "react";

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
  ];

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case "Activo":
        return "#dc3545";
      case "Contenido":
        return "#ffc107";
      case "Resuelto":
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

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      {/* Título del Proyecto */}
      {selectedProject && (
        <h1
          style={{
            marginBottom: "30px",
            color: "#2A3B76",
            fontSize: "24px",
            borderBottom: "2px solid #e9ecef",
            paddingBottom: "10px",
          }}
        >
          Monitoreo Ambiental: {selectedProject}
        </h1>
      )}

      {/* Cuadrícula de KPIs Ambientales */}
      <div style={{ marginBottom: "40px" }}>
        {kpisAmbientales.map((categoria) => (
          <div key={categoria.categoria} style={{ marginBottom: "30px" }}>
            <h2
              style={{
                marginBottom: "20px",
                color: "#1976d2",
                fontSize: "18px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <span>{categoria.categoria}</span>
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                gap: "20px",
              }}
            >
              {categoria.metricas.map((metrica) => (
                <div
                  key={metrica.etiqueta}
                  style={{
                    background: "white",
                    padding: "20px",
                    borderRadius: "8px",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                    border: `1px solid ${getComplianceColor(
                      metrica.cumplimiento
                    )}`,
                  }}
                >
                  <div style={{ fontSize: "14px", color: "#666" }}>
                    {metrica.etiqueta}
                  </div>
                  <div
                    style={{
                      fontSize: "24px",
                      fontWeight: "bold",
                      color: getComplianceColor(metrica.cumplimiento),
                      marginTop: "8px",
                      display: "flex",
                      alignItems: "baseline",
                      gap: "5px",
                    }}
                  >
                    {metrica.actual}
                    <span style={{ fontSize: "14px", color: "#666" }}>
                      {metrica.unidad}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#666",
                      marginTop: "4px",
                    }}
                  >
                    Meta: {metrica.meta} {metrica.unidad}
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      color:
                        metrica.tendencia === "mejorando"
                          ? "#198754"
                          : metrica.tendencia === "declinando"
                          ? "#dc3545"
                          : "#666",
                      marginTop: "4px",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    {metrica.tendencia === "mejorando"
                      ? "▲"
                      : metrica.tendencia === "declinando"
                      ? "▼"
                      : "►"}
                    {metrica.tendencia.charAt(0).toUpperCase() +
                      metrica.tendencia.slice(1)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Sección de Incidentes Ambientales */}
      <div>
        <h2
          style={{
            marginBottom: "20px",
            color: "#1976d2",
            fontSize: "18px",
          }}
        >
          Incidentes y Acciones Ambientales
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {incidentesAmbientales.map((incidente) => (
            <div
              key={incidente.id}
              style={{
                background: "white",
                padding: "20px",
                borderRadius: "8px",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                border: "1px solid #e9ecef",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "12px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                  }}
                >
                  <div
                    style={{
                      padding: "4px 8px",
                      borderRadius: "4px",
                      fontSize: "12px",
                      backgroundColor: getStatusColor(incidente.estado),
                      color: "white",
                    }}
                  >
                    {incidente.estado}
                  </div>
                  <div
                    style={{
                      padding: "4px 8px",
                      borderRadius: "4px",
                      fontSize: "12px",
                      backgroundColor: getSeverityColor(incidente.gravedad),
                      color: "white",
                    }}
                  >
                    {incidente.gravedad}
                  </div>
                </div>
                <div style={{ color: "#666", fontSize: "14px" }}>
                  {incidente.id}
                </div>
              </div>

              <div
                style={{
                  marginBottom: "8px",
                  fontSize: "16px",
                  fontWeight: "bold",
                }}
              >
                Incidente de {incidente.tipo}
              </div>

              <div style={{ marginBottom: "8px", fontSize: "14px" }}>
                <strong>Fecha:</strong> {incidente.fecha}
              </div>

              <div style={{ marginBottom: "8px", fontSize: "14px" }}>
                <strong>Ubicación:</strong> {incidente.ubicacion}
              </div>

              <div style={{ marginBottom: "12px", fontSize: "14px" }}>
                <strong>Descripción:</strong> {incidente.descripcion}
              </div>

              <div style={{ marginBottom: "12px", fontSize: "14px" }}>
                <strong>Áreas de Impacto:</strong>
                <div
                  style={{
                    display: "flex",
                    gap: "8px",
                    marginTop: "4px",
                  }}
                >
                  {incidente.areaImpacto.map((area, index) => (
                    <span
                      key={index}
                      style={{
                        padding: "2px 8px",
                        borderRadius: "12px",
                        backgroundColor: "#e9ecef",
                        fontSize: "12px",
                        color: "#666",
                      }}
                    >
                      {area}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: "8px", fontSize: "14px" }}>
                <strong>Acciones de Mitigación:</strong>
                <ul
                  style={{
                    margin: "8px 0 0 20px",
                    padding: 0,
                    fontSize: "13px",
                  }}
                >
                  {incidente.accionesMitigacion.map((accion, index) => (
                    <li key={index}>{accion}</li>
                  ))}
                </ul>
              </div>

              <div style={{ fontSize: "14px", color: "#666" }}>
                <strong>Equipo Responsable:</strong>{" "}
                {incidente.equipoResponsable}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EnvironmentView;
