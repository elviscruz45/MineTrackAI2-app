import React, { useState, useEffect } from "react";
import { calculateAvanceFromMappedTasks } from "@/utils/calculateAvance";

// Define types for our mock data
interface Task {
  id: string;
  wbs: string;
  tag: string;
  status: string;
  company: string;
  task: string;
  hours: number;
  workHours: number;
  startDateProg: {
    date: string;
    time: string;
  };
  endDateProg: {
    date: string;
    time: string;
  };
  startDateReal: any;
  endDateReal: any;
  deltaWork: {
    hours: number;
    percent: string;
  };
  deltaStart: {
    hours: number;
    percent: string;
  };
  duration: any;
  avance: string;
  expected: string;
  actions: string[];
}

interface Section {
  id: string;
  title: string;
  type: string;
  isOpen: boolean;
  progressPercent: number;
  esRutaCritica: boolean;
  tasks: Task[]; // Changed from activities to tasks directly
}

interface ActivityData {
  title: string;
  equipoLabel: string;
  sections: Section[];
}

const getProgressColor = (percent: number) => {
  if (percent >= 80) return "#28a745";
  if (percent > 0) return "#ffc107";
  return "#dc3545";
};

const isRutaCritica = (value: any): boolean =>
  value === true || String(value || "").trim().toLowerCase() === "si";

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

// Restructured mock data based on the requirements
const mockActivitiesData: ActivityData = {
  title: "PARADA PRIMARIA & SECCION 1_06 julio 2025",
  equipoLabel: "EQUIPO",
  sections: [
    {
      id: "1.1.1.1",
      title:
        "PM Alimentador Pebbles 3M - PM chute de descarga hacia la chancadora (FEB022 - FEB021 - STP038 - STP039)",
      type: "Actividad",
      isOpen: true,
      progressPercent: 100,
      esRutaCritica: false,
      tasks: [
        {
          id: "1.1.1.1.1",
          wbs: "1.1.1.1.1",
          tag: "SECCION",
          status: "Completada",
          company: "Antamina",
          task: "PM Alimentador Pebbles 3M",
          hours: 1,
          workHours: 1,
          startDateProg: { date: "02/06/25", time: "08:00" },
          endDateProg: { date: "03/06/25", time: "08:00" },
          startDateReal: { date: "02/06/25", time: "08:30" },
          endDateReal: { date: "03/06/25", time: "07:45" },
          deltaWork: { hours: 0, percent: "0%" },
          deltaStart: { hours: 0, percent: "0%" },
          duration: {},
          avance: "100%",
          expected: "100%",
          actions: ["edit", "notes", "photos", "delete"],
        },
      ],
    },
  ],
};

// Button styles for the filter bar
const buttonStyle = (active: boolean) => ({
  backgroundColor: active ? "#2A3B76" : "transparent",
  color: active ? "white" : "#333",
  border: active ? "none" : "1px solid #ddd",
  borderRadius: 4,
  padding: "6px 12px",
  fontSize: 14,
  cursor: "pointer",
  fontWeight: active ? 600 : 400,
});

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

