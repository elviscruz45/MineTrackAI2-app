import React from "react";

const ReportHeader: React.FC = () => (
  <div
    style={{
      background: "linear-gradient(135deg, #2A3B76 0%, #1565c0 100%)",
      padding: "12px 20px",
      display: "flex",
      alignItems: "center",
      gap: 16,
      boxShadow: "0 2px 8px rgba(42,59,118,0.25)",
      flexWrap: "wrap",
    }}
  >
    {/* Status badge */}
    <div
      style={{
        background: "rgba(255,255,255,0.15)",
        border: "1px solid rgba(255,255,255,0.3)",
        color: "white",
        borderRadius: 6,
        padding: "6px 14px",
        fontWeight: 700,
        fontSize: 13,
        letterSpacing: 0.5,
        display: "flex",
        alignItems: "center",
        gap: 6,
      }}
    >
      <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#4caf50", display: "inline-block", boxShadow: "0 0 6px #4caf50" }} />
      EN EJECUCIÓN
    </div>

    {/* Divider */}
    <div style={{ width: 1, height: 28, background: "rgba(255,255,255,0.2)" }} />

    {/* Date */}
    <div style={{ display: "flex", alignItems: "center", gap: 6, color: "rgba(255,255,255,0.85)", fontSize: 13 }}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
        <path d="M8 2V5M16 2V5M3 8H21M5 4H19C20.1046 4 21 4.89543 21 6V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V6C3 4.89543 3.89543 4 5 4Z" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round" />
      </svg>
      09-08-2025
    </div>

    {/* Divider */}
    <div style={{ width: 1, height: 28, background: "rgba(255,255,255,0.2)" }} />

    {/* Pending hours */}
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", lineHeight: 1.1 }}>
      <span style={{ fontSize: 16, fontWeight: 800, color: "white" }}>13.2 hrs</span>
      <span style={{ fontSize: 9, fontWeight: 600, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: 0.5 }}>PENDIENTE</span>
    </div>

    {/* Delta Work pill */}
    <div
      style={{
        background: "rgba(229,57,53,0.3)",
        border: "1px solid rgba(229,57,53,0.6)",
        borderRadius: 6,
        padding: "5px 12px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        lineHeight: 1.1,
      }}
    >
      <span style={{ fontSize: 15, fontWeight: 800, color: "#ff8a80" }}>10.1 hrs</span>
      <span style={{ fontSize: 9, fontWeight: 600, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: 0.5 }}>DELTA WORK</span>
    </div>
  </div>
);

export default ReportHeader;
