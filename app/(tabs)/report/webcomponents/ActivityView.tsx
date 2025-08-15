import React from "react";

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

interface Activity {
  id: string;
  title: string;
  type: string;
  isOpen: boolean;
  timeRange: string;
  status?: string;
  deltaWork?: string;
  rutaCritica?: {
    no: boolean;
    si: boolean;
  };
  tasks?: Task[];
}

interface Section {
  id: string;
  title: string;
  type: string;
  isOpen: boolean;
  activities: Activity[];
}

interface ActivityData {
  title: string;
  equipoLabel: string;
  sections: Section[];
}

// Mock data for activities based on the image you provided
const mockActivitiesData: ActivityData = {
  title: "PARADA PRIMARIA & SECCION 1_06 julio 2025",
  equipoLabel: "EQUIPO",
  sections: [
    {
      id: "1.1",
      title:
        "PM Alimentador Pebbles 3M - PM chute de descarga hacia la chancadora",
      type: "Actividad",
      isOpen: true,
      activities: [
        {
          id: "1.1.1",
          title: "TRABAJOS GENERALES",
          type: "Sub Actividad",
          isOpen: true,
          timeRange: "31/05/25 08:00:00 AM -> 09/06/25 08:00:00 AM",
          status: "Esperado: 100%",
          deltaWork: "N+E",
          rutaCritica: {
            no: true,
            si: false,
          },
          tasks: [
            {
              id: "1.1.1.1",
              wbs: "1.1.1.1",
              tag: "SECCION",
              status: "Pendiente",
              company: "Antamina",
              task: "PM Alimentador Pebbles 3M - PM chute de descarga hacia la chancadora (FEB022 - FEB021 - STP038 - STP039)",
              hours: 1,
              workHours: 1,
              startDateProg: { date: "31/05/25", time: "08:00" },
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
            {
              id: "1.1.1.1.16",
              wbs: "1.1.1.1.16",
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
    },
    {
      id: "2.1",
      title: "PM Mantto faja Pebbles 3M - PM Chute",
      type: "Actividad",
      isOpen: false,
      activities: [
        {
          id: "2.1.1",
          title: "TRABAJOS GENERALES",
          type: "Sub Actividad",
          isOpen: false,
          timeRange: "31/05/25 08:00:00 AM -> 09/06/25 08:00:00 AM",
          tasks: [
            {
              id: "2.1.1.1",
              wbs: "2.1.1.1",
              tag: "SECCION",
              status: "Pendiente",
              company: "Antamina",
              task: "PM Mantto faja Pebbles 3M - PM Chute (CVB025 - STP027 - STP026P - MAS023 - TKF031)",
              hours: 1,
              workHours: 1,
              startDateProg: { date: "31/05/25", time: "08:00" },
              endDateProg: { date: "01/06/25", time: "08:00" },
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

const ActivityView: React.FC<{ selectedProject: string }> = ({
  selectedProject,
}) => {
  const [activeFilter, setActiveFilter] = React.useState("Todas");

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
        1 {selectedProject} & SECCION 1_06 julio 2025
      </h2>
      <div
        style={{
          fontSize: 14,
          color: "#777",
          marginTop: -10,
          marginBottom: 16,
        }}
      >
        EQUIPO
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
          style={buttonStyle(activeFilter === "Filtro por Tiempo")}
          onClick={() => setActiveFilter("Filtro por Tiempo")}
        >
          Filtro por Tiempo
        </button>
        <button
          style={buttonStyle(activeFilter === "Filtrar")}
          onClick={() => setActiveFilter("Filtrar")}
        >
          Filtrar
        </button>
        <button
          style={buttonStyle(activeFilter === "Atrasadas Reportaje")}
          onClick={() => setActiveFilter("Atrasadas Reportaje")}
        >
          Atrasadas Reportaje
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

      {/* Section 1.1 */}
      <div style={{ marginBottom: 24 }}>
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
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M19 9L12 16L5 9"
              stroke="#333"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span style={{ fontWeight: 600 }}>1.1 SECCION 1</span>
          <span style={{ fontSize: 12, color: "#777", marginLeft: 8 }}>
            Actividad
          </span>
        </div>

        {/* Subactividad 1.1.1 */}
        <div style={{ marginLeft: 20, marginTop: 8 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 16px",
              backgroundColor: "#f1f3f5",
              borderRadius: "4px 4px 0 0",
              cursor: "pointer",
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
                d="M19 9L12 16L5 9"
                stroke="#333"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span style={{ fontWeight: 600 }}>1.1.1 TRABAJOS GENERALES</span>
            <span style={{ fontSize: 12, color: "#777", marginLeft: 8 }}>
              Sub Actividad
            </span>
          </div>

          <div style={{ marginLeft: 20, padding: "8px 16px", fontSize: 14 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 8,
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
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  stroke="#777"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>07-07-2025 10:00 → 09-07-2025 02:00</span>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 12,
              }}
            >
              <span
                style={{
                  backgroundColor: "#e9ecef",
                  color: "#495057",
                  padding: "4px 8px",
                  borderRadius: 4,
                  fontSize: 13,
                  fontWeight: 500,
                }}
              >
                Esperado: 100%
              </span>
              <span
                style={{
                  backgroundColor: "#ffa94d",
                  color: "#fff",
                  padding: "4px 8px",
                  borderRadius: 4,
                  fontSize: 13,
                  fontWeight: 500,
                }}
              >
                DELTA WORK N+E
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ fontWeight: 500, fontSize: 13 }}>
                  RUTA CRITICA:
                </span>
                <span
                  style={{
                    backgroundColor: "#e9ecef",
                    color: "#495057",
                    padding: "4px 8px",
                    borderRadius: 4,
                    fontSize: 13,
                    fontWeight: 500,
                  }}
                >
                  NO
                </span>
                <span
                  style={{
                    backgroundColor: "#fff",
                    color: "#adb5bd",
                    padding: "4px 8px",
                    border: "1px solid #dee2e6",
                    borderRadius: 4,
                    fontSize: 13,
                    fontWeight: 500,
                  }}
                >
                  SI
                </span>
              </div>
            </div>

            {/* Table */}
            <div style={{ overflowX: "auto", marginBottom: 16 }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: 13,
                }}
              >
                <thead>
                  <tr style={{ backgroundColor: "#e9ecef", textAlign: "left" }}>
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
                  {mockActivitiesData.sections[0].activities[0].tasks?.map(
                    (item: Task) => (
                      <tr key={item.id}>
                        <td
                          style={{ padding: 10, border: "1px solid #dee2e6" }}
                        >
                          {item.wbs}
                        </td>
                        <td
                          style={{ padding: 10, border: "1px solid #dee2e6" }}
                        >
                          {item.tag}
                        </td>
                        <td
                          style={{ padding: 10, border: "1px solid #dee2e6" }}
                        >
                          <div
                            style={{
                              backgroundColor: "#007bff",
                              color: "white",
                              padding: "3px 6px",
                              borderRadius: 4,
                              display: "inline-block",
                              fontSize: 12,
                            }}
                          >
                            {item.status}
                          </div>
                          <div style={{ marginTop: 4, fontSize: 12 }}>
                            {item.company}
                          </div>
                        </td>
                        <td
                          style={{ padding: 10, border: "1px solid #dee2e6" }}
                        >
                          {item.task}
                        </td>
                        <td
                          style={{
                            padding: 10,
                            border: "1px solid #dee2e6",
                            textAlign: "center",
                          }}
                        >
                          {item.hours}
                        </td>
                        <td
                          style={{
                            padding: 10,
                            border: "1px solid #dee2e6",
                            textAlign: "center",
                          }}
                        >
                          {item.workHours}
                        </td>
                        <td
                          style={{
                            padding: 10,
                            border: "1px solid #dee2e6",
                            textAlign: "center",
                          }}
                        >
                          <div>{item.startDateProg.date}</div>
                          <div>{item.startDateProg.time}</div>
                        </td>
                        <td
                          style={{
                            padding: 10,
                            border: "1px solid #dee2e6",
                            textAlign: "center",
                          }}
                        >
                          <div>{item.endDateProg.date}</div>
                          <div>{item.endDateProg.time}</div>
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
                              backgroundColor: "#dc3545",
                              color: "white",
                              padding: "4px 8px",
                              borderRadius: 4,
                              display: "inline-block",
                            }}
                          >
                            {item.avance}
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
                            {item.expected}
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
                    )
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Section 1.2 (collapsed) */}
      {/* <div style={{ marginBottom: 24 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "12px 16px",
            backgroundColor: "#e9ecef",
            borderRadius: 4,
            cursor: "pointer",
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
              d="M9 18L15 12L9 6"
              stroke="#333"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span style={{ fontWeight: 600 }}>1.2 EDIFICIO STOCK PILE</span>
          <span style={{ fontSize: 12, color: "#777", marginLeft: 8 }}>
            Actividad
          </span>
        </div>
      </div> */}

      {/* Button to add new section */}
      {/* <div style={{ marginTop: 24 }}>
        <button
          style={{
            backgroundColor: "#2A3B76",
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
              d="M12 5v14M5 12h14"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Agregar
        </button>
      </div> */}
    </div>
  );
};

export default ActivityView;
