import React from "react";
import ProgressChartWeb from "./ProgressChartweb";
import ActivityView from "./ActivityView";
import CriticalRouteView from "./CriticalRouteView";

interface OnePageReportProps {
  selectedProject: any;
}

// Mock data based on the image provided
const mockOnePageData: any = {
  title: "REPORTE ONEPAGE - CONSOLIDADO AL 10-08-2025 15:13HRS",
  company: "Cerro Verde",
  area: "EQUIPOS ÁREA SECA",
  department: "MANTENIMIENTO",
  statusChart: {
    // This data format will be used by the ProgressChartWeb component
    programmed: [
      { date: "07-07-2025", time: "07:00", value: 0 },
      { date: "07-07-2025", time: "19:00", value: 20 },
      { date: "08-07-2025", time: "07:00", value: 40 },
      { date: "08-07-2025", time: "19:00", value: 65 },
      { date: "09-07-2025", time: "07:00", value: 85 },
      { date: "09-07-2025", time: "19:00", value: 95 },
      { date: "10-07-2025", time: "07:00", value: 100 },
    ],
    real: [
      { date: "07-07-2025", time: "07:00", value: 0 },
      { date: "07-07-2025", time: "19:00", value: 10 },
      { date: "08-07-2025", time: "07:00", value: 20 },
      { date: "08-07-2025", time: "19:00", value: 30 },
      { date: "09-07-2025", time: "07:00", value: 50 },
      { date: "09-07-2025", time: "19:00", value: 65 },
      { date: "10-07-2025", time: "07:00", value: 85 },
    ],
    projected: [
      { date: "07-07-2025", time: "07:00", value: 0 },
      { date: "07-07-2025", time: "19:00", value: 8 },
      { date: "08-07-2025", time: "07:00", value: 15 },
      { date: "08-07-2025", time: "19:00", value: 25 },
      { date: "09-07-2025", time: "07:00", value: 40 },
      { date: "09-07-2025", time: "19:00", value: 65 },
      { date: "10-07-2025", time: "07:00", value: 90 },
      { date: "10-07-2025", time: "19:00", value: 100 },
    ],
  },
  taskStatus: {
    total: 27, // Total de tareas según los datos proporcionados
    initiated: 7, // Tareas en progreso (ejemplo: tareas entre fechas de inicio y fin, no completadas)
    notInitiatedLate: 2, // Tareas no iniciadas y cuya fecha de inicio ya pasó
    completed: 18, // Tareas completadas (ejemplo: tareas cuya fecha fin ya pasó y están marcadas como terminadas)
    cancelled: 0, // Tareas canceladas (no hay en los datos)
    notInitiated: 5, // Tareas no iniciadas y cuya fecha de inicio es futura
    initiatedLate: 0, // Tareas iniciadas pero atrasadas (puedes ajustar según lógica de atraso real)
    notInitiatedInProgress: 0, // Tareas no iniciadas pero en progreso (no aplica en los datos actuales)
  },
  tasksBySection: [
    {
      id: "1.1",
      section: "SECCION 1",
      tasks: [
        {
          id: "1.1.1",
          title: "TRABAJOS GENERALES",
          tasks: [
            {
              wbs: "1.1.1.1",
              status: "NO INICIADA ATRASADA",
              task: "CAMBIO DE POLINES PARADA DE SECCION",
              hours: 40,
              startProg: {
                date: "2025-07-07",
                time: "10:00",
              },
              endProg: {
                date: "2025-07-09",
                time: "02:00",
              },
              deltaWorkHours: null,
              deltaStartHours: null,
              expectedProgress: "100%",
              actualProgress: "0%",
            },
            {
              wbs: "1.1.1.2",
              status: "NO INICIADA ATRASADA",
              task: "MANTENIMIENTO DE RASPADORES FAJAS",
              hours: 40,
              startProg: {
                date: "2025-07-07",
                time: "10:00",
              },
              endProg: {
                date: "2025-07-09",
                time: "02:00",
              },
              deltaWorkHours: null,
              deltaStartHours: null,
              expectedProgress: "100%",
              actualProgress: "0%",
            },
            {
              wbs: "1.1.1.3",
              status: "NO INICIADA ATRASADA",
              task: "MANTENIMIENTO DE ALINEADORES FAJAS",
              hours: 40,
              startProg: {
                date: "2025-07-07",
                time: "10:00",
              },
              endProg: {
                date: "2025-07-09",
                time: "02:00",
              },
              deltaWorkHours: null,
              deltaStartHours: null,
              expectedProgress: "100%",
              actualProgress: "0%",
            },
            {
              wbs: "1.1.1.4",
              status: "NO INICIADA ATRASADA",
              task: "MANTENIMIENTO V-PLOW SECCION",
              hours: 40,
              startProg: {
                date: "2025-07-07",
                time: "10:00",
              },
              endProg: {
                date: "2025-07-09",
                time: "02:00",
              },
              deltaWorkHours: null,
              deltaStartHours: null,
              expectedProgress: "100%",
              actualProgress: "0%",
            },
          ],
        },
      ],
    },
    {
      id: "1.2",
      section: "EDIFICIO STOCK PILE",
      tasks: [
        {
          id: "1.2.1",
          title: "FEEDER FE012@FE015",
          tasks: [],
        },
      ],
    },
  ],
};

