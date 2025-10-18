import React, { useState, useEffect } from "react";

interface CriticalRouteViewProps {
  data: any;
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
  ResponsableEmpresaContratista?: string;
  ResponsableEmpresaUsuario?: string;
}
const sortByCodigo = (arr: any[], key: string = "Codigo") => {
  return arr.sort((a, b) => {
    const aParts = (a[key] || "").split(".").map(Number);
    const bParts = (b[key] || "").split(".").map(Number);

    for (let i = 0; i < aParts.length; i++) {
      if (aParts[i] !== bParts[i]) {
        return aParts[i] - bParts[i]; // ascendente
      }
    }
    return 0;
  });
};

// Utilidad para convertir Timestamp o string a {date, time}
function toDateTimeObj(fecha: any): { date: string; time: string } {
  if (!fecha) return { date: "", time: "" };
  let d: Date;
  if (typeof fecha === "string") {
    d = new Date(fecha);
  } else if (fecha.seconds) {
    d = new Date(fecha.seconds * 1000);
  } else {
    return { date: "", time: "" };
  }
  return {
    date: d.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
    }),
    time: d.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }),
  };
}
const CriticalRouteView: React.FC<CriticalRouteViewProps> = ({ data }) => {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [animateFlow, setAnimateFlow] = useState(false);
  const [sections, setSections] = useState<any>();
  const [allTasks, setAllTasks] = useState<any[]>([]);
  const [criticalPath, setCriticalPath] = useState<Task[]>([]);
  const [projectStats, setProjectStats] = useState({
    totalDuration: 0,
    completedTasks: 0,
    delayedTasks: 0,
    criticalTasks: 0,
    overallProgress: 0,
    remainingTime: 0,
  });

  // Start animation after component mounts
  useEffect(() => {
    setTimeout(() => {
      setAnimateFlow(true);
    }, 500);
  }, []);

  // Función para convertir fecha/hora a timestamp para cálculos
  const getTimestamp = (dateObj: { date: string; time: string }) => {
    if (!dateObj.date || !dateObj.time) return 0;
    const [day, month, year] = dateObj.date.split("/");
    const [hours, minutes] = dateObj.time.split(":");
    const fullYear = year?.length === 2 ? `20${year}` : year;
    return new Date(
      `${fullYear}-${month}-${day}T${hours}:${minutes}`
    ).getTime();
  };

  // Función para calcular la ruta crítica basada en todas las tareas
  const calculateCriticalPath = (tasks: any[]) => {
    if (!tasks || tasks.length === 0) return [];

    // Preparar tareas con fechas efectivas (real si existe, sino programada)
    const preparedTasks = tasks.map((task) => ({
      ...task,
      // Usar fechas reales si están disponibles, sino fechas programadas
      effectiveStartDate:
        task.startDateReal.date && task.startDateReal.time
          ? task.startDateReal
          : task.startDateProg,
      effectiveEndDate:
        task.endDateReal.date && task.endDateReal.time
          ? task.endDateReal
          : task.endDateProg,
      progress: parseInt(task.avance.replace("%", "")) || 0,
      hasRealDates: !!(task.startDateReal.date && task.endDateReal.date),
    }));

    // Función para verificar si una tarea engloba a otra
    const taskEnglobesAnother = (taskA: any, taskB: any) => {
      const aStart = getTimestamp(taskA.effectiveStartDate);
      const aEnd = getTimestamp(taskA.effectiveEndDate);
      const bStart = getTimestamp(taskB.effectiveStartDate);
      const bEnd = getTimestamp(taskB.effectiveEndDate);

      // TaskA engloba a TaskB si:
      // - TaskA comienza antes o al mismo tiempo que TaskB
      // - TaskA termina después o al mismo tiempo que TaskB
      return aStart <= bStart && aEnd >= bEnd;
    };

    // Filtrar tareas eliminando las que están contenidas dentro de otras
    const filteredTasks = preparedTasks.filter((task, index) => {
      // Verificar si esta tarea está contenida dentro de alguna otra
      for (let i = 0; i < preparedTasks.length; i++) {
        if (i === index) continue; // No comparar consigo misma

        const otherTask = preparedTasks[i];

        // Si otra tarea engloba a esta tarea
        if (taskEnglobesAnother(otherTask, task)) {
          // Mantener la tarea que:
          // 1. Comience más temprano (más crítica al inicio)
          // 2. Tenga menor progreso (más crítica)
          // 3. Tenga mayor duración
          const taskStart = getTimestamp(task.effectiveStartDate);
          const otherStart = getTimestamp(otherTask.effectiveStartDate);
          const taskDuration =
            getTimestamp(task.effectiveEndDate) -
            getTimestamp(task.effectiveStartDate);
          const otherDuration =
            getTimestamp(otherTask.effectiveEndDate) -
            getTimestamp(otherTask.effectiveStartDate);

          // Si la otra tarea comienza antes o al mismo tiempo
          if (otherStart <= taskStart) {
            // Si la otra tarea tiene mayor duración, excluir esta tarea
            if (otherDuration >= taskDuration) {
              return false; // Excluir esta tarea
            }
          }
        }
      }
      return true; // Mantener esta tarea
    });

    // Ordenar las tareas filtradas por fecha de inicio efectiva
    const sortedTasks = [...filteredTasks].sort(
      (a, b) =>
        getTimestamp(a.effectiveStartDate) - getTimestamp(b.effectiveStartDate)
    );

    // Construir la ruta crítica siguiendo la continuidad temporal
    const criticalTasks: Task[] = [];
    const usedTaskIds = new Set<string>();

    // Comenzar con la primera tarea cronológicamente
    let currentTask = sortedTasks[0];

    while (currentTask) {
      // Evitar duplicados
      if (usedTaskIds.has(currentTask.id)) {
        break;
      }

      usedTaskIds.add(currentTask.id);

      const taskStartTime = getTimestamp(currentTask.effectiveStartDate);
      const taskEndTime = getTimestamp(currentTask.effectiveEndDate);
      const duration = (taskEndTime - taskStartTime) / (1000 * 60 * 60);

      // Calcular retraso si tiene fechas reales
      let delay = 0;
      if (currentTask.hasRealDates) {
        const plannedEnd = getTimestamp(currentTask.endDateProg);
        const actualEnd = getTimestamp(currentTask.endDateReal);
        delay = (actualEnd - plannedEnd) / (1000 * 60 * 60);
      }

      criticalTasks.push({
        id: currentTask.id,
        name:
          currentTask.task || currentTask.name || `Tarea ${currentTask.wbs}`,
        startDate: `${currentTask.effectiveStartDate.date} ${currentTask.effectiveStartDate.time}`,
        endDate: `${currentTask.effectiveEndDate.date} ${currentTask.effectiveEndDate.time}`,
        duration: Math.round(duration),
        progress: currentTask.progress,
        dependencies: [],
        isCritical: true,
        slack: 0,
        resources: [],
        riskLevel: (delay > 0
          ? "high"
          : currentTask.progress < 50
          ? "medium"
          : currentTask.progress < 100
          ? "low"
          : "low") as "low" | "medium" | "high",
        responsible: currentTask.company || "No asignado",
        delay: delay,
        hasRealDates: currentTask.hasRealDates,
        plannedStart: `${currentTask.startDateProg.date} ${currentTask.startDateProg.time}`,
        plannedEnd: `${currentTask.endDateProg.date} ${currentTask.endDateProg.time}`,
        ResponsableEmpresaContratista:
          currentTask.ResponsableEmpresaContratista,
        ResponsableEmpresaUsuario: currentTask.ResponsableEmpresaUsuario,
      } as Task);

      // Buscar la siguiente tarea que comience después o durante el final de la actual
      const currentEndTime = getTimestamp(currentTask.effectiveEndDate);

      // Filtrar tareas disponibles (no usadas)
      const availableTasks = sortedTasks.filter(
        (task) => !usedTaskIds.has(task.id)
      );

      if (availableTasks.length === 0) {
        break; // No hay más tareas disponibles
      }

      // Buscar la tarea que mejor continúe la secuencia
      let nextTask = null;
      let bestMatch = null;
      let minGap = Number.MAX_SAFE_INTEGER;

      for (const task of availableTasks) {
        const taskStart = getTimestamp(task.effectiveStartDate);
        const taskEnd = getTimestamp(task.effectiveEndDate);

        // Calcular la brecha entre el final de la tarea actual y el inicio de esta tarea
        const gap = Math.abs(taskStart - currentEndTime);

        // Priorizar tareas que:
        // 1. Comienzan cerca del final de la tarea actual (continuidad)
        // 2. Tienen menor progreso (más críticas)
        // 3. Terminan más tarde (impacto en el proyecto)
        const isGoodContinuity = gap <= 7 * 24 * 60 * 60 * 1000; // Máximo 7 días de brecha
        const taskProgress = parseInt(task.avance.replace("%", "")) || 0;

        if (isGoodContinuity && gap < minGap) {
          minGap = gap;
          bestMatch = task;
        } else if (!bestMatch && taskProgress < 100) {
          // Si no hay buena continuidad, tomar tareas incompletas
          if (
            !nextTask ||
            taskProgress < parseInt(nextTask.avance.replace("%", "")) ||
            0
          ) {
            nextTask = task;
          }
        }
      }

      // Usar la mejor coincidencia o la siguiente tarea lógica
      currentTask = bestMatch || nextTask;

      // Si no encontramos una buena continuidad, buscar la tarea con fecha final más tardía
      if (!currentTask) {
        currentTask = availableTasks.reduce((latest, task) => {
          const latestEnd = getTimestamp(latest.effectiveEndDate);
          const taskEnd = getTimestamp(task.effectiveEndDate);
          return taskEnd > latestEnd ? task : latest;
        });
      }
    }

    // Verificar que la secuencia tenga sentido cronológico
    criticalTasks.sort((a, b) => {
      const aStart = getTimestamp({
        date: a.startDate.split(" ")[0],
        time: a.startDate.split(" ")[1],
      });
      const bStart = getTimestamp({
        date: b.startDate.split(" ")[0],
        time: b.startDate.split(" ")[1],
      });
      return aStart - bStart;
    });

    return criticalTasks;
  };

  // Función para calcular estadísticas del proyecto
  const calculateProjectStats = (allTasks: any[], criticalTasks: Task[]) => {
    const totalTasks = allTasks.length;
    const completedTasks = allTasks.filter(
      (t) => t.status === "Completada"
    ).length;
    const delayedTasks = allTasks.filter((t) => {
      if (!t.startDateReal.date || !t.endDateReal.date) return false;
      const programmedEnd = getTimestamp(t.endDateProg);
      const actualEnd = getTimestamp(t.endDateReal);
      return actualEnd > programmedEnd;
    }).length;

    const totalProgress = allTasks.reduce((sum, task) => {
      return sum + (parseInt(task.avance.replace("%", "")) || 0);
    }, 0);

    const overallProgress =
      totalTasks > 0 ? Math.round(totalProgress / totalTasks) : 0;

    // Calcular tiempo restante basado en la ruta crítica
    const now = new Date().getTime();
    const lastCriticalTask = criticalTasks[criticalTasks.length - 1];
    const projectEndTime = lastCriticalTask
      ? getTimestamp({
          date: lastCriticalTask.endDate.split(" ")[0],
          time: lastCriticalTask.endDate.split(" ")[1],
        })
      : now;

    const remainingTime = Math.max(
      0,
      Math.round((projectEndTime - now) / (1000 * 60 * 60))
    );

    return {
      totalDuration: criticalTasks.reduce(
        (sum, task) => sum + task.duration,
        0
      ),
      completedTasks,
      delayedTasks,
      criticalTasks: criticalTasks.length,
      overallProgress,
      remainingTime,
    };
  };

  useEffect(() => {
    if (!data) return;

    const processedSections = sortByCodigo(data).map(
      (section: any, idx: number) => ({
        id: section.Codigo || section.id || `section-${idx + 1}`,
        title: section.NombreServicio || "",
        type: section.TipoServicio || "Actividad",

        isOpen: idx === 0,
        tasks: (Array.isArray(section.activitiesData)
          ? section.activitiesData
          : []
        ).map((act: any, i: number) => ({
          id: act.Codigo || act.id || `task-${i + 1}`,
          wbs: act.Codigo || "",
          tag: "SECCION",
          status:
            act.avance === "100%" || act.RealFechaFin
              ? "Completada"
              : act.RealFechaInicio
              ? "En Progreso"
              : "Pendiente",
          company: act.EmpresaMinera || "",
          task: act.NombreServicio || "",
          ResponsableEmpresaContratista:
            section.ResponsableEmpresaContratista || "",
          ResponsableEmpresaUsuario: section.ResponsableEmpresaUsuario || "",
          hours: act.HorasTotales || 1,
          workHours: act.HorasTotales || 1,
          startDateProg: toDateTimeObj(act.FechaInicio),
          endDateProg: toDateTimeObj(act.FechaFin),
          startDateReal: toDateTimeObj(act.RealFechaInicio),
          endDateReal: toDateTimeObj(act.RealFechaFin),
          deltaWork: { hours: 0, percent: "0%" },
          deltaStart: { hours: 0, percent: "0%" },
          duration: {},
          avance:
            act.avance ||
            (act.RealFechaFin ? "100%" : act.RealFechaInicio ? "50%" : "0%"),
          expected: "100%",
          actions: ["edit", "notes", "photos", "delete"],
        })),
      })
    );

    setSections(processedSections);

    // Aplanar todas las tareas de todas las secciones
    const allTasksFlat = processedSections.flatMap((section) => section.tasks);
    setAllTasks(allTasksFlat);

    // Calcular ruta crítica con todas las tareas
    const calculatedCriticalPath = calculateCriticalPath(allTasksFlat);
    const stats = calculateProjectStats(allTasksFlat, calculatedCriticalPath);

    setCriticalPath(calculatedCriticalPath);
    setProjectStats(stats);
  }, [data]);

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
    const startDate = new Date(task.startDate.replace(/\//g, "-"));

    if (now > startDate && task.progress === 0) return "Retrasado";
    return "Pendiente";
  };

  // Function to get task status color
  const getTaskStatusColor = (task: Task) => {
    if (task.progress === 100) return "#4caf50";
    if (task.progress > 0) return "#2196f3";

    const now = new Date();
    const startDate = new Date(task.startDate.replace(/\//g, "-"));

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
            Ruta Crítica: Proyecto Parada
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

            {criticalPath.map((task, index) => (
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
                      {task.id} {task.name}
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
                      <span style={{ fontWeight: 500 }}>
                        Responsable Contratista:
                      </span>
                      {task?.ResponsableEmpresaContratista}
                    </div>
                    <div>
                      <span style={{ fontWeight: 500 }}>
                        Responsable Minera:
                      </span>
                      {task?.ResponsableEmpresaUsuario}
                    </div>
                    {/* <div>
                      <span style={{ fontWeight: 500 }}>Recursos:</span>
                      {task.resources.length}
                    </div> */}
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
                  {projectStats.overallProgress}%
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
                  {projectStats.criticalTasks}
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
                  {projectStats.completedTasks}
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
                  {projectStats.delayedTasks}
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
                  {projectStats.remainingTime} horas
                </div>
                <div
                  style={{
                    padding: "4px 8px",
                    backgroundColor:
                      projectStats.remainingTime > 0 ? "#ff9800" : "#4caf50",
                    borderRadius: 4,
                    fontSize: 12,
                    fontWeight: 500,
                    color: "white",
                  }}
                >
                  {Math.ceil(projectStats.remainingTime / 24)} días
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
