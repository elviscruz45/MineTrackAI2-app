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

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      {/* Título del Proyecto */}
      {selectedProject && (
        <h1
          style={{
            marginBottom: "20px",
            color: "#2A3B76",
            fontSize: "24px",
            borderBottom: "2px solid #e9ecef",
            paddingBottom: "10px",
          }}
        >
          Monitoreo Ambiental: {selectedProject}
        </h1>
      )}

      {/* Navegación entre pestañas */}
      <div
        style={{
          display: "flex",
          marginBottom: "30px",
          borderBottom: "1px solid #dee2e6",
        }}
      >
        <div
          onClick={() => setActiveTab("Indicadores")}
          style={{
            padding: "10px 20px",
            cursor: "pointer",
            fontWeight: activeTab === "Indicadores" ? "bold" : "normal",
            borderBottom:
              activeTab === "Indicadores" ? "2px solid #1976d2" : "none",
          }}
        >
          Indicadores Ambientales
        </div>
        <div
          onClick={() => setActiveTab("Incidentes")}
          style={{
            padding: "10px 20px",
            cursor: "pointer",
            fontWeight: activeTab === "Incidentes" ? "bold" : "normal",
            borderBottom:
              activeTab === "Incidentes" ? "2px solid #1976d2" : "none",
          }}
        >
          Incidentes Ambientales
        </div>
        <div
          onClick={() => setActiveTab("Mantenimiento")}
          style={{
            padding: "10px 20px",
            cursor: "pointer",
            fontWeight: activeTab === "Mantenimiento" ? "bold" : "normal",
            borderBottom:
              activeTab === "Mantenimiento" ? "2px solid #1976d2" : "none",
          }}
        >
          Mantenimiento con Impacto Ambiental
        </div>
      </div>

      {/* Cuadrícula de KPIs Ambientales */}
      {activeTab === "Indicadores" && (
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

          {/* Estadísticas de impacto ambiental en mantenimiento */}
          <h2
            style={{
              marginBottom: "20px",
              color: "#1976d2",
              fontSize: "18px",
            }}
          >
            Indicadores de Mantenimiento y Medio Ambiente
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "20px",
              marginBottom: "30px",
            }}
          >
            <div
              style={{
                background: "white",
                padding: "20px",
                borderRadius: "8px",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              }}
            >
              <div style={{ fontSize: "14px", color: "#666" }}>
                Actividades con Alto Impacto Ambiental
              </div>
              <div
                style={{
                  fontSize: "24px",
                  fontWeight: "bold",
                  color: porcentajeAltoImpacto > 20 ? "#dc3545" : "#198754",
                  marginTop: "8px",
                }}
              >
                {porcentajeAltoImpacto}%
              </div>
              <div
                style={{
                  fontSize: "12px",
                  color: "#666",
                  marginTop: "4px",
                }}
              >
                {eventosAltoImpacto} de {totalEventosMantenimiento} actividades
              </div>
            </div>

            <div
              style={{
                background: "white",
                padding: "20px",
                borderRadius: "8px",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              }}
            >
              <div style={{ fontSize: "14px", color: "#666" }}>
                Medidas de Control Ambiental
              </div>
              <div
                style={{
                  fontSize: "24px",
                  fontWeight: "bold",
                  color: "#1976d2",
                  marginTop: "8px",
                }}
              >
                {medidasAmbientales}
              </div>
              <div
                style={{
                  fontSize: "12px",
                  color: "#666",
                  marginTop: "4px",
                }}
              >
                Promedio: {medidasPromedio} por actividad
              </div>
            </div>

            <div
              style={{
                background: "white",
                padding: "20px",
                borderRadius: "8px",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              }}
            >
              <div style={{ fontSize: "14px", color: "#666" }}>
                Monitoreo de Impacto
              </div>
              <div
                style={{
                  fontSize: "24px",
                  fontWeight: "bold",
                  color: "#198754",
                  marginTop: "8px",
                }}
              >
                100%
              </div>
              <div
                style={{
                  fontSize: "12px",
                  color: "#666",
                  marginTop: "4px",
                }}
              >
                Cobertura de actividades de mantenimiento
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sección de Incidentes Ambientales */}
      {activeTab === "Incidentes" && (
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
          <div
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
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
                      flexWrap: "wrap",
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
      )}

      {/* Sección de Eventos de Mantenimiento con Impacto Ambiental */}
      {activeTab === "Mantenimiento" && (
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px",
            }}
          >
            <h2 style={{ color: "#1976d2", margin: 0, fontSize: "18px" }}>
              Actividades de Mantenimiento con Impacto Ambiental
            </h2>
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={() => setFiltroImpacto("Todos")}
                style={{
                  padding: "6px 10px",
                  borderRadius: "4px",
                  border: "none",
                  backgroundColor:
                    filtroImpacto === "Todos" ? "#1976d2" : "#e9ecef",
                  color: filtroImpacto === "Todos" ? "white" : "#333",
                  cursor: "pointer",
                  fontSize: "12px",
                }}
              >
                Todos
              </button>
              <button
                onClick={() => setFiltroImpacto("Alto")}
                style={{
                  padding: "6px 10px",
                  borderRadius: "4px",
                  border: "none",
                  backgroundColor:
                    filtroImpacto === "Alto" ? "#dc3545" : "#e9ecef",
                  color: filtroImpacto === "Alto" ? "white" : "#333",
                  cursor: "pointer",
                  fontSize: "12px",
                }}
              >
                Alto Impacto
              </button>
              <button
                onClick={() => setFiltroImpacto("Medio")}
                style={{
                  padding: "6px 10px",
                  borderRadius: "4px",
                  border: "none",
                  backgroundColor:
                    filtroImpacto === "Medio" ? "#ffc107" : "#e9ecef",
                  color: filtroImpacto === "Medio" ? "white" : "#333",
                  cursor: "pointer",
                  fontSize: "12px",
                }}
              >
                Impacto Medio
              </button>
              <button
                onClick={() => setFiltroImpacto("Bajo")}
                style={{
                  padding: "6px 10px",
                  borderRadius: "4px",
                  border: "none",
                  backgroundColor:
                    filtroImpacto === "Bajo" ? "#198754" : "#e9ecef",
                  color: filtroImpacto === "Bajo" ? "white" : "#333",
                  cursor: "pointer",
                  fontSize: "12px",
                }}
              >
                Bajo Impacto
              </button>
            </div>
          </div>

          <div
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
            {eventosFiltrados.map((evento) => (
              <div
                key={evento.codigo}
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
                        backgroundColor: getImpactColor(
                          evento.impactoAmbiental
                        ),
                        color: "white",
                      }}
                    >
                      Impacto {evento.impactoAmbiental}
                    </div>
                    <div
                      style={{
                        padding: "4px 8px",
                        borderRadius: "4px",
                        fontSize: "12px",
                        backgroundColor: getStatusColor(evento.estado),
                        color: "white",
                      }}
                    >
                      {evento.estado}
                    </div>
                  </div>
                  <div style={{ color: "#666", fontSize: "14px" }}>
                    {evento.codigo}
                  </div>
                </div>

                <div
                  style={{
                    marginBottom: "8px",
                    fontSize: "16px",
                    fontWeight: "bold",
                  }}
                >
                  {evento.nombre}
                </div>

                <div
                  style={{ display: "flex", gap: "20px", marginBottom: "12px" }}
                >
                  <div style={{ fontSize: "14px" }}>
                    <strong>Inicio:</strong> {evento.fechaInicio}
                  </div>
                  <div style={{ fontSize: "14px" }}>
                    <strong>Fin:</strong> {evento.fechaFin}
                  </div>
                  <div style={{ fontSize: "14px" }}>
                    <strong>Duración:</strong> {evento.duracion} horas
                  </div>
                </div>

                <div style={{ marginBottom: "8px", fontSize: "14px" }}>
                  <strong>Área:</strong> {evento.area}
                </div>

                <div style={{ marginBottom: "12px", fontSize: "14px" }}>
                  <strong>Medidas de Control Ambiental:</strong>
                  <ul
                    style={{
                      margin: "8px 0 0 20px",
                      padding: 0,
                      fontSize: "13px",
                    }}
                  >
                    {evento.medidas.map((medida, index) => (
                      <li key={index}>{medida}</li>
                    ))}
                  </ul>
                </div>

                <div style={{ marginBottom: "12px", fontSize: "14px" }}>
                  <strong>Recursos:</strong>
                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                      marginTop: "4px",
                      flexWrap: "wrap",
                    }}
                  >
                    {evento.recursos.map((recurso, index) => (
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
                        {recurso}
                      </span>
                    ))}
                  </div>
                </div>

                <div style={{ fontSize: "14px", color: "#666" }}>
                  <strong>Responsable:</strong> {evento.responsable}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EnvironmentView;