const ActivityView: React.FC<{ data?: any }> = ({ data }) => {
  const [activeFilter, setActiveFilter] = useState("Todas");
  const [sections, setSections] = useState(
    mockActivitiesData.sections.map((section: any) => ({
      ...section,
      isOpen: section.id === "1.1.1.1",
    }))
  );
  // Trabajos adicionales (created via AIT form — not part of original Gantt plan)
  const [aitServices, setAitServices] = useState<any[]>([]);
  const [aitOpen, setAitOpen] = useState(true);

  // KPI counters derived from sections + aitServices
  const [kpis, setKpis] = useState({ noEjecutadas: 0, adicionales: 0, hhAdicionales: 0 });

  // Update sections when data prop changes
  useEffect(() => {
    if (!data || !Array.isArray(data)) return;

    // Split: Gantt plan vs. manually added services (AIT)
    const ganttData = data.filter((s: any) => s.isGlobalProject === true);
    const aitData   = data.filter((s: any) => s.isGlobalProject !== true);

    const mappedSections = sortByCodigo(ganttData).map((section: any, idx: number) => {
      const tasks = (Array.isArray(section.activitiesData)
        ? section.activitiesData
        : []
      ).map((act: any, i: number) => ({
        id: act.Codigo || act.id || `task-${i + 1}`,
        wbs: act.Codigo || "",
        tag: act.TagEquipo || "—",
        status:
          act.avance === "100%" || act.RealFechaFin
            ? "Completada"
            : act.RealFechaInicio
            ? "En Progreso"
            : "Pendiente",
        company: act.EmpresaMinera || "",
        task: act.NombreServicio || "",
        hours: act.HorasTotales ?? 0,
        workHours: act.HorasTotales ?? 0,
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
        esRutaCritica: isRutaCritica(act.esRutaCritica),
      }));

      return {
        id: section.Codigo || section.id || `section-${idx + 1}`,
        title: section.NombreServicio || "",
        type: section.TipoServicio || "Actividad",
        isOpen: idx === 0,
        progressPercent: calculateAvanceFromMappedTasks(tasks),
        esRutaCritica: isRutaCritica(section.esRutaCritica),
        tasks,
      };
    });

    setSections(mappedSections);
    setAitServices(aitData);

    // Compute KPIs
    const now = new Date();
    let noEjecutadas = 0;
    for (const sec of mappedSections) {
      for (const t of sec.tasks) {
        const endDate = t.endDateProg?.date;
        if (endDate && endDate !== "" && t.avance === "0%") {
          const [d, m, y] = endDate.split("/").map(Number);
          const end = new Date(2000 + y, m - 1, d);
          if (end < now) noEjecutadas++;
        }
      }
    }
    const hhAdicionales = aitData.reduce((acc: number, s: any) => {
      const hh = parseFloat(s.HorasTotales) || 0;
      return acc + hh;
    }, 0);
    setKpis({ noEjecutadas, adicionales: aitData.length, hhAdicionales });
  }, [data]);

  // Function to check if a date is in the past
  const isDatePast = (dateStr: string) => {
    const [day, month, year] = dateStr.split("/").map(Number);
    const date = new Date(2000 + year, month - 1, day);
    return date < new Date();
  };

  const getFilteredSections = () => {
    return sections.map((section: any) => {
      const filteredTasks = section.tasks.filter((task: any) => {
        // Current date for comparison
        const currentDate = new Date();

        switch (activeFilter) {
          case "Todas":
            return true;
          case "Atrasadas":
            // Tasks that are past their end date and not completed
            return isDatePast(task.endDateProg.date) && task.avance !== "100%";
          case "En Progreso":
            // Tasks that have started but not completed
            return (
              task.status === "En Progreso" ||
              (task.avance !== "0%" && task.avance !== "100%")
            );
          case "No Ejecutadas":
            // Tasks that haven't started yet
            return task.avance === "0%" && task.status === "Pendiente";
          case "Completadas":
            // Tasks that are completed
            return task.avance === "100%" || task.status === "Completada";
          default:
            return true;
        }
      });

      return {
        ...section,
        tasks: filteredTasks,
      };
    });
  };

  // Function to toggle section expansion
  const toggleSection = (sectionId: string) => {
    setSections((prevSections: any) =>
      prevSections.map((section: any) =>
        section.id === sectionId
          ? { ...section, isOpen: !section.isOpen }
          : section
      )
    );
  };

  // Get the filtered sections for rendering
  const filteredSections = getFilteredSections();

  return (
    <div style={{ padding: "8px 0" }}>

      {/* ── KPI SUMMARY BAR ──────────────────────────────────────────── */}
      <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
        {[
          {
            label: "Trabajos Adicionales",
            value: kpis.adicionales,
            sub: "Fuera del plan Gantt",
            color: "#e6a817",
            icon: "➕",
          },
          {
            label: "Actividades No Ejecutadas",
            value: kpis.noEjecutadas,
            sub: "Del plan original vencidas",
            color: "#dc3545",
            icon: "⛔",
          },
          {
            label: "HH Adicionales",
            value: `${Math.round(kpis.hhAdicionales)}h`,
            sub: "Horas fuera de alcance",
            color: "#1976d2",
            icon: "⏱️",
          },
        ].map((k, i) => (
          <div
            key={i}
            style={{
              background: "white",
              borderRadius: 10,
              overflow: "hidden",
              boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
              flex: "1 1 180px",
              minWidth: 160,
            }}
          >
            <div
              style={{
                background: k.color,
                padding: "8px 14px",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span style={{ fontSize: 18 }}>{k.icon}</span>
              <span
                style={{
                  color: "white",
                  fontSize: 10,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                }}
              >
                {k.label}
              </span>
            </div>
            <div style={{ padding: "10px 14px" }}>
              <div
                style={{ fontSize: 28, fontWeight: 800, color: "#1a1a2e", lineHeight: 1 }}
              >
                {k.value}
              </div>
              <div style={{ fontSize: 11, color: "#999", marginTop: 4 }}>{k.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Filter buttons */}
      <div
        style={{
          display: "flex",
          gap: 4,
          marginBottom: 8,
          backgroundColor: "#f8f9fa",
          padding: 8,
          borderRadius: 4,
          overflow: "auto",
        }}
      >
        <button
          style={buttonStyle(activeFilter === "Todas")}
          onClick={() => setActiveFilter("Todas")}
        >
          Todas
        </button>

        <button
          style={buttonStyle(activeFilter === "En Progreso")}
          onClick={() => setActiveFilter("En Progreso")}
        >
          En Progreso
        </button>
        <button
          style={buttonStyle(activeFilter === "No Ejecutadas")}
          onClick={() => setActiveFilter("No Ejecutadas")}
        >
          No Ejecutadas
        </button>
        <button
          style={buttonStyle(activeFilter === "Completadas")}
          onClick={() => setActiveFilter("Completadas")}
        >
          Completadas
        </button>
        <button
          style={buttonStyle(activeFilter === "Atrasadas")}
          onClick={() => setActiveFilter("Atrasadas")}
        >
          Atrasadas
        </button>
      </div>

      {/* Action button */}
      <div style={{ marginBottom: 16 }}>
        <button
          style={{
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: 4,
            padding: "8px 16px",
            fontSize: 14,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M18 13V19C18 19.5304 17.7893 20.0391 17.4142 20.4142C17.0391 20.7893 16.5304 21 16 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V8C3 7.46957 3.21071 6.96086 3.58579 6.58579C3.96086 6.21071 4.46957 6 5 6H11"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M15 3H21V9"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M10 14L21 3"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Descargar Actividades
        </button>
      </div>

      {/* Gantt plan label */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <div style={{ width: 4, height: 20, background: "#2A3B76", borderRadius: 2 }} />
        <span style={{ fontWeight: 700, fontSize: 14, color: "#2A3B76" }}>
          📋 Plan Original — Gantt
        </span>
      </div>

      {/* Sections with tasks */}
      {filteredSections.map((section: any) => (
        <div key={section.id} style={{ marginBottom: 24 }}>
          {section.tasks.length > 0 && (
            <>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "12px 16px",
                  backgroundColor: section.esRutaCritica ? "#fff1f0" : "#e9ecef",
                  borderLeft: section.esRutaCritica
                    ? "4px solid #c62828"
                    : "4px solid transparent",
                  borderRadius: "4px 4px 0 0",
                  cursor: "pointer",
                  boxShadow: section.esRutaCritica
                    ? "inset 0 0 0 1px #ffcdd2"
                    : "none",
                }}
                onClick={() => toggleSection(section.id)}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{
                    transform: section.isOpen
                      ? "rotate(0deg)"
                      : "rotate(-90deg)",
                    transition: "transform 0.2s",
                  }}
                >
                  <path
                    d="M19 9L12 16L5 9"
                    stroke="#333"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span style={{ fontWeight: 600 }}>
                  {section.id} {section.title}
                </span>
                <span style={{ fontSize: 12, color: "#777", marginLeft: 8 }}>
                  {section.type}
                </span>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: section.esRutaCritica ? "#ffffff" : "#64748b",
                    marginLeft: 8,
                    backgroundColor: section.esRutaCritica ? "#c62828" : "#e2e8f0",
                    padding: "2px 8px",
                    borderRadius: 4,
                    letterSpacing: 0.2,
                  }}
                >
                  {section.esRutaCritica ? "⛓️ Ruta Crítica" : "Ruta Estándar"}
                </span>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: "white",
                    marginLeft: 8,
                    backgroundColor: getProgressColor(section.progressPercent ?? 0),
                    padding: "2px 8px",
                    borderRadius: 4,
                  }}
                >
                  {section.progressPercent ?? 0}%
                </span>
                <span
                  style={{
                    fontSize: 12,
                    color: "#666",
                    marginLeft: "auto",
                    backgroundColor: "#e2e6ea",
                    padding: "2px 8px",
                    borderRadius: 4,
                  }}
                >
                  {section.tasks.length} tareas
                </span>
              </div>
            </>
          )}

          {section.isOpen && section.tasks.length > 0 && (
            <div style={{ padding: "8px 16px", fontSize: 14 }}>
              <div style={{ overflowX: "auto", marginBottom: 16 }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: 13,
                  }}
                >
                  <thead>
                    <tr
                      style={{ backgroundColor: "#e9ecef", textAlign: "left" }}
                    >
                      <th style={{ padding: 10, border: "1px solid #dee2e6" }}>
                        WBS
                      </th>
                      <th style={{ padding: 10, border: "1px solid #dee2e6" }}>
                        TAG
                      </th>
                      <th style={{ padding: 10, border: "1px solid #dee2e6" }}>
                        Estado/Resp
                      </th>
                      <th
                        style={{
                          padding: 10,
                          border: "1px solid #dee2e6",
                          minWidth: 200,
                        }}
                      >
                        Tarea
                      </th>
                      <th
                        style={{
                          padding: 10,
                          border: "1px solid #dee2e6",
                          textAlign: "center",
                        }}
                      >
                        Horas Programadas (h)
                      </th>
                      <th
                        style={{
                          padding: 10,
                          border: "1px solid #dee2e6",
                          textAlign: "center",
                        }}
                      >
                        Horas Reales (h)
                      </th>
                      <th
                        style={{
                          padding: 10,
                          border: "1px solid #dee2e6",
                          textAlign: "center",
                        }}
                      >
                        Inicio Prog.
                      </th>
                      <th
                        style={{
                          padding: 10,
                          border: "1px solid #dee2e6",
                          textAlign: "center",
                        }}
                      >
                        Fin Prog.
                      </th>
                      <th
                        style={{
                          padding: 10,
                          border: "1px solid #dee2e6",
                          textAlign: "center",
                        }}
                      >
                        Inicio Real
                      </th>
                      <th
                        style={{
                          padding: 10,
                          border: "1px solid #dee2e6",
                          textAlign: "center",
                        }}
                      >
                        Fin Real
                      </th>
                      <th
                        style={{
                          padding: 10,
                          border: "1px solid #dee2e6",
                          textAlign: "center",
                        }}
                      >
                        AVANCE
                      </th>
                      <th
                        style={{
                          padding: 10,
                          border: "1px solid #dee2e6",
                          textAlign: "center",
                        }}
                      >
                        Esperado
                      </th>
                      {/* <th
                        style={{
                          padding: 10,
                          border: "1px solid #dee2e6",
                          textAlign: "center",
                        }}
                      >
                        Acciones
                      </th> */}
                    </tr>
                  </thead>
                  <tbody>
                    {section.tasks.map((task: any) => (
                      <tr key={task.id}>
                        <td
                          style={{ padding: 10, border: "1px solid #dee2e6" }}
                        >
                          {task.wbs}
                        </td>
                        <td
                          style={{ padding: 10, border: "1px solid #dee2e6" }}
                        >
                          {task.tag}
                        </td>
                        <td
                          style={{ padding: 10, border: "1px solid #dee2e6" }}
                        >
                          <div
                            style={{
                              backgroundColor:
                                task.status === "Completada"
                                  ? "#28a745"
                                  : task.status === "En Progreso"
                                  ? "#007bff"
                                  : isDatePast(task.endDateProg.date) &&
                                    task.avance !== "100%"
                                  ? "#dc3545"
                                  : "#007bff",
                              color: "white",
                              padding: "3px 6px",
                              borderRadius: 4,
                              display: "inline-block",
                              fontSize: 12,
                            }}
                          >
                            {task.status}
                          </div>
                          <div style={{ marginTop: 4, fontSize: 12 }}>
                            {task.company}
                          </div>
                        </td>
                        <td
                          style={{ padding: 10, border: "1px solid #dee2e6" }}
                        >
                          {task.task}
                        </td>
                        <td
                          style={{
                            padding: 10,
                            border: "1px solid #dee2e6",
                            textAlign: "center",
                          }}
                        >
                          {(() => {
                            // Validar que existan las fechas y horas
                            const startDate = task.startDateProg?.date;
                            const startTime = task.startDateProg?.time;
                            const endDate = task.endDateProg?.date;
                            const endTime = task.endDateProg?.time;

                            if (
                              !startDate ||
                              !startTime ||
                              !endDate ||
                              !endTime ||
                              startDate === "" ||
                              endDate === ""
                            ) {
                              return "N/A";
                            }

                            // Convertir "DD/MM/YY" a "YYYY-MM-DD"
                            const toISO = (d: string, t: string) => {
                              try {
                                // Validar que la fecha tenga el formato correcto
                                if (
                                  !d ||
                                  typeof d !== "string" ||
                                  !d.includes("/")
                                ) {
                                  return null;
                                }

                                const parts = d.split("/");
                                if (parts.length !== 3) {
                                  return null;
                                }

                                const [day, month, year] = parts;

                                // Validar que todas las partes existan y no sean undefined
                                if (!day || !month || !year) {
                                  return null;
                                }

                                // Si el año es de 2 dígitos, asume 2000+
                                const fullYear =
                                  year.length === 2 ? `20${year}` : year;

                                return `${fullYear}-${month.padStart(
                                  2,
                                  "0"
                                )}-${day.padStart(2, "0")}T${t}`;
                              } catch (error) {
                                console.error("Error parsing date:", d, error);
                                return null;
                              }
                            };

                            const startISO = toISO(startDate, startTime);
                            const endISO = toISO(endDate, endTime);

                            // Validar que las conversiones fueron exitosas
                            if (!startISO || !endISO) {
                              return "N/A";
                            }

                            const startProg = new Date(startISO);
                            const endProg = new Date(endISO);

                            // Validar que las fechas sean válidas
                            if (
                              isNaN(startProg.getTime()) ||
                              isNaN(endProg.getTime())
                            ) {
                              return "N/A";
                            }

                            const horasProgramadas =
                              (endProg.getTime() - startProg.getTime()) /
                              (1000 * 60 * 60);

                            return isNaN(horasProgramadas) ||
                              horasProgramadas < 0
                              ? "N/A"
                              : Math.round(horasProgramadas * 10) / 10;
                          })()}
                        </td>
                        <td
                          style={{
                            padding: 10,
                            border: "1px solid #dee2e6",
                            textAlign: "center",
                          }}
                        >
                          {(() => {
                            // Calcular horas reales
                            const startDate = task.startDateReal?.date;
                            const startTime = task.startDateReal?.time;
                            const endDate = task.endDateReal?.date;
                            const endTime = task.endDateReal?.time;

                            if (
                              !startDate ||
                              !startTime ||
                              !endDate ||
                              !endTime ||
                              startDate === "" ||
                              endDate === ""
                            ) {
                              return "";
                            }

                            // Convertir "DD/MM/YY" a "YYYY-MM-DD"
                            const toISO = (d: string, t: string) => {
                              const [day, month, year] = d.split("/");
                              const fullYear =
                                year?.length === 2 ? `20${year}` : year;
                              return `${fullYear}-${month.padStart(
                                2,
                                "0"
                              )}-${day.padStart(2, "0")}T${t}`;
                            };

                            const startReal = new Date(
                              toISO(startDate, startTime)
                            );
                            const endReal = new Date(toISO(endDate, endTime));
                            const horasReales =
                              (endReal.getTime() - startReal.getTime()) /
                              (1000 * 60 * 60);

                            return isNaN(horasReales)
                              ? "N/A"
                              : Math.round(horasReales * 10) / 10;
                          })()}
                        </td>
                        <td
                          style={{
                            padding: 10,
                            border: "1px solid #dee2e6",
                            textAlign: "center",
                          }}
                        >
                          <div>{task.startDateProg.date}</div>
                          <div>{task.startDateProg.time}</div>
                        </td>
                        <td
                          style={{
                            padding: 10,
                            border: "1px solid #dee2e6",
                            textAlign: "center",
                          }}
                        >
                          <div>{task.endDateProg.date}</div>
                          <div>{task.endDateProg.time}</div>
                        </td>
                        <td
                          style={{
                            padding: 10,
                            border: "1px solid #dee2e6",
                            textAlign: "center",
                          }}
                        >
                          <div>{task.startDateReal.date}</div>
                          <div>{task.startDateReal.time}</div>
                        </td>
                        <td
                          style={{
                            padding: 10,
                            border: "1px solid #dee2e6",
                            textAlign: "center",
                          }}
                        >
                          <div>{task.endDateReal.date}</div>
                          <div>{task.endDateReal.time}</div>
                        </td>
                        <td
                          style={{
                            padding: 10,
                            border: "1px solid #dee2e6",
                            textAlign: "center",
                          }}
                        >
                          <div
                            style={{
                              backgroundColor:
                                task.avance === "100%"
                                  ? "#28a745"
                                  : task.avance === "0%"
                                  ? "#dc3545"
                                  : "#ffc107",
                              color: "white",
                              padding: "4px 8px",
                              borderRadius: 4,
                              display: "inline-block",
                            }}
                          >
                            {task.avance}
                          </div>
                        </td>
                        <td
                          style={{
                            padding: 10,
                            border: "1px solid #dee2e6",
                            textAlign: "center",
                          }}
                        >
                          <div
                            style={{
                              backgroundColor: "#6c757d",
                              color: "white",
                              padding: "4px 8px",
                              borderRadius: 4,
                              display: "inline-block",
                            }}
                          >
                            {(() => {
                              const startDate = task.startDateProg?.date;
                              const startTime = task.startDateProg?.time;
                              const endDate = task.endDateProg?.date;
                              const endTime = task.endDateProg?.time;

                              if (
                                !startDate ||
                                !startTime ||
                                !endDate ||
                                !endTime ||
                                startDate === "" ||
                                endDate === ""
                              ) {
                                return "N/A";
                              }

                              // Convertir "DD/MM/YY" a "YYYY-MM-DD"
                              const toISO = (d: string, t: string) => {
                                try {
                                  // Validar que la fecha tenga el formato correcto
                                  if (
                                    !d ||
                                    typeof d !== "string" ||
                                    !d.includes("/")
                                  ) {
                                    return null;
                                  }

                                  const parts = d.split("/");
                                  if (parts.length !== 3) {
                                    return null;
                                  }

                                  const [day, month, year] = parts;

                                  // Validar que todas las partes existan y no sean undefined
                                  if (!day || !month || !year) {
                                    return null;
                                  }

                                  // Si el año es de 2 dígitos, asume 2000+
                                  const fullYear =
                                    year.length === 2 ? `20${year}` : year;

                                  return `${fullYear}-${month.padStart(
                                    2,
                                    "0"
                                  )}-${day.padStart(2, "0")}T${t}`;
                                } catch (error) {
                                  console.error(
                                    "Error parsing date:",
                                    d,
                                    error
                                  );
                                  return null;
                                }
                              };

                              const startISO = toISO(startDate, startTime);
                              const endISO = toISO(endDate, endTime);

                              // Validar que las conversiones fueron exitosas
                              if (!startISO || !endISO) {
                                return "N/A";
                              }

                              const startProg = new Date(startISO);
                              const endProg = new Date(endISO);

                              // Validar que las fechas sean válidas
                              if (
                                isNaN(startProg.getTime()) ||
                                isNaN(endProg.getTime())
                              ) {
                                return "N/A";
                              }

                              const now = new Date();

                              if (now <= startProg) return "0%";
                              if (now >= endProg) return "100%";

                              const total =
                                endProg.getTime() - startProg.getTime();
                              const transcurrido =
                                now.getTime() - startProg.getTime();

                              // Validar que total sea mayor que 0 para evitar división por 0
                              if (total <= 0) {
                                return "N/A";
                              }

                              const porcentaje = Math.max(
                                0,
                                Math.min(
                                  100,
                                  Math.round((transcurrido / total) * 100)
                                )
                              );

                              return `${porcentaje}%`;
                            })()}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      ))}

      {/* ── TRABAJOS ADICIONALES (AIT — not in original plan) ─────── */}
      <div style={{ marginTop: 32 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "12px 16px",
            background: "linear-gradient(135deg, #e6a817, #f59f00)",
            borderRadius: aitOpen ? "10px 10px 0 0" : 10,
            cursor: "pointer",
            userSelect: "none",
          }}
          onClick={() => setAitOpen((o) => !o)}
        >
          <span style={{ fontSize: 18 }}>➕</span>
          <span style={{ fontWeight: 700, fontSize: 15, color: "white" }}>
            Trabajos Adicionales — Fuera del Plan Gantt
          </span>
          <span
            style={{
              marginLeft: "auto",
              background: "rgba(255,255,255,0.25)",
              color: "white",
              padding: "2px 10px",
              borderRadius: 12,
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            {aitServices.length} servicio{aitServices.length !== 1 ? "s" : ""}
          </span>
          <span style={{ color: "white", fontSize: 18, marginLeft: 4 }}>
            {aitOpen ? "▲" : "▼"}
          </span>
        </div>

        {aitOpen && (
          <div
            style={{
              background: "white",
              borderRadius: "0 0 10px 10px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
              overflow: "hidden",
            }}
          >
            {aitServices.length === 0 ? (
              <div
                style={{
                  padding: "24px 20px",
                  textAlign: "center",
                  color: "#aaa",
                  fontSize: 14,
                }}
              >
                No hay trabajos adicionales registrados para esta parada.
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table
                  style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}
                >
                  <thead>
                    <tr style={{ background: "#fff8e1", textAlign: "left" }}>
                      {[
                        "N° AIT",
                        "Nombre del Servicio",
                        "Tag Equipo",
                        "Área",
                        "Tipo",
                        "Empresa",
                        "Supervisor EECC",
                        "HH",
                        "Inicio",
                        "Fin",
                        "Estado",
                      ].map((h) => (
                        <th
                          key={h}
                          style={{
                            padding: "10px 12px",
                            border: "1px solid #ffe082",
                            fontWeight: 700,
                            color: "#6d4c00",
                            fontSize: 12,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {aitServices.map((svc: any, i: number) => {
                      const startDt = toDateTimeObj(svc.FechaInicio);
                      const endDt = toDateTimeObj(svc.FechaFin);
                      const hasEvents = Array.isArray(svc.events) && svc.events.length > 0;
                      const lastEvent = hasEvents
                        ? svc.events[svc.events.length - 1]
                        : null;
                      const avance = svc.AvanceEjecucion
                        ? `${svc.AvanceEjecucion}%`
                        : lastEvent?.porcentajeAvance
                        ? `${lastEvent.porcentajeAvance}%`
                        : "—";
                      const estadoColor =
                        avance === "100%"
                          ? "#198754"
                          : hasEvents
                          ? "#1976d2"
                          : "#e6a817";
                      const estadoLabel =
                        avance === "100%"
                          ? "Completado"
                          : hasEvents
                          ? "En Progreso"
                          : "Pendiente";
                      return (
                        <tr
                          key={svc.idServiciosAIT || i}
                          style={{ background: i % 2 === 0 ? "white" : "#fffdf0" }}
                        >
                          <td
                            style={{
                              padding: "10px 12px",
                              border: "1px solid #f0e0a0",
                              fontWeight: 700,
                              color: "#2A3B76",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {svc.NumeroAIT || "—"}
                          </td>
                          <td
                            style={{
                              padding: "10px 12px",
                              border: "1px solid #f0e0a0",
                              maxWidth: 260,
                              fontSize: 12,
                            }}
                          >
                            {svc.NombreServicio || "—"}
                          </td>
                          <td
                            style={{
                              padding: "10px 12px",
                              border: "1px solid #f0e0a0",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {svc.TagEquipo ? (
                              <span
                                style={{
                                  background: "#e3f2fd",
                                  color: "#1565c0",
                                  padding: "2px 8px",
                                  borderRadius: 8,
                                  fontSize: 11,
                                  fontWeight: 700,
                                }}
                              >
                                {svc.TagEquipo}
                              </span>
                            ) : (
                              "—"
                            )}
                          </td>
                          <td
                            style={{
                              padding: "10px 12px",
                              border: "1px solid #f0e0a0",
                              fontSize: 12,
                            }}
                          >
                            {svc.AreaServicio || "—"}
                          </td>
                          <td
                            style={{
                              padding: "10px 12px",
                              border: "1px solid #f0e0a0",
                              fontSize: 12,
                            }}
                          >
                            {svc.TipoServicio || "—"}
                          </td>
                          <td
                            style={{
                              padding: "10px 12px",
                              border: "1px solid #f0e0a0",
                              fontSize: 12,
                            }}
                          >
                            {svc.EmpresaMinera || svc.companyName || "—"}
                          </td>
                          <td
                            style={{
                              padding: "10px 12px",
                              border: "1px solid #f0e0a0",
                              fontSize: 12,
                            }}
                          >
                            {svc.ResponsableEmpresaContratista3 || "—"}
                          </td>
                          <td
                            style={{
                              padding: "10px 12px",
                              border: "1px solid #f0e0a0",
                              textAlign: "center",
                              fontWeight: 700,
                            }}
                          >
                            {svc.HorasTotales
                              ? `${Math.round(parseFloat(svc.HorasTotales))}h`
                              : "—"}
                          </td>
                          <td
                            style={{
                              padding: "10px 12px",
                              border: "1px solid #f0e0a0",
                              fontSize: 12,
                              whiteSpace: "nowrap",
                            }}
                          >
                            {startDt.date} {startDt.time}
                          </td>
                          <td
                            style={{
                              padding: "10px 12px",
                              border: "1px solid #f0e0a0",
                              fontSize: 12,
                              whiteSpace: "nowrap",
                            }}
                          >
                            {endDt.date} {endDt.time}
                          </td>
                          <td
                            style={{
                              padding: "10px 12px",
                              border: "1px solid #f0e0a0",
                              textAlign: "center",
                            }}
                          >
                            <span
                              style={{
                                background: estadoColor,
                                color: "white",
                                padding: "3px 9px",
                                borderRadius: 10,
                                fontSize: 11,
                                fontWeight: 700,
                              }}
                            >
                              {estadoLabel}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityView;
