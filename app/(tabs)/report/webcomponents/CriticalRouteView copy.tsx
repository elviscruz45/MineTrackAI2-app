import React, { useState, useEffect } from "react";

interface CriticalRouteViewProps {
  selectedProject: string;
}

interface Task {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  duration: number;
  progress: number;
  dependencies: string[];
  isCritical: boolean;
  slack: number;
  resources: string[];
  riskLevel: "low" | "medium" | "high";
  responsible: string;
}

const CriticalRouteView: React.FC<CriticalRouteViewProps> = ({
  selectedProject,
}) => {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [animateFlow, setAnimateFlow] = useState(false);

  // Start animation after component mounts
  useEffect(() => {
    setTimeout(() => {
      setAnimateFlow(true);
    }, 500);
  }, []);

  // Mock data for the critical path tasks
  const mockTasks: Task[] = [
    {
      id: "T1",
      name: "Desenergizar equipos",
      startDate: "07-07-2025 07:00",
      endDate: "07-07-2025 10:00",
      duration: 3,
      progress: 100,
      dependencies: [],
      isCritical: true,
      slack: 0,
      resources: ["Eléctrico 1", "Eléctrico 2"],
      riskLevel: "medium",
      responsible: "J. Rodriguez",
    },
    {
      id: "T2",
      name: "Desmontaje de motor principal",
      startDate: "07-07-2025 10:00",
      endDate: "07-07-2025 19:00",
      duration: 9,
      progress: 100,
      dependencies: ["T1"],
      isCritical: true,
      slack: 0,
      resources: ["Mecánico 1", "Mecánico 2", "Operador grúa"],
      riskLevel: "high",
      responsible: "F. Gomez",
    },
    {
      id: "T3",
      name: "Cambio de rodamientos",
      startDate: "08-07-2025 07:00",
      endDate: "08-07-2025 15:00",
      duration: 8,
      progress: 85,
      dependencies: ["T2"],
      isCritical: true,
      slack: 0,
      resources: ["Mecánico 1", "Mecánico 3"],
      riskLevel: "medium",
      responsible: "F. Gomez",
    },
    {
      id: "T4",
      name: "Montaje de motor principal",
      startDate: "08-07-2025 15:00",
      endDate: "09-07-2025 03:00",
      duration: 12,
      progress: 50,
      dependencies: ["T3"],
      isCritical: true,
      slack: 0,
      resources: ["Mecánico 1", "Mecánico 2", "Mecánico 4", "Operador grúa"],
      riskLevel: "high",
      responsible: "F. Gomez",
    },
    {
      id: "T5",
      name: "Conexiones eléctricas",
      startDate: "09-07-2025 07:00",
      endDate: "09-07-2025 15:00",
      duration: 8,
      progress: 0,
      dependencies: ["T4"],
      isCritical: true,
      slack: 0,
      resources: ["Eléctrico 1", "Eléctrico 3"],
      riskLevel: "medium",
      responsible: "J. Rodriguez",
    },
    {
      id: "T6",
      name: "Pruebas sin carga",
      startDate: "09-07-2025 15:00",
      endDate: "09-07-2025 19:00",
      duration: 4,
      progress: 0,
      dependencies: ["T5"],
      isCritical: true,
      slack: 0,
      resources: ["Instrumentista 1", "Supervisor"],
      riskLevel: "medium",
      responsible: "M. Torres",
    },
    {
      id: "T7",
      name: "Puesta en marcha",
      startDate: "10-07-2025 07:00",
      endDate: "10-07-2025 11:00",
      duration: 4,
      progress: 0,
      dependencies: ["T6"],
      isCritical: true,
      slack: 0,
      resources: ["Instrumentista 1", "Supervisor", "Operador"],
      riskLevel: "high",
      responsible: "M. Torres",
    },
  ];

  // Non-critical tasks that are related to the critical path
  const relatedTasks: Task[] = [
    {
      id: "T8",
      name: "Limpieza de área",
      startDate: "07-07-2025 10:00",
      endDate: "07-07-2025 15:00",
      duration: 5,
      progress: 100,
      dependencies: ["T1"],
      isCritical: false,
      slack: 4,
      resources: ["Ayudante 1", "Ayudante 2"],
      riskLevel: "low",
      responsible: "P. Herrera",
    },
    {
      id: "T9",
      name: "Inspección de componentes",
      startDate: "08-07-2025 07:00",
      endDate: "08-07-2025 11:00",
      duration: 4,
      progress: 100,
      dependencies: ["T2"],
      isCritical: false,
      slack: 8,
      resources: ["Inspector QA"],
      riskLevel: "low",
      responsible: "S. Vargas",
    },
    {
      id: "T10",
      name: "Preparación documentación",
      startDate: "09-07-2025 07:00",
      endDate: "09-07-2025 11:00",
      duration: 4,
      progress: 75,
      dependencies: [],
      isCritical: false,
      slack: 12,
      resources: ["Supervisor"],
      riskLevel: "low",
      responsible: "S. Vargas",
    },
  ];

  const getProgressColor = (progress: number) => {
    if (progress === 0) return "#f5f5f5";
    if (progress < 25) return "#ffcdd2";
    if (progress < 50) return "#ffecb3";
    if (progress < 75) return "#c8e6c9";
    return "#a5d6a7";
  };

  const getRiskColor = (risk: string) => {
    if (risk === "high") return "#f44336";
    if (risk === "medium") return "#ff9800";
    return "#4caf50";
  };

  const getTaskProgress = (task: Task) => {
    return {
      background: `linear-gradient(to right, ${getProgressColor(
        task.progress
      )} ${task.progress}%, #f5f5f5 ${task.progress}%)`,
    };
  };

  const getDateString = (dateString: string) => {
    const parts = dateString.split(" ");
    return parts[0];
  };

  const getTimeString = (dateString: string) => {
    const parts = dateString.split(" ");
    return parts[1];
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
  };

  // Function to get task status text
  const getTaskStatus = (task: Task) => {
    if (task.progress === 100) return "Completado";
    if (task.progress > 0) return "En progreso";

    // Check if task is delayed
    const now = new Date();
    const startDate = new Date(task.startDate.replace(/-/g, "/"));

    if (now > startDate && task.progress === 0) return "Retrasado";
    return "Pendiente";
  };

  // Function to get task status color
  const getTaskStatusColor = (task: Task) => {
    if (task.progress === 100) return "#4caf50";
    if (task.progress > 0) return "#2196f3";

    const now = new Date();
    const startDate = new Date(task.startDate.replace(/-/g, "/"));

    if (now > startDate && task.progress === 0) return "#f44336";
    return "#ff9800";
  };

  return (
    <div style={{ padding: "20px 0" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 24,
        }}
      >
        {/* Critical Path Visualization - Left Column */}
        <div
          style={{
            flex: 2,
            backgroundColor: "#fff",
            borderRadius: 8,
            padding: 24,
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          }}
        >
          <h3
            style={{
              fontSize: 18,
              color: "#2A3B76",
              margin: 0,
              marginBottom: 24,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M2 12L5 9M5 9L8 12M5 9V15M10 15L13 18M13 18L16 15M13 18V9M18 9L21 12M21 12L18 15M21 12H16"
                stroke="#2A3B76"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Ruta Crítica: {selectedProject}
          </h3>

          <div
            style={{
              marginBottom: 20,
              display: "flex",
              gap: 16,
              justifyContent: "flex-end",
            }}
          >
            <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
              <div
                style={{
                  width: 12,
                  height: 12,
                  backgroundColor: "#f44336",
                  borderRadius: "50%",
                }}
              ></div>
              <span style={{ fontSize: 13, color: "#555" }}>Alto Riesgo</span>
            </div>
            <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
              <div
                style={{
                  width: 12,
                  height: 12,
                  backgroundColor: "#ff9800",
                  borderRadius: "50%",
                }}
              ></div>
              <span style={{ fontSize: 13, color: "#555" }}>Riesgo Medio</span>
            </div>
            <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
              <div
                style={{
                  width: 12,
                  height: 12,
                  backgroundColor: "#4caf50",
                  borderRadius: "50%",
                }}
              ></div>
              <span style={{ fontSize: 13, color: "#555" }}>Bajo Riesgo</span>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 20,
              position: "relative",
            }}
          >
            {/* Vertical line connecting all tasks */}
            <div
              style={{
                position: "absolute",
                left: 15,
                top: 20,
                bottom: 20,
                width: 2,
                backgroundColor: "#2A3B76",
                opacity: 0.4,
                zIndex: 1,
              }}
            ></div>

            {/* Flow animation */}
            <div
              style={{
                position: "absolute",
                left: 15,
                top: 0,
                width: 2,
                backgroundColor: "#2196f3",
                boxShadow: "0 0 8px rgba(33, 150, 243, 0.8)",
                height: animateFlow ? "100%" : "0%",
                transition: "height 8s cubic-bezier(0.4, 0, 0.2, 1)",
                zIndex: 2,
              }}
            ></div>

            {mockTasks.map((task, index) => (
              <div
                key={task.id}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  position: "relative",
                  zIndex: 3,
                }}
                onClick={() => handleTaskClick(task)}
              >
                {/* Task node */}
                <div
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: "50%",
                    backgroundColor: getRiskColor(task.riskLevel),
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    color: "white",
                    fontWeight: 600,
                    boxShadow: `0 0 0 4px white, 0 0 0 5px ${getRiskColor(
                      task.riskLevel
                    )}33`,
                    marginRight: 15,
                    cursor: "pointer",
                    transition: "transform 0.2s ease",
                    transform:
                      selectedTask?.id === task.id ? "scale(1.2)" : "scale(1)",
                  }}
                >
                  {index + 1}
                </div>

                {/* Task card */}
                <div
                  style={{
                    flex: 1,
                    backgroundColor:
                      selectedTask?.id === task.id ? "#f8f9fa" : "white",
                    borderRadius: 8,
                    padding: 16,
                    boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
                    border: `1px solid ${
                      selectedTask?.id === task.id
                        ? "#2A3B76"
                        : "rgba(0,0,0,0.06)"
                    }`,
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 8,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 16,
                        fontWeight: 600,
                        color: "#333",
                      }}
                    >
                      {task.name}
                    </div>

                    <div
                      style={{
                        padding: "3px 8px",
                        borderRadius: 4,
                        fontSize: 12,
                        fontWeight: 500,
                        backgroundColor: getTaskStatusColor(task),
                        color: "white",
                      }}
                    >
                      {getTaskStatus(task)}
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 12,
                      fontSize: 13,
                      color: "#666",
                    }}
                  >
                    <div>
                      <span style={{ fontWeight: 500 }}>Inicio:</span>{" "}
                      {getDateString(task.startDate)}{" "}
                      <span style={{ opacity: 0.7 }}>
                        ({getTimeString(task.startDate)})
                      </span>
                    </div>
                    <div>
                      <span style={{ fontWeight: 500 }}>Fin:</span>{" "}
                      {getDateString(task.endDate)}{" "}
                      <span style={{ opacity: 0.7 }}>
                        ({getTimeString(task.endDate)})
                      </span>
                    </div>
                    <div>
                      <span style={{ fontWeight: 500 }}>Duración:</span>{" "}
                      {task.duration}h
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div style={{ marginBottom: 12 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 4,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 13,
                          color: "#555",
                          fontWeight: 500,
                        }}
                      >
                        Progreso
                      </span>
                      <span
                        style={{
                          fontSize: 13,
                          color: "#333",
                          fontWeight: 600,
                        }}
                      >
                        {task.progress}%
                      </span>
                    </div>
                    <div
                      style={{
                        height: 8,
                        borderRadius: 4,
                        overflow: "hidden",
                        ...getTaskProgress(task),
                      }}
                    ></div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: 13,
                      color: "#666",
                    }}
                  >
                    <div>
                      <span style={{ fontWeight: 500 }}>Responsable:</span>{" "}
                      {task.responsible}
                    </div>
                    <div>
                      <span style={{ fontWeight: 500 }}>Recursos:</span>{" "}
                      {task.resources.length}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Task Details and KPIs - Right Column */}
        <div style={{ flex: 1 }}>
          {/* Task Details Panel */}
          <div
            style={{
              backgroundColor: "#fff",
              borderRadius: 8,
              padding: 24,
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              marginBottom: 24,
              opacity: selectedTask ? 1 : 0.6,
              transition: "opacity 0.2s ease",
            }}
          >
            <h3
              style={{
                fontSize: 18,
                color: "#2A3B76",
                margin: 0,
                marginBottom: 20,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M13 16H12V12H11M12 8H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                  stroke="#2A3B76"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Detalles de Tarea
            </h3>

            {selectedTask ? (
              <div>
                <div
                  style={{
                    marginBottom: 16,
                    padding: 12,
                    backgroundColor: "#f8f9fa",
                    borderRadius: 6,
                    borderLeft: `4px solid ${getRiskColor(
                      selectedTask.riskLevel
                    )}`,
                  }}
                >
                  <div
                    style={{
                      fontSize: 16,
                      fontWeight: 600,
                      color: "#333",
                      marginBottom: 8,
                    }}
                  >
                    {selectedTask.name}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: 13,
                      color: "#666",
                    }}
                  >
                    <div>ID: {selectedTask.id}</div>
                    <div
                      style={{
                        fontWeight: 500,
                        color: getRiskColor(selectedTask.riskLevel),
                      }}
                    >
                      {selectedTask.riskLevel === "high"
                        ? "Riesgo Alto"
                        : selectedTask.riskLevel === "medium"
                        ? "Riesgo Medio"
                        : "Riesgo Bajo"}
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 16,
                  }}
                >
                  <div
                    style={{
                      flex: 1,
                      padding: 12,
                      backgroundColor: "#f5f5f5",
                      borderRadius: 6,
                      marginRight: 8,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 12,
                        color: "#666",
                        marginBottom: 2,
                      }}
                    >
                      Inicio
                    </div>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: "#333",
                      }}
                    >
                      {selectedTask.startDate}
                    </div>
                  </div>
                  <div
                    style={{
                      flex: 1,
                      padding: 12,
                      backgroundColor: "#f5f5f5",
                      borderRadius: 6,
                      marginLeft: 8,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 12,
                        color: "#666",
                        marginBottom: 2,
                      }}
                    >
                      Fin
                    </div>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: "#333",
                      }}
                    >
                      {selectedTask.endDate}
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    marginBottom: 16,
                    padding: 12,
                    backgroundColor: "#f5f5f5",
                    borderRadius: 6,
                  }}
                >
                  <div
                    style={{
                      fontSize: 12,
                      color: "#666",
                      marginBottom: 2,
                    }}
                  >
                    Responsable
                  </div>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: "#333",
                    }}
                  >
                    {selectedTask.responsible}
                  </div>
                </div>

                <div
                  style={{
                    marginBottom: 16,
                    padding: 12,
                    backgroundColor: "#f5f5f5",
                    borderRadius: 6,
                  }}
                >
                  <div
                    style={{
                      fontSize: 12,
                      color: "#666",
                      marginBottom: 8,
                    }}
                  >
                    Recursos Asignados
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 4,
                    }}
                  >
                    {selectedTask.resources.map((resource, index) => (
                      <div
                        key={index}
                        style={{
                          padding: "3px 8px",
                          backgroundColor: "#e0e0e0",
                          borderRadius: 12,
                          fontSize: 12,
                          fontWeight: 500,
                          color: "#555",
                        }}
                      >
                        {resource}
                      </div>
                    ))}
                  </div>
                </div>

                <div
                  style={{
                    marginBottom: 16,
                    padding: 12,
                    backgroundColor: "#f5f5f5",
                    borderRadius: 6,
                  }}
                >
                  <div
                    style={{
                      fontSize: 12,
                      color: "#666",
                      marginBottom: 8,
                    }}
                  >
                    Dependencias
                  </div>
                  {selectedTask.dependencies.length > 0 ? (
                    <div
                      style={{
                        display: "flex",
                        gap: 4,
                      }}
                    >
                      {selectedTask.dependencies.map((depId) => (
                        <div
                          key={depId}
                          style={{
                            padding: "3px 8px",
                            backgroundColor: "#2A3B76",
                            borderRadius: 12,
                            fontSize: 12,
                            fontWeight: 500,
                            color: "white",
                          }}
                        >
                          {depId}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div
                      style={{
                        fontSize: 14,
                        color: "#666",
                        fontStyle: "italic",
                      }}
                    >
                      Ninguna dependencia
                    </div>
                  )}
                </div>

                <div
                  style={{
                    padding: 12,
                    backgroundColor: "#f5f5f5",
                    borderRadius: 6,
                  }}
                >
                  <div
                    style={{
                      fontSize: 12,
                      color: "#666",
                      marginBottom: 8,
                    }}
                  >
                    Estado Actual
                  </div>
                  <div
                    style={{
                      padding: "6px 12px",
                      borderRadius: 4,
                      backgroundColor: getTaskStatusColor(selectedTask),
                      color: "white",
                      fontSize: 14,
                      fontWeight: 500,
                      display: "inline-block",
                    }}
                  >
                    {getTaskStatus(selectedTask)}
                  </div>
                </div>
              </div>
            ) : (
              <div
                style={{
                  padding: 20,
                  textAlign: "center",
                  color: "#666",
                }}
              >
                Seleccione una tarea para ver detalles
              </div>
            )}
          </div>

          {/* KPI Dashboard */}
          <div
            style={{
              backgroundColor: "#fff",
              borderRadius: 8,
              padding: 24,
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            }}
          >
            <h3
              style={{
                fontSize: 18,
                color: "#2A3B76",
                margin: 0,
                marginBottom: 20,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M8 16V18M12 10V18M16 6V18M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z"
                  stroke="#2A3B76"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Indicadores Clave
            </h3>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 16,
              }}
            >
              <div
                style={{
                  padding: 12,
                  backgroundColor: "#f5f5f5",
                  borderRadius: 6,
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    color: "#666",
                    marginBottom: 4,
                  }}
                >
                  Avance General
                </div>
                <div
                  style={{
                    fontSize: 24,
                    fontWeight: 700,
                    color: "#2A3B76",
                  }}
                >
                  48%
                </div>
              </div>
              <div
                style={{
                  padding: 12,
                  backgroundColor: "#f5f5f5",
                  borderRadius: 6,
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    color: "#666",
                    marginBottom: 4,
                  }}
                >
                  Tareas Críticas
                </div>
                <div
                  style={{
                    fontSize: 24,
                    fontWeight: 700,
                    color: "#2A3B76",
                  }}
                >
                  7
                </div>
              </div>
              <div
                style={{
                  padding: 12,
                  backgroundColor: "#f5f5f5",
                  borderRadius: 6,
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    color: "#666",
                    marginBottom: 4,
                  }}
                >
                  Completadas
                </div>
                <div
                  style={{
                    fontSize: 24,
                    fontWeight: 700,
                    color: "#4caf50",
                  }}
                >
                  2
                </div>
              </div>
              <div
                style={{
                  padding: 12,
                  backgroundColor: "#f5f5f5",
                  borderRadius: 6,
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    color: "#666",
                    marginBottom: 4,
                  }}
                >
                  Tareas Atrasadas
                </div>
                <div
                  style={{
                    fontSize: 24,
                    fontWeight: 700,
                    color: "#f44336",
                  }}
                >
                  1
                </div>
              </div>
            </div>

            <div
              style={{
                marginTop: 16,
                padding: 12,
                backgroundColor: "#f5f5f5",
                borderRadius: 6,
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  color: "#666",
                  marginBottom: 8,
                }}
              >
                Tiempo Restante
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                    color: "#2A3B76",
                  }}
                >
                  22.5 horas
                </div>
                <div
                  style={{
                    padding: "4px 8px",
                    backgroundColor: "#ff9800",
                    borderRadius: 4,
                    fontSize: 12,
                    fontWeight: 500,
                    color: "white",
                  }}
                >
                  2 días
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CriticalRouteView;
