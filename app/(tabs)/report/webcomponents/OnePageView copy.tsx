import React from "react";

interface OnePageReportProps {
  selectedProject: string;
}

// Mock data based on the image provided
const mockOnePageData = {
  title: "REPORTE ONEPAGE - CONSOLIDADO AL 10-08-2025 15:13HRS",
  company: "Cerro Verde",
  area: "EQUIPOS ÁREA SECA",
  department: "MANTENIMIENTO",
  statusChart: {
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
    total: 270,
    initiated: 8,
    notInitiatedLate: 260,
    completed: 10,
    cancelled: 0,
    notInitiated: 0,
    initiatedLate: 0,
    notInitiatedInProgress: 0,
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
    <div style={{ padding: "24px 0" }}>
      {/* Header with title and buttons */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
          borderBottom: "1px solid #eaeaea",
          paddingBottom: 16,
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

      {/* Main content in a 3-column layout */}
      <div style={{ display: "flex", gap: 24, marginBottom: 32 }}>
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
              backgroundColor: "#fff",
              padding: 16,
              borderRadius: 8,
              boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
            }}
          >
            <h4
              style={{ fontSize: 16, margin: "0 0 16px 0", color: "#2A3B76" }}
            >
              ESTADO DE MANTENCIÓN
            </h4>

            <div style={{ marginBottom: 20 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                <span style={{ fontSize: 14, color: "#555" }}>
                  Avance total:
                </span>
                <span
                  style={{ fontSize: 16, fontWeight: 600, color: "#f44336" }}
                >
                  35%
                </span>
              </div>

              <div
                style={{
                  height: 8,
                  backgroundColor: "#f5f5f5",
                  borderRadius: 4,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: "35%",
                    height: "100%",
                    backgroundColor: "#f44336",
                    borderRadius: 4,
                  }}
                ></div>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  borderBottom: "1px solid #eee",
                  paddingBottom: 8,
                }}
              >
                <span style={{ fontSize: 14, color: "#555" }}>
                  Tiempo restante:
                </span>
                <span style={{ fontSize: 14, fontWeight: 600 }}>13.2 hrs</span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  borderBottom: "1px solid #eee",
                  paddingBottom: 8,
                }}
              >
                <span style={{ fontSize: 14, color: "#555" }}>
                  Tiempo transcurrido:
                </span>
                <span style={{ fontSize: 14, fontWeight: 600 }}>34.8 hrs</span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  borderBottom: "1px solid #eee",
                  paddingBottom: 8,
                }}
              >
                <span style={{ fontSize: 14, color: "#555" }}>
                  Fecha inicio:
                </span>
                <span style={{ fontSize: 14, fontWeight: 600 }}>
                  07-07-2025 07:00
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  borderBottom: "1px solid #eee",
                  paddingBottom: 8,
                }}
              >
                <span style={{ fontSize: 14, color: "#555" }}>
                  Fecha término programada:
                </span>
                <span style={{ fontSize: 14, fontWeight: 600 }}>
                  10-07-2025 07:00
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 14, color: "#555" }}>Estado:</span>
                <span
                  style={{ fontSize: 14, fontWeight: 600, color: "#1976d2" }}
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
          <h4 style={{ fontSize: 16, margin: "0 0 16px 0", color: "#2A3B76" }}>
            CURVA DE AVANCE
          </h4>

          {/* Legend */}
          <div style={{ display: "flex", gap: 20, marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  backgroundColor: "#2196f3",
                }}
              ></div>
              <span style={{ fontSize: 14, color: "#555" }}>PROGRAMADO</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  backgroundColor: "#f44336",
                }}
              ></div>
              <span style={{ fontSize: 14, color: "#555" }}>REAL</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  backgroundColor: "#ffc107",
                }}
              ></div>
              <span style={{ fontSize: 14, color: "#555" }}>PROYECTADO</span>
            </div>
          </div>

          {/* Chart - Using HTML/CSS to simulate the chart */}
          <div
            style={{
              position: "relative",
              height: 200,
              border: "1px solid #eee",
              borderLeft: "1px solid #ccc",
              borderBottom: "1px solid #ccc",
              padding: "10px 0",
            }}
          >
            {/* Y-axis labels */}
            <div
              style={{
                position: "absolute",
                left: -25,
                top: 0,
                bottom: 0,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <div style={{ fontSize: 12, color: "#777" }}>100</div>
              <div style={{ fontSize: 12, color: "#777" }}>90</div>
              <div style={{ fontSize: 12, color: "#777" }}>80</div>
              <div style={{ fontSize: 12, color: "#777" }}>70</div>
              <div style={{ fontSize: 12, color: "#777" }}>60</div>
              <div style={{ fontSize: 12, color: "#777" }}>50</div>
              <div style={{ fontSize: 12, color: "#777" }}>40</div>
              <div style={{ fontSize: 12, color: "#777" }}>30</div>
              <div style={{ fontSize: 12, color: "#777" }}>20</div>
              <div style={{ fontSize: 12, color: "#777" }}>10</div>
              <div style={{ fontSize: 12, color: "#777" }}>0</div>
            </div>

            {/* Chart horizontal grid lines */}
            <div
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: 0,
                bottom: 0,
              }}
            >
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  top: "0%",
                  height: 1,
                  backgroundColor: "#eee",
                }}
              ></div>
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  top: "10%",
                  height: 1,
                  backgroundColor: "#eee",
                }}
              ></div>
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  top: "20%",
                  height: 1,
                  backgroundColor: "#eee",
                }}
              ></div>
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  top: "30%",
                  height: 1,
                  backgroundColor: "#eee",
                }}
              ></div>
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  top: "40%",
                  height: 1,
                  backgroundColor: "#eee",
                }}
              ></div>
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  top: "50%",
                  height: 1,
                  backgroundColor: "#eee",
                }}
              ></div>
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  top: "60%",
                  height: 1,
                  backgroundColor: "#eee",
                }}
              ></div>
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  top: "70%",
                  height: 1,
                  backgroundColor: "#eee",
                }}
              ></div>
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  top: "80%",
                  height: 1,
                  backgroundColor: "#eee",
                }}
              ></div>
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  top: "90%",
                  height: 1,
                  backgroundColor: "#eee",
                }}
              ></div>
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  top: "100%",
                  height: 1,
                  backgroundColor: "#eee",
                }}
              ></div>
            </div>

            {/* Programmed line */}
            <svg
              width="100%"
              height="100%"
              style={{ position: "absolute", top: 0, left: 0 }}
            >
              <polyline
                points="50,200 120,160 190,120 260,70 330,30 400,10 470,0"
                fill="none"
                stroke="#2196f3"
                strokeWidth="2"
              />
            </svg>

            {/* Real line */}
            <svg
              width="100%"
              height="100%"
              style={{ position: "absolute", top: 0, left: 0 }}
            >
              <polyline
                points="50,200 120,180 190,160 260,140 330,100 400,70 470,30"
                fill="none"
                stroke="#f44336"
                strokeWidth="2"
              />
            </svg>

            {/* Projected line */}
            <svg
              width="100%"
              height="100%"
              style={{ position: "absolute", top: 0, left: 0 }}
            >
              <polyline
                points="50,200 120,184 190,170 260,150 330,120 400,70 470,20 540,0"
                fill="none"
                stroke="#ffc107"
                strokeWidth="2"
              />
            </svg>

            {/* X-axis labels */}
            <div
              style={{
                position: "absolute",
                bottom: -35,
                left: 0,
                right: 0,
                display: "flex",
                justifyContent: "space-around",
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  color: "#777",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <span>07-07-2025</span>
                <span>07:00</span>
              </div>
              <div
                style={{
                  fontSize: 10,
                  color: "#777",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <span>07-07-2025</span>
                <span>19:00</span>
              </div>
              <div
                style={{
                  fontSize: 10,
                  color: "#777",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <span>08-07-2025</span>
                <span>07:00</span>
              </div>
              <div
                style={{
                  fontSize: 10,
                  color: "#777",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <span>08-07-2025</span>
                <span>19:00</span>
              </div>
              <div
                style={{
                  fontSize: 10,
                  color: "#777",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <span>09-07-2025</span>
                <span>07:00</span>
              </div>
              <div
                style={{
                  fontSize: 10,
                  color: "#777",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <span>09-07-2025</span>
                <span>19:00</span>
              </div>
              <div
                style={{
                  fontSize: 10,
                  color: "#777",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <span>10-07-2025</span>
                <span>07:00</span>
              </div>
            </div>
          </div>
        </div>

        {/* Status pie chart */}
        <div
          style={{
            flex: 1,
            backgroundColor: "#fff",
            padding: 16,
            borderRadius: 8,
            boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
          }}
        >
          <h4 style={{ fontSize: 16, margin: "0 0 16px 0", color: "#2A3B76" }}>
            ESTADO TAREAS
          </h4>

          <div
            style={{ display: "flex", alignItems: "center", marginBottom: 16 }}
          >
            <span style={{ fontSize: 14, color: "#555", marginRight: 12 }}>
              TOTAL:
            </span>
            <span style={{ fontSize: 14, fontWeight: 600 }}>270</span>
          </div>

          {/* Simple pie chart visualization */}
          <div
            style={{
              width: 120,
              height: 120,
              margin: "0 auto 16px",
              borderRadius: "50%",
              background:
                "conic-gradient(#f44336 0% 96.3%, #8bc34a 96.3% 100%)",
              position: "relative",
            }}
          >
            {/* Label in the middle */}
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                backgroundColor: "white",
                borderRadius: "50%",
                width: "60%",
                height: "60%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                boxShadow: "0 0 5px rgba(0,0,0,0.1)",
              }}
            >
              <div
                style={{ fontSize: 14, fontWeight: "bold", color: "#f44336" }}
              >
                96.3%
              </div>
              <div style={{ fontSize: 10, color: "#555" }}>
                NO INICIADAS ATRASADAS
              </div>
            </div>
          </div>

          {/* Pie chart legend */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div
                style={{ width: 12, height: 12, backgroundColor: "#3f51b5" }}
              ></div>
              <span style={{ fontSize: 12, color: "#555" }}>INICIADAS: 8</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div
                style={{ width: 12, height: 12, backgroundColor: "#8bc34a" }}
              ></div>
              <span style={{ fontSize: 12, color: "#555" }}>
                TERMINADAS: 10
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div
                style={{ width: 12, height: 12, backgroundColor: "#f44336" }}
              ></div>
              <span style={{ fontSize: 12, color: "#555" }}>
                NO INICIADAS ATRASADAS: 260
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div
                style={{ width: 12, height: 12, backgroundColor: "#ff9800" }}
              ></div>
              <span style={{ fontSize: 12, color: "#555" }}>
                INICIADAS ATRASADAS: 0
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div
                style={{ width: 12, height: 12, backgroundColor: "#607d8b" }}
              ></div>
              <span style={{ fontSize: 12, color: "#555" }}>
                NO INICIADAS: 0
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Second row - Critical route and shift planning */}
      <div style={{ display: "flex", gap: 24, marginBottom: 32 }}>
        {/* Critical route status */}
        <div
          style={{
            flex: 1,
            backgroundColor: "#fff",
            padding: 16,
            borderRadius: 8,
            boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
          }}
        >
          <h4 style={{ fontSize: 16, margin: "0 0 16px 0", color: "#2A3B76" }}>
            RUTA CRÍTICA
          </h4>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: 12,
                backgroundColor: "#f5f5f5",
                borderRadius: 4,
              }}
            >
              <div>
                <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>
                  Cambio de poleas
                </div>
                <div style={{ fontSize: 12, color: "#555" }}>Duración: 24h</div>
              </div>
              <div
                style={{
                  backgroundColor: "#f44336",
                  color: "white",
                  padding: "4px 8px",
                  borderRadius: 4,
                  fontSize: 12,
                }}
              >
                Atrasado 8h
              </div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: 12,
                backgroundColor: "#f5f5f5",
                borderRadius: 4,
              }}
            >
              <div>
                <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>
                  Cambio de motor #2
                </div>
                <div style={{ fontSize: 12, color: "#555" }}>Duración: 16h</div>
              </div>
              <div
                style={{
                  backgroundColor: "#4caf50",
                  color: "white",
                  padding: "4px 8px",
                  borderRadius: 4,
                  fontSize: 12,
                }}
              >
                En tiempo
              </div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: 12,
                backgroundColor: "#f5f5f5",
                borderRadius: 4,
              }}
            >
              <div>
                <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>
                  Revisión de transmisión
                </div>
                <div style={{ fontSize: 12, color: "#555" }}>Duración: 12h</div>
              </div>
              <div
                style={{
                  backgroundColor: "#ff9800",
                  color: "white",
                  padding: "4px 8px",
                  borderRadius: 4,
                  fontSize: 12,
                }}
              >
                Pendiente
              </div>
            </div>
          </div>
        </div>

        {/* Shift planning */}
        <div
          style={{
            flex: 2,
            backgroundColor: "#fff",
            padding: 16,
            borderRadius: 8,
            boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
          }}
        >
          <h4 style={{ fontSize: 16, margin: "0 0 16px 0", color: "#2A3B76" }}>
            PLANIFICACIÓN DE TURNOS
          </h4>

          <div style={{ display: "flex", gap: 16 }}>
            <div
              style={{
                flex: 1,
                padding: 12,
                backgroundColor: "#f5f5f5",
                borderRadius: 4,
              }}
            >
              <h5
                style={{ margin: "0 0 12px 0", fontSize: 14, color: "#2A3B76" }}
              >
                TURNO A (7:00 - 19:00)
              </h5>

              <div style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 4 }}>
                  Cuadrilla 1
                </div>
                <div style={{ fontSize: 12, color: "#555" }}>
                  <div>Supervisor: J. Rodríguez</div>
                  <div>Personal: 12</div>
                  <div>Tareas asignadas: 25</div>
                </div>
              </div>

              <div>
                <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 4 }}>
                  Cuadrilla 2
                </div>
                <div style={{ fontSize: 12, color: "#555" }}>
                  <div>Supervisor: M. González</div>
                  <div>Personal: 8</div>
                  <div>Tareas asignadas: 18</div>
                </div>
              </div>
            </div>

            <div
              style={{
                flex: 1,
                padding: 12,
                backgroundColor: "#f5f5f5",
                borderRadius: 4,
              }}
            >
              <h5
                style={{ margin: "0 0 12px 0", fontSize: 14, color: "#2A3B76" }}
              >
                TURNO B (19:00 - 7:00)
              </h5>

              <div style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 4 }}>
                  Cuadrilla 3
                </div>
                <div style={{ fontSize: 12, color: "#555" }}>
                  <div>Supervisor: P. Sánchez</div>
                  <div>Personal: 10</div>
                  <div>Tareas asignadas: 22</div>
                </div>
              </div>

              <div>
                <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 4 }}>
                  Cuadrilla 4
                </div>
                <div style={{ fontSize: 12, color: "#555" }}>
                  <div>Supervisor: L. Martínez</div>
                  <div>Personal: 6</div>
                  <div>Tareas asignadas: 15</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tasks by section */}
      <div>
        <h3
          style={{
            color: "#2A3B76",
            fontSize: 18,
            marginBottom: 16,
            fontWeight: 500,
          }}
        >
          TAREAS POR GESTIONAR
        </h3>

        {/* Section 1 */}
        <div style={{ marginBottom: 16 }}>
          <div
            style={{
              backgroundColor: "#2A3B76",
              color: "white",
              padding: "8px 16px",
              fontSize: 14,
              fontWeight: 500,
              borderRadius: "4px 4px 0 0",
            }}
          >
            1.1 SECCION 1
          </div>

          <div
            style={{
              backgroundColor: "#90a4ae",
              color: "white",
              padding: "6px 16px",
              fontSize: 13,
              marginLeft: 0,
              borderLeft: "4px solid #2A3B76",
            }}
          >
            1.1.1 TRABAJOS GENERALES
          </div>

          {/* Tasks table */}
          <div style={{ overflowX: "auto", marginTop: 8 }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: 12,
              }}
            >
              <thead>
                <tr style={{ backgroundColor: "#f5f5f5" }}>
                  <th
                    style={{
                      padding: 8,
                      border: "1px solid #ddd",
                      textAlign: "left",
                      fontWeight: 600,
                    }}
                  >
                    WBS
                  </th>
                  <th
                    style={{
                      padding: 8,
                      border: "1px solid #ddd",
                      textAlign: "left",
                      fontWeight: 600,
                    }}
                  >
                    Estado/Resp
                  </th>
                  <th
                    style={{
                      padding: 8,
                      border: "1px solid #ddd",
                      textAlign: "left",
                      fontWeight: 600,
                    }}
                  >
                    Tarea
                  </th>
                  <th
                    style={{
                      padding: 8,
                      border: "1px solid #ddd",
                      textAlign: "center",
                      fontWeight: 600,
                    }}
                  >
                    Horas (h)
                  </th>
                  <th
                    style={{
                      padding: 8,
                      border: "1px solid #ddd",
                      textAlign: "center",
                      fontWeight: 600,
                    }}
                  >
                    Inicio Prog.
                  </th>
                  <th
                    style={{
                      padding: 8,
                      border: "1px solid #ddd",
                      textAlign: "center",
                      fontWeight: 600,
                    }}
                  >
                    Fin Prog.
                  </th>
                  <th
                    style={{
                      padding: 8,
                      border: "1px solid #ddd",
                      textAlign: "center",
                      fontWeight: 600,
                    }}
                  >
                    DELTA WORK(h)
                  </th>
                  <th
                    style={{
                      padding: 8,
                      border: "1px solid #ddd",
                      textAlign: "center",
                      fontWeight: 600,
                    }}
                  >
                    DELTA START(h)
                  </th>
                  <th
                    style={{
                      padding: 8,
                      border: "1px solid #ddd",
                      textAlign: "center",
                      fontWeight: 600,
                    }}
                  >
                    Avance Esperado
                  </th>
                  <th
                    style={{
                      padding: 8,
                      border: "1px solid #ddd",
                      textAlign: "center",
                      fontWeight: 600,
                    }}
                  >
                    AVANCE
                  </th>
                </tr>
              </thead>
              <tbody>
                {mockOnePageData.tasksBySection[0].tasks[0].tasks.map(
                  (task, index) => (
                    <tr key={index}>
                      <td style={{ padding: 8, border: "1px solid #ddd" }}>
                        {task.wbs}
                      </td>
                      <td style={{ padding: 8, border: "1px solid #ddd" }}>
                        <div
                          style={{
                            backgroundColor: "#f44336",
                            color: "white",
                            padding: "3px 6px",
                            fontSize: 10,
                            display: "inline-block",
                            borderRadius: 2,
                          }}
                        >
                          {task.status}
                        </div>
                      </td>
                      <td style={{ padding: 8, border: "1px solid #ddd" }}>
                        {task.task}
                      </td>
                      <td
                        style={{
                          padding: 8,
                          border: "1px solid #ddd",
                          textAlign: "center",
                        }}
                      >
                        {task.hours}
                      </td>
                      <td
                        style={{
                          padding: 8,
                          border: "1px solid #ddd",
                          textAlign: "center",
                        }}
                      >
                        {task.startProg.date.split("-").slice(1).join("-")}
                        <br />
                        {task.startProg.time}
                      </td>
                      <td
                        style={{
                          padding: 8,
                          border: "1px solid #ddd",
                          textAlign: "center",
                        }}
                      >
                        {task.endProg.date.split("-").slice(1).join("-")}
                        <br />
                        {task.endProg.time}
                      </td>
                      <td
                        style={{
                          padding: 8,
                          border: "1px solid #ddd",
                          textAlign: "center",
                        }}
                      ></td>
                      <td
                        style={{
                          padding: 8,
                          border: "1px solid #ddd",
                          textAlign: "center",
                        }}
                      ></td>
                      <td
                        style={{
                          padding: 8,
                          border: "1px solid #ddd",
                          textAlign: "center",
                        }}
                      >
                        <div
                          style={{
                            backgroundColor: "#757575",
                            color: "white",
                            padding: "3px 6px",
                            fontSize: 10,
                            display: "inline-block",
                            borderRadius: 2,
                          }}
                        >
                          {task.expectedProgress}
                        </div>
                      </td>
                      <td
                        style={{
                          padding: 8,
                          border: "1px solid #ddd",
                          textAlign: "center",
                        }}
                      >
                        <div
                          style={{
                            backgroundColor: "#f44336",
                            color: "white",
                            padding: "3px 6px",
                            fontSize: 10,
                            display: "inline-block",
                            borderRadius: 2,
                          }}
                        >
                          {task.actualProgress}
                        </div>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 2 */}
        <div style={{ marginBottom: 16 }}>
          <div
            style={{
              backgroundColor: "#2A3B76",
              color: "white",
              padding: "8px 16px",
              fontSize: 14,
              fontWeight: 500,
              borderRadius: "4px 4px 0 0",
            }}
          >
            1.2 EDIFICIO STOCK PILE
          </div>

          <div
            style={{
              backgroundColor: "#90a4ae",
              color: "white",
              padding: "6px 16px",
              fontSize: 13,
              marginLeft: 0,
              borderLeft: "4px solid #2A3B76",
            }}
          >
            1.2.1 FEEDER FE012@FE015
          </div>

          {/* No tasks message */}
          <div
            style={{
              padding: 16,
              textAlign: "center",
              color: "#666",
              backgroundColor: "#f5f5f5",
              marginTop: 8,
              borderRadius: 4,
            }}
          >
            No hay tareas para mostrar en esta sección
          </div>
        </div>
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