const OnePageView: React.FC<OnePageReportProps> = ({ selectedProject }) => {
  return (
    <div
      style={{
        padding: "24px 0",
        backgroundColor: "#f8f9fa",
        minHeight: "100vh",
      }}
    >
      {/* Header with title and buttons */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
          borderBottom: "1px solid #eaeaea",
          paddingBottom: 16,
          backgroundColor: "white",
          padding: "16px 24px",
          borderRadius: "8px",
          boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
              fontSize: 22,
              fontWeight: 600,
              color: "#2A3B76",
              marginBottom: 8,
            }}
          >
            {selectedProject}
          </h2>
          <h3
            style={{
              margin: 0,
              fontSize: 16,
              fontWeight: 500,
              color: "#555",
            }}
          >
            REPORTE ONEPAGE - CONSOLIDADO AL 10-08-2025 15:13
            <span style={{ fontSize: 14 }}>HRS</span>
          </h3>
        </div>

        <div style={{ display: "flex", gap: 16 }}>
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
                d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4m4-5 5 5 5-5m-5 5V3"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Exportar PDF
          </button>

          <button
            style={{
              backgroundColor: "white",
              color: "#2A3B76",
              border: "1px solid #2A3B76",
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
                d="M1 4v6h6m16 10v-6h-6M4 11a8 8 0 0 1 8-8m0 18a8 8 0 0 1-8-8"
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

      {/* Main content in a card layout */}
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {/* First row - Status Dashboard */}
        <div style={{ display: "flex", gap: 24 }}>
          {/* Company info & Status summary */}
          <div style={{ flex: 1 }}>
            {/* Company info */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 24,
                padding: 16,
                backgroundColor: "#fff",
                borderRadius: 8,
                boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
              }}
            >
              <div
                style={{
                  width: 50,
                  height: 50,
                  backgroundColor: "#ff6600",
                  borderRadius: 4,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  color: "white",
                  fontWeight: "bold",
                  fontSize: 20,
                }}
              >
                CV
              </div>
              <div>
                <div
                  style={{
                    fontWeight: "bold",
                    fontSize: 18,
                    color: "#444",
                    marginBottom: 4,
                  }}
                >
                  Cerro Verde
                </div>
                <div style={{ color: "#666", fontSize: 14 }}>
                  EQUIPOS ÁREA SECA - MANTENIMIENTO
                </div>
              </div>
            </div>

            {/* Status summary */}
            <div
              style={{
                background:
                  "linear-gradient(135deg, #f8fafc 60%, #e3eafc 100%)",
                padding: 20,
                borderRadius: 12,
                boxShadow: "0 4px 12px rgba(42,59,118,0.08)",
                marginBottom: 8,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                minWidth: 280,
              }}
            >
              <h4
                style={{
                  fontSize: 18,
                  margin: "0 0 18px 0",
                  color: "#2A3B76",
                  letterSpacing: 1,
                  fontWeight: 700,
                }}
              >
                ESTADO DE MANTENCIÓN
              </h4>

              {/* Avance total con barra y porcentaje dinámico */}
              <div style={{ marginBottom: 24, width: "100%" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 10,
                  }}
                >
                  <span style={{ fontSize: 15, color: "#555" }}>
                    Avance total:
                  </span>
                  <span
                    style={{
                      fontSize: 18,
                      fontWeight: 700,
                      color:
                        mockOnePageData.statusChart.real.slice(-1)[0].value >=
                        80
                          ? "#8bc34a"
                          : mockOnePageData.statusChart.real.slice(-1)[0]
                              .value >= 50
                          ? "#ff9800"
                          : "#f44336",
                    }}
                  >
                    {mockOnePageData.statusChart.real.slice(-1)[0].value}%
                  </span>
                </div>
                <div
                  style={{
                    height: 10,
                    backgroundColor: "#f5f5f5",
                    borderRadius: 5,
                    overflow: "hidden",
                    boxShadow: "0 1px 4px rgba(42,59,118,0.06)",
                  }}
                >
                  <div
                    style={{
                      width: `${
                        mockOnePageData.statusChart.real.slice(-1)[0].value
                      }%`,
                      height: "100%",
                      background:
                        mockOnePageData.statusChart.real.slice(-1)[0].value >=
                        80
                          ? "linear-gradient(90deg,#8bc34a,#43a047)"
                          : mockOnePageData.statusChart.real.slice(-1)[0]
                              .value >= 50
                          ? "linear-gradient(90deg,#ff9800,#fbc02d)"
                          : "linear-gradient(90deg,#f44336,#e57373)",
                      borderRadius: 5,
                      transition: "width 0.6s",
                    }}
                  ></div>
                </div>
              </div>

              {/* Detalles de tiempo y estado */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 14,
                  width: "100%",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    borderBottom: "1px solid #e3eafc",
                    paddingBottom: 8,
                  }}
                >
                  <span style={{ fontSize: 15, color: "#555" }}>
                    Tiempo restante:
                  </span>
                  <span
                    style={{ fontSize: 15, fontWeight: 600, color: "#2A3B76" }}
                  >
                    13.2 hrs
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    borderBottom: "1px solid #e3eafc",
                    paddingBottom: 8,
                  }}
                >
                  <span style={{ fontSize: 15, color: "#555" }}>
                    Tiempo transcurrido:
                  </span>
                  <span
                    style={{ fontSize: 15, fontWeight: 600, color: "#2A3B76" }}
                  >
                    34.8 hrs
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    borderBottom: "1px solid #e3eafc",
                    paddingBottom: 8,
                  }}
                >
                  <span style={{ fontSize: 15, color: "#555" }}>
                    Fecha inicio:
                  </span>
                  <span
                    style={{ fontSize: 15, fontWeight: 600, color: "#1976d2" }}
                  >
                    07-07-2025 07:00
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    borderBottom: "1px solid #e3eafc",
                    paddingBottom: 8,
                  }}
                >
                  <span style={{ fontSize: 15, color: "#555" }}>
                    Fecha término programada:
                  </span>
                  <span
                    style={{ fontSize: 15, fontWeight: 600, color: "#1976d2" }}
                  >
                    10-07-2025 07:00
                  </span>
                </div>
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span style={{ fontSize: 15, color: "#555" }}>Estado:</span>
                  <span
                    style={{
                      fontSize: 15,
                      fontWeight: 700,
                      color: "#1976d2",
                      letterSpacing: 1,
                    }}
                  >
                    En ejecución
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Progress chart */}
          <div
            style={{
              flex: 2,
              backgroundColor: "#fff",
              padding: 16,
              borderRadius: 8,
              boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
            }}
          >
            <h4
              style={{ fontSize: 16, margin: "0 0 16px 0", color: "#2A3B76" }}
            >
              CURVA DE AVANCE
            </h4>

            {/* Using the ProgressChartWeb component */}
            <ProgressChartWeb data={mockOnePageData.statusChart} />
          </div>

          {/* Status pie chart */}
          <div
            style={{
              flex: 1,
              background: "linear-gradient(135deg, #f8fafc 60%, #e3eafc 100%)",
              padding: 20,
              borderRadius: 12,
              boxShadow: "0 4px 12px rgba(42,59,118,0.08)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <h4
              style={{
                fontSize: 18,
                margin: "0 0 18px 0",
                color: "#2A3B76",
                letterSpacing: 1,
              }}
            >
              ESTADO DE TAREAS
            </h4>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: 18,
              }}
            >
              <span style={{ fontSize: 15, color: "#555", marginRight: 12 }}>
                TOTAL:
              </span>
              <span style={{ fontSize: 18, fontWeight: 700, color: "#2A3B76" }}>
                {mockOnePageData.taskStatus.total}
              </span>
            </div>

            {/* Animated Pie Chart - based on actual data */}
            <div
              style={{
                width: 140,
                height: 140,
                margin: "0 auto 18px",
                borderRadius: "50%",
                background: `
        conic-gradient(
          #f44336 0% ${(
            (mockOnePageData.taskStatus.notInitiatedLate /
              mockOnePageData.taskStatus.total) *
            100
          ).toFixed(1)}%,
          #3f51b5 ${(
            (mockOnePageData.taskStatus.notInitiatedLate /
              mockOnePageData.taskStatus.total) *
            100
          ).toFixed(1)}% ${(
                  (mockOnePageData.taskStatus.initiated /
                    mockOnePageData.taskStatus.total) *
                    100 +
                  (mockOnePageData.taskStatus.notInitiatedLate /
                    mockOnePageData.taskStatus.total) *
                    100
                ).toFixed(1)}%,
          #8bc34a ${(
            (mockOnePageData.taskStatus.initiated /
              mockOnePageData.taskStatus.total) *
              100 +
            (mockOnePageData.taskStatus.notInitiatedLate /
              mockOnePageData.taskStatus.total) *
              100
          ).toFixed(1)}% ${(
                  (mockOnePageData.taskStatus.completed /
                    mockOnePageData.taskStatus.total) *
                    100 +
                  (mockOnePageData.taskStatus.initiated /
                    mockOnePageData.taskStatus.total) *
                    100 +
                  (mockOnePageData.taskStatus.notInitiatedLate /
                    mockOnePageData.taskStatus.total) *
                    100
                ).toFixed(1)}%,
          #ff9800 ${(
            (mockOnePageData.taskStatus.completed /
              mockOnePageData.taskStatus.total) *
              100 +
            (mockOnePageData.taskStatus.initiated /
              mockOnePageData.taskStatus.total) *
              100 +
            (mockOnePageData.taskStatus.notInitiatedLate /
              mockOnePageData.taskStatus.total) *
              100
          ).toFixed(1)}% 100%
        )
      `,
                position: "relative",
                boxShadow: "0 0 8px rgba(42,59,118,0.08)",
              }}
            >
              {/* Center label */}
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  backgroundColor: "#fff",
                  borderRadius: "50%",
                  width: "65%",
                  height: "65%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  boxShadow: "0 0 8px rgba(42,59,118,0.08)",
                }}
              >
                <div
                  style={{ fontSize: 16, fontWeight: "bold", color: "#f44336" }}
                >
                  {(
                    (mockOnePageData.taskStatus.notInitiatedLate /
                      mockOnePageData.taskStatus.total) *
                    100
                  ).toFixed(1)}
                  %
                </div>
                <div
                  style={{ fontSize: 11, color: "#555", textAlign: "center" }}
                >
                  NO INICIADAS ATRASADAS
                </div>
              </div>
            </div>

            {/* Pie chart legend */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 10,
                width: "100%",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 14,
                    height: 14,
                    backgroundColor: "#3f51b5",
                    borderRadius: 3,
                  }}
                ></div>
                <span style={{ fontSize: 13, color: "#555" }}>
                  INICIADAS: {mockOnePageData.taskStatus.initiated}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 14,
                    height: 14,
                    backgroundColor: "#8bc34a",
                    borderRadius: 3,
                  }}
                ></div>
                <span style={{ fontSize: 13, color: "#555" }}>
                  TERMINADAS: {mockOnePageData.taskStatus.completed}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 14,
                    height: 14,
                    backgroundColor: "#f44336",
                    borderRadius: 3,
                  }}
                ></div>
                <span style={{ fontSize: 13, color: "#555" }}>
                  NO INICIADAS ATRASADAS:{" "}
                  {mockOnePageData.taskStatus.notInitiatedLate}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 14,
                    height: 14,
                    backgroundColor: "#ff9800",
                    borderRadius: 3,
                  }}
                ></div>
                <span style={{ fontSize: 13, color: "#555" }}>
                  INICIADAS ATRASADAS:{" "}
                  {mockOnePageData.taskStatus.initiatedLate}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 14,
                    height: 14,
                    backgroundColor: "#607d8b",
                    borderRadius: 3,
                  }}
                ></div>
                <span style={{ fontSize: 13, color: "#555" }}>
                  NO INICIADAS: {mockOnePageData.taskStatus.notInitiated}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Second row - Critical Route View */}
        <div
          style={{
            backgroundColor: "#fff",
            padding: 24,
            borderRadius: 8,
            boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
          }}
        >
          <h4 style={{ fontSize: 18, margin: "0 0 20px 0", color: "#2A3B76" }}>
            RUTA CRÍTICA DEL PROYECTO
          </h4>
          <CriticalRouteView selectedProject={selectedProject} />
        </div>

        {/* Third row - Activity View */}
        <div
          style={{
            backgroundColor: "#fff",
            padding: 24,
            borderRadius: 8,
            boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
          }}
        >
          <h4 style={{ fontSize: 18, margin: "0 0 20px 0", color: "#2A3B76" }}>
            ACTIVIDADES DEL PROYECTO
          </h4>
          <ActivityView data={selectedProject} />
        </div>

        {/* Fourth row - Shift Planning */}

        {/* Fifth row - Tasks to manage */}
      </div>

      {/* Footer powered by */}
      <div
        style={{
          marginTop: 32,
          textAlign: "right",
          fontSize: 10,
          color: "#999",
        }}
      >
        Powered by MineTrackAI
      </div>
    </div>
  );
};

export default OnePageView;
