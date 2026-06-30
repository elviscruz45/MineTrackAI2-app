import React from "react";

type HomeWebToolbarProps = {
  windowWidth: number;
  mode: "equipment" | "project";
  projectName?: string;
  onCreateProject: () => void;
  onOpenWhatsApp?: () => void;
  onChangeProject: () => void;
  onBackToEquipment?: () => void;
};

const isWide = (w: number) => w >= 768;

export default function HomeWebToolbar({
  windowWidth,
  mode,
  projectName,
  onCreateProject,
  onOpenWhatsApp,
  onChangeProject,
  onBackToEquipment,
}: HomeWebToolbarProps) {
  const wide = isWide(windowWidth);

  const btnBase: React.CSSProperties = {
    border: "none",
    borderRadius: 10,
    padding: wide ? "10px 16px" : "12px 14px",
    fontSize: wide ? 14 : 13,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    fontWeight: 600,
    minHeight: 42,
    whiteSpace: "nowrap",
    transition: "transform 0.15s ease, box-shadow 0.15s ease",
  };

  const title =
    mode === "project" ? projectName || "Proyecto activo" : "Equipos de planta";

  const subtitle =
    mode === "project"
      ? "Panel de actividad y eventos del proyecto"
      : "Explora equipos o selecciona un proyecto para ver eventos";

  return (
    <div
      style={{
        backgroundColor: "#ffffff",
        borderBottom: "1px solid #e2e8f0",
        padding: wide ? "14px 24px" : "12px 16px",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          display: "flex",
          flexDirection: wide ? "row" : "column",
          justifyContent: "space-between",
          alignItems: wide ? "center" : "stretch",
          gap: wide ? 16 : 12,
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: wide ? 20 : 17,
              fontWeight: 800,
              color: "#1e293b",
              letterSpacing: -0.2,
              wordBreak: "break-word",
            }}
          >
            {title}
          </div>
          <div
            style={{
              fontSize: 13,
              color: "#64748b",
              marginTop: 4,
              lineHeight: 1.4,
            }}
          >
            {subtitle}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: wide ? "row" : "column",
            gap: 8,
            flexShrink: 0,
            width: wide ? "auto" : "100%",
          }}
        >
          {mode === "project" && onBackToEquipment ? (
            <button
              type="button"
              onClick={onBackToEquipment}
              style={{
                ...btnBase,
                backgroundColor: "#f8fafc",
                color: "#334155",
                border: "1px solid #e2e8f0",
                boxShadow: "none",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M19 12H5M5 12L11 6M5 12L11 18"
                  stroke="#334155"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Ver equipos
            </button>
          ) : null}

          {/* {mode === "equipment" && onOpenWhatsApp ? (
            <button
              type="button"
              onClick={onOpenWhatsApp}
              style={{
                ...btnBase,
                backgroundColor: "#25D366",
                color: "white",
                boxShadow: "0 2px 8px rgba(37, 211, 102, 0.25)",
              }}
            >
              Reporte automático
            </button>
          ) : null} */}

          <button
            type="button"
            onClick={onCreateProject}
            style={{
              ...btnBase,
              backgroundColor: "#059669",
              color: "white",
              boxShadow: "0 2px 8px rgba(5, 150, 105, 0.25)",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2" />
              <path
                d="M12 8V16M8 12H16"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            Crear proyecto
          </button>

          <button
            type="button"
            onClick={onChangeProject}
            style={{
              ...btnBase,
              backgroundColor: "#2A3B76",
              color: "white",
              boxShadow: "0 2px 8px rgba(42, 59, 118, 0.25)",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            {mode === "project" ? "Cambiar proyecto" : "Seleccionar proyecto"}
          </button>
        </div>
      </div>
    </div>
  );
}
