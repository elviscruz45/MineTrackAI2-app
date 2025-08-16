import React, { useState } from "react";

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
  tasks: Task[]; // Changed from activities to tasks directly
}

interface ActivityData {
  title: string;
  equipoLabel: string;
  sections: Section[];
}

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
      tasks: [
        {
          id: "1.1.1.1.1",
          wbs: "1.1.1.1.1",
          tag: "SECCION",
          status: "Pendiente",
          company: "Antamina",
          task: "PM Alimentador Pebbles 3M",
          hours: 1,
          workHours: 1,
          startDateProg: { date: "02/06/25", time: "08:00" },
          endDateProg: { date: "03/06/25", time: "08:00" },
          startDateReal: {},
          endDateReal: {},
          deltaWork: { hours: 0, percent: "0%" },
          deltaStart: { hours: 0, percent: "0%" },
          duration: {},
          avance: "0%",
          expected: "100%",
          actions: ["edit", "notes", "photos", "delete"],
        },
        {
          id: "1.1.1.1.2",
          wbs: "1.1.1.1.2",
          tag: "SECCION",
          status: "Pendiente",
          company: "Antamina",
          task: "Cambio de liner falderas a condición",
          hours: 1,
          workHours: 1,
          startDateProg: { date: "03/06/25", time: "08:00" },
          endDateProg: { date: "03/06/25", time: "20:00" },
          startDateReal: {},
          endDateReal: {},
          deltaWork: { hours: 0, percent: "0%" },
          deltaStart: { hours: 0, percent: "0%" },
          duration: {},
          avance: "0%",
          expected: "100%",
          actions: ["edit", "notes", "photos", "delete"],
        },
        {
          id: "1.1.1.1.3",
          wbs: "1.1.1.1.3",
          tag: "SECCION",
          status: "Pendiente",
          company: "Antamina",
          task: "PM chute de descarga hacia la chancadora",
          hours: 1,
          workHours: 1,
          startDateProg: { date: "03/06/25", time: "20:00" },
          endDateProg: { date: "04/06/25", time: "08:00" },
          startDateReal: {},
          endDateReal: {},
          deltaWork: { hours: 0, percent: "0%" },
          deltaStart: { hours: 0, percent: "0%" },
          duration: {},
          avance: "0%",
          expected: "100%",
          actions: ["edit", "notes", "photos", "delete"],
        },
        {
          id: "1.1.1.1.4",
          wbs: "1.1.1.1.4",
          tag: "SECCION",
          status: "Pendiente",
          company: "Antamina",
          task: "Cambio de camas de impacto",
          hours: 1,
          workHours: 1,
          startDateProg: { date: "04/06/25", time: "20:00" },
          endDateProg: { date: "05/06/25", time: "08:00" },
          startDateReal: {},
          endDateReal: {},
          deltaWork: { hours: 0, percent: "0%" },
          deltaStart: { hours: 0, percent: "0%" },
          duration: {},
          avance: "0%",
          expected: "100%",
          actions: ["edit", "notes", "photos", "delete"],
        },
        {
          id: "1.1.1.1.5",
          wbs: "1.1.1.1.5",
          tag: "SECCION",
          status: "Pendiente",
          company: "Antamina",
          task: "Inspección de liners superiores (lado descarga de silo)",
          hours: 1,
          workHours: 1,
          startDateProg: { date: "05/06/25", time: "08:00" },
          endDateProg: { date: "05/06/25", time: "20:00" },
          startDateReal: {},
          endDateReal: {},
          deltaWork: { hours: 0, percent: "0%" },
          deltaStart: { hours: 0, percent: "0%" },
          duration: {},
          avance: "0%",
          expected: "100%",
          actions: ["edit", "notes", "photos", "delete"],
        },
        {
          id: "1.1.1.1.6",
          wbs: "1.1.1.1.6",
          tag: "SECCION",
          status: "Pendiente",
          company: "Antamina",
          task: "Inspección Alimentador Pebbles 3M",
          hours: 1,
          workHours: 1,
          startDateProg: { date: "05/06/25", time: "20:00" },
          endDateProg: { date: "06/06/25", time: "08:00" },
          startDateReal: {},
          endDateReal: {},
          deltaWork: { hours: 0, percent: "0%" },
          deltaStart: { hours: 0, percent: "0%" },
          duration: {},
          avance: "0%",
          expected: "100%",
          actions: ["edit", "notes", "photos", "delete"],
        },
        {
          id: "1.1.1.1.7",
          wbs: "1.1.1.1.7",
          tag: "SECCION",
          status: "Pendiente",
          company: "Antamina",
          task: "Alineamiento de plataforma de impacto y polines de carga",
          hours: 1,
          workHours: 1,
          startDateProg: { date: "06/06/25", time: "08:00" },
          endDateProg: { date: "07/06/25", time: "08:00" },
          startDateReal: {},
          endDateReal: {},
          deltaWork: { hours: 0, percent: "0%" },
          deltaStart: { hours: 0, percent: "0%" },
          duration: {},
          avance: "0%",
          expected: "100%",
          actions: ["edit", "notes", "photos", "delete"],
        },
        {
          id: "1.1.1.1.8",
          wbs: "1.1.1.1.8",
          tag: "SECCION",
          status: "Pendiente",
          company: "Antamina",
          task: "Cambio de liner falderas a condición",
          hours: 1,
          workHours: 1,
          startDateProg: { date: "07/06/25", time: "08:00" },
          endDateProg: { date: "07/06/25", time: "20:00" },
          startDateReal: {},
          endDateReal: {},
          deltaWork: { hours: 0, percent: "0%" },
          deltaStart: { hours: 0, percent: "0%" },
          duration: {},
          avance: "0%",
          expected: "100%",
          actions: ["edit", "notes", "photos", "delete"],
        },
        {
          id: "1.1.1.1.9",
          wbs: "1.1.1.1.9",
          tag: "SECCION",
          status: "Pendiente",
          company: "Antamina",
          task: "Cambio de camas de impacto",
          hours: 1,
          workHours: 1,
          startDateProg: { date: "07/06/25", time: "20:00" },
          endDateProg: { date: "08/06/25", time: "08:00" },
          startDateReal: {},
          endDateReal: {},
          deltaWork: { hours: 0, percent: "0%" },
          deltaStart: { hours: 0, percent: "0%" },
          duration: {},
          avance: "0%",
          expected: "100%",
          actions: ["edit", "notes", "photos", "delete"],
        },
        {
          id: "1.1.1.1.10",
          wbs: "1.1.1.1.10",
          tag: "SECCION",
          status: "Pendiente",
          company: "Antamina",
          task: "Cambio de liners superiores (lado descarga de silo)",
          hours: 1,
          workHours: 1,
          startDateProg: { date: "08/06/25", time: "08:00" },
          endDateProg: { date: "08/06/25", time: "20:00" },
          startDateReal: {},
          endDateReal: {},
          deltaWork: { hours: 0, percent: "0%" },
          deltaStart: { hours: 0, percent: "0%" },
          duration: {},
          avance: "0%",
          expected: "100%",
          actions: ["edit", "notes", "photos", "delete"],
        },
        {
          id: "1.1.1.1.11",
          wbs: "1.1.1.1.11",
          tag: "SECCION",
          status: "Pendiente",
          company: "Antamina",
          task: "PM en chute de descarga hacia la chancadora",
          hours: 1,
          workHours: 1,
          startDateProg: { date: "08/06/25", time: "20:00" },
          endDateProg: { date: "09/06/25", time: "08:00" },
          startDateReal: {},
          endDateReal: {},
          deltaWork: { hours: 0, percent: "0%" },
          deltaStart: { hours: 0, percent: "0%" },
          duration: {},
          avance: "0%",
          expected: "100%",
          actions: ["edit", "notes", "photos", "delete"],
        },
      ],
    },
    {
      id: "2.1.1.1",
      title:
        "PM Mantto faja Pebbles 3M - PM Chute (CVB025 - STP027 - STP026P - MAS023 - TKF031)",
      type: "Actividad",
      isOpen: false,
      tasks: [
        {
          id: "2.1.1.1.1",
          wbs: "2.1.1.1.1",
          tag: "SECCION",
          status: "Pendiente",
          company: "Antamina",
          task: "PM Mantto faja Pebbles 3M",
          hours: 1,
          workHours: 1,
          startDateProg: { date: "01/06/25", time: "08:00" },
          endDateProg: { date: "02/06/25", time: "08:00" },
          startDateReal: {},
          endDateReal: {},
          deltaWork: { hours: 0, percent: "0%" },
          deltaStart: { hours: 0, percent: "0%" },
          duration: {},
          avance: "0%",
          expected: "100%",
          actions: ["edit", "notes", "photos", "delete"],
        },
        {
          id: "2.1.1.1.2",
          wbs: "2.1.1.1.2",
          tag: "SECCION",
          status: "Pendiente",
          company: "Antamina",
          task: "PM Mantto faja Pebbles 3M",
          hours: 1,
          workHours: 1,
          startDateProg: { date: "02/06/25", time: "08:00" },
          endDateProg: { date: "03/06/25", time: "08:00" },
          startDateReal: {},
          endDateReal: {},
          deltaWork: { hours: 0, percent: "0%" },
          deltaStart: { hours: 0, percent: "0%" },
          duration: {},
          avance: "0%",
          expected: "100%",
          actions: ["edit", "notes", "photos", "delete"],
        },
        {
          id: "2.1.1.1.3",
          wbs: "2.1.1.1.3",
          tag: "SECCION",
          status: "Pendiente",
          company: "Antamina",
          task: "Reparación de bandeja de lodos y linea de drenaje",
          hours: 1,
          workHours: 1,
          startDateProg: { date: "03/06/25", time: "08:00" },
          endDateProg: { date: "03/06/25", time: "20:00" },
          startDateReal: {},
          endDateReal: {},
          deltaWork: { hours: 0, percent: "0%" },
          deltaStart: { hours: 0, percent: "0%" },
          duration: {},
          avance: "0%",
          expected: "100%",
          actions: ["edit", "notes", "photos", "delete"],
        },
        {
          id: "2.1.1.1.4",
          wbs: "2.1.1.1.4",
          tag: "SECCION",
          status: "Pendiente",
          company: "Antamina",
          task: "Cambio de templadores metálicos (a condición)",
          hours: 1,
          workHours: 1,
          startDateProg: { date: "03/06/25", time: "20:00" },
          endDateProg: { date: "04/06/25", time: "08:00" },
          startDateReal: {},
          endDateReal: {},
          deltaWork: { hours: 0, percent: "0%" },
          deltaStart: { hours: 0, percent: "0%" },
          duration: {},
          avance: "0%",
          expected: "100%",
          actions: ["edit", "notes", "photos", "delete"],
        },
        {
          id: "2.1.1.1.5",
          wbs: "2.1.1.1.5",
          tag: "SECCION",
          status: "Pendiente",
          company: "Antamina",
          task: "Cambio de polea de cola (postergador)",
          hours: 1,
          workHours: 1,
          startDateProg: { date: "04/06/25", time: "08:00" },
          endDateProg: { date: "04/06/25", time: "20:00" },
          startDateReal: {},
          endDateReal: {},
          deltaWork: { hours: 0, percent: "0%" },
          deltaStart: { hours: 0, percent: "0%" },
          duration: {},
          avance: "0%",
          expected: "100%",
          actions: ["edit", "notes", "photos", "delete"],
        },
        {
          id: "2.1.1.1.6",
          wbs: "2.1.1.1.6",
          tag: "SECCION",
          status: "Pendiente",
          company: "Antamina",
          task: "Cambio de totalidad de polines de retorno",
          hours: 1,
          workHours: 1,
          startDateProg: { date: "04/06/25", time: "20:00" },
          endDateProg: { date: "05/06/25", time: "08:00" },
          startDateReal: {},
          endDateReal: {},
          deltaWork: { hours: 0, percent: "0%" },
          deltaStart: { hours: 0, percent: "0%" },
          duration: {},
          avance: "0%",
          expected: "100%",
          actions: ["edit", "notes", "photos", "delete"],
        },
        {
          id: "2.1.1.1.7",
          wbs: "2.1.1.1.7",
          tag: "SECCION",
          status: "Pendiente",
          company: "Antamina",
          task: "Reparaciòn de mesa de faja (lado cola)",
          hours: 1,
          workHours: 1,
          startDateProg: { date: "05/06/25", time: "08:00" },
          endDateProg: { date: "05/06/25", time: "20:00" },
          startDateReal: {},
          endDateReal: {},
          deltaWork: { hours: 0, percent: "0%" },
          deltaStart: { hours: 0, percent: "0%" },
          duration: {},
          avance: "0%",
          expected: "100%",
          actions: ["edit", "notes", "photos", "delete"],
        },
        {
          id: "2.1.1.1.8",
          wbs: "2.1.1.1.8",
          tag: "SECCION",
          status: "Pendiente",
          company: "Antamina",
          task: "PM Chute STP027",
          hours: 1,
          workHours: 1,
          startDateProg: { date: "05/06/25", time: "20:00" },
          endDateProg: { date: "06/06/25", time: "08:00" },
          startDateReal: {},
          endDateReal: {},
          deltaWork: { hours: 0, percent: "0%" },
          deltaStart: { hours: 0, percent: "0%" },
          duration: {},
          avance: "0%",
          expected: "100%",
          actions: ["edit", "notes", "photos", "delete"],
        },
        {
          id: "2.1.1.1.9",
          wbs: "2.1.1.1.9",
          tag: "SECCION",
          status: "Pendiente",
          company: "Antamina",
          task: "Insp y/o cambio de rodamientos y chumaceras",
          hours: 1,
          workHours: 1,
          startDateProg: { date: "06/06/25", time: "08:00" },
          endDateProg: { date: "06/06/25", time: "20:00" },
          startDateReal: {},
          endDateReal: {},
          deltaWork: { hours: 0, percent: "0%" },
          deltaStart: { hours: 0, percent: "0%" },
          duration: {},
          avance: "0%",
          expected: "100%",
          actions: ["edit", "notes", "photos", "delete"],
        },
        {
          id: "2.1.1.1.10",
          wbs: "2.1.1.1.10",
          tag: "SECCION",
          status: "Pendiente",
          company: "Antamina",
          task: "Insp. y/o cambio de liners de compuerta",
          hours: 1,
          workHours: 1,
          startDateProg: { date: "06/06/25", time: "20:00" },
          endDateProg: { date: "07/06/25", time: "08:00" },
          startDateReal: {},
          endDateReal: {},
          deltaWork: { hours: 0, percent: "0%" },
          deltaStart: { hours: 0, percent: "0%" },
          duration: {},
          avance: "0%",
          expected: "100%",
          actions: ["edit", "notes", "photos", "delete"],
        },
        {
          id: "2.1.1.1.11",
          wbs: "2.1.1.1.11",
          tag: "SECCION",
          status: "Pendiente",
          company: "Antamina",
          task: "PM Chute STP026P",
          hours: 1,
          workHours: 1,
          startDateProg: { date: "07/06/25", time: "08:00" },
          endDateProg: { date: "07/06/25", time: "20:00" },
          startDateReal: {},
          endDateReal: {},
          deltaWork: { hours: 0, percent: "0%" },
          deltaStart: { hours: 0, percent: "0%" },
          duration: {},
          avance: "0%",
          expected: "100%",
          actions: ["edit", "notes", "photos", "delete"],
        },
        {
          id: "2.1.1.1.12",
          wbs: "2.1.1.1.12",
          tag: "SECCION",
          status: "Pendiente",
          company: "Antamina",
          task: "Reparación interna de chute y centrado de carga",
          hours: 1,
          workHours: 1,
          startDateProg: { date: "07/06/25", time: "20:00" },
          endDateProg: { date: "08/06/25", time: "08:00" },
          startDateReal: {},
          endDateReal: {},
          deltaWork: { hours: 0, percent: "0%" },
          deltaStart: { hours: 0, percent: "0%" },
          duration: {},
          avance: "0%",
          expected: "100%",
          actions: ["edit", "notes", "photos", "delete"],
        },
        {
          id: "2.1.1.1.13",
          wbs: "2.1.1.1.13",
          tag: "SECCION",
          status: "Pendiente",
          company: "Antamina",
          task: "PM Magneto 23",
          hours: 1,
          workHours: 1,
          startDateProg: { date: "08/06/25", time: "08:00" },
          endDateProg: { date: "08/06/25", time: "20:00" },
          startDateReal: {},
          endDateReal: {},
          deltaWork: { hours: 0, percent: "0%" },
          deltaStart: { hours: 0, percent: "0%" },
          duration: {},
          avance: "0%",
          expected: "100%",
          actions: ["edit", "notes", "photos", "delete"],
        },
        {
          id: "2.1.1.1.14",
          wbs: "2.1.1.1.14",
          tag: "SECCION",
          status: "Pendiente",
          company: "Antamina",
          task: "Cambio de fajín (a condición)",
          hours: 1,
          workHours: 1,
          startDateProg: { date: "08/06/25", time: "20:00" },
          endDateProg: { date: "09/06/25", time: "02:00" },
          startDateReal: {},
          endDateReal: {},
          deltaWork: { hours: 0, percent: "0%" },
          deltaStart: { hours: 0, percent: "0%" },
          duration: {},
          avance: "0%",
          expected: "100%",
          actions: ["edit", "notes", "photos", "delete"],
        },
        {
          id: "2.1.1.1.15",
          wbs: "2.1.1.1.15",
          tag: "SECCION",
          status: "Pendiente",
          company: "Antamina",
          task: "Inspección de chumaceras en los electroimanes",
          hours: 1,
          workHours: 1,
          startDateProg: { date: "09/06/25", time: "02:00" },
          endDateProg: { date: "09/06/25", time: "05:00" },
          startDateReal: {},
          endDateReal: {},
          deltaWork: { hours: 0, percent: "0%" },
          deltaStart: { hours: 0, percent: "0%" },
          duration: {},
          avance: "0%",
          expected: "100%",
          actions: ["edit", "notes", "photos", "delete"],
        },
        {
          id: "2.1.1.1.16",
          wbs: "2.1.1.1.16",
          tag: "SECCION",
          status: "Pendiente",
          company: "Antamina",
          task: "Levantamiento de información para planos de plataforma para alineamiento (I",
          hours: 1,
          workHours: 1,
          startDateProg: { date: "09/06/25", time: "05:00" },
          endDateProg: { date: "09/06/25", time: "08:00" },
          startDateReal: {},
          endDateReal: {},
          deltaWork: { hours: 0, percent: "0%" },
          deltaStart: { hours: 0, percent: "0%" },
          duration: {},
          avance: "0%",
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

const ActivityView: React.FC<{ selectedProject?: string }> = ({
  selectedProject = "PROYECTO",
}) => {
  const [activeFilter, setActiveFilter] = useState("Todas");
  const [sections, setSections] = useState(
    mockActivitiesData.sections.map((section) => ({
      ...section,
      isOpen: section.id === "1.1", // Only section 1.1 is open by default
    }))
  );

  // Function to check if a date is in the past
  const isDatePast = (dateStr: string) => {
    const [day, month, year] = dateStr.split("/").map(Number);
    const date = new Date(2000 + year, month - 1, day);
    return date < new Date();
  };

  // Function to update task status and progress
  const updateTaskStatus = (
    sectionId: string,
    taskId: string,
    newStatus: string,
    newAvance: string
  ) => {
    setSections((prevSections) =>
      prevSections.map((section) => {
        if (section.id === sectionId) {
          return {
            ...section,
            tasks: section.tasks.map((task) => {
              if (task.id === taskId) {
                return {
                  ...task,
                  status: newStatus,
                  avance: newAvance,
                  // Add real start date if task is starting
                  startDateReal:
                    newStatus === "En Progreso" &&
                    Object.keys(task.startDateReal).length === 0
                      ? {
                          date: new Date().toLocaleDateString("es-ES", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "2-digit",
                          }),
                          time: new Date().toLocaleTimeString("es-ES", {
                            hour: "2-digit",
                            minute: "2-digit",
                          }),
                        }
                      : task.startDateReal,
                  // Add real end date if task is completed
                  endDateReal:
                    newStatus === "Completada"
                      ? {
                          date: new Date().toLocaleDateString("es-ES", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "2-digit",
                          }),
                          time: new Date().toLocaleTimeString("es-ES", {
                            hour: "2-digit",
                            minute: "2-digit",
                          }),
                        }
                      : task.endDateReal,
                };
              }
              return task;
            }),
          };
        }
        return section;
      })
    );
  }; // Apply filters to tasks
  const getFilteredSections = () => {
    return sections.map((section) => {
      const filteredTasks = section.tasks.filter((task) => {
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
    setSections((prevSections) =>
      prevSections.map((section) =>
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
      {/* Title */}
      <h2
        style={{
          fontSize: 20,
          color: "#333",
          fontWeight: 600,
          marginBottom: 16,
        }}
      >
        {mockActivitiesData.title}
      </h2>
      <div
        style={{
          fontSize: 14,
          color: "#777",
          marginTop: -10,
          marginBottom: 16,
        }}
      >
        {mockActivitiesData.equipoLabel}
      </div>

      {/* Filter buttons */}
      <div
        style={{
          display: "flex",
          gap: 4,
          marginBottom: 16,
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
          style={buttonStyle(activeFilter === "Atrasadas")}
          onClick={() => setActiveFilter("Atrasadas")}
        >
          Atrasadas
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
        <div style={{ marginLeft: "auto" }}>
          <button
            style={{
              backgroundColor: "transparent",
              color: "#2A3B76",
              border: "none",
              padding: "6px",
              fontSize: 14,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
            onClick={() => {
              // Reset to original data
              setSections(
                mockActivitiesData.sections.map((section) => ({
                  ...section,
                  isOpen: section.id === "1.1",
                }))
              );
              setActiveFilter("Todas");
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
                d="M18 21L12 15L6 21V5C6 4.46957 6.21071 3.96086 6.58579 3.58579C6.96086 3.21071 7.46957 3 8 3H16C16.5304 3 17.0391 3.21071 17.4142 3.58579C17.7893 3.96086 18 4.46957 18 5V21Z"
                stroke="#2A3B76"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Refrescar
          </button>
        </div>
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

      {/* Sections with tasks */}
      {filteredSections.map((section) => (
        <div key={section.id} style={{ marginBottom: 24 }}>
          {section.tasks.length > 0 && (
            <>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "12px 16px",
                  backgroundColor: "#e9ecef",
                  borderRadius: "4px 4px 0 0",
                  cursor: "pointer",
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
                    fontSize: 12,
                    color: "#666",
                    marginLeft: "auto",
                    backgroundColor: "#e2e6ea",
                    padding: "2px 6px",
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
                        Horas (h)
                      </th>
                      <th
                        style={{
                          padding: 10,
                          border: "1px solid #dee2e6",
                          textAlign: "center",
                        }}
                      >
                        Work (h)
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
                      <th
                        style={{
                          padding: 10,
                          border: "1px solid #dee2e6",
                          textAlign: "center",
                        }}
                      >
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {section.tasks.map((task) => (
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
                          {task.hours}
                        </td>
                        <td
                          style={{
                            padding: 10,
                            border: "1px solid #dee2e6",
                            textAlign: "center",
                          }}
                        >
                          {task.workHours}
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
                            {task.expected}
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
                              display: "flex",
                              justifyContent: "center",
                              gap: 8,
                            }}
                          >
                            <button
                              style={{
                                backgroundColor: "transparent",
                                border: "none",
                                cursor: "pointer",
                                padding: 4,
                              }}
                              title="Editar Estado"
                              onClick={() => {
                                const newStatus =
                                  task.status === "Pendiente"
                                    ? "En Progreso"
                                    : task.status === "En Progreso"
                                    ? "Completada"
                                    : "Pendiente";
                                const newAvance =
                                  task.status === "Pendiente"
                                    ? "50%"
                                    : task.status === "En Progreso"
                                    ? "100%"
                                    : "0%";
                                updateTaskStatus(
                                  section.id,
                                  task.id,
                                  newStatus,
                                  newAvance
                                );
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
                                  d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"
                                  stroke="#2A3B76"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                                <path
                                  d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"
                                  stroke="#2A3B76"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </button>
                            <button
                              style={{
                                backgroundColor: "transparent",
                                border: "none",
                                cursor: "pointer",
                                padding: 4,
                              }}
                              title="Notas"
                            >
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v2m0 0v8a2 2 0 002 2h2a2 2 0 002-2v-8a2 2 0 00-2-2h-2a2 2 0 00-2 2z"
                                  stroke="#2A3B76"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </button>
                            <button
                              style={{
                                backgroundColor: "transparent",
                                border: "none",
                                cursor: "pointer",
                                padding: 4,
                              }}
                              title="Fotos"
                            >
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M15 8h.01M9 16a3 3 0 100-6 3 3 0 000 6z"
                                  stroke="#2A3B76"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                                <path
                                  d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"
                                  stroke="#2A3B76"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </button>
                            <button
                              style={{
                                backgroundColor: "transparent",
                                border: "none",
                                cursor: "pointer",
                                padding: 4,
                                color: "#dc3545",
                              }}
                              title="Eliminar"
                            >
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6"
                                  stroke="#dc3545"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </button>
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
    </div>
  );
};

export default ActivityView;
