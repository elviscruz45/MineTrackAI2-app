import React from "react";

const ReportHeader: React.FC = () => (
  <div
    className="report-header"
    style={{
      display: "flex",
      backgroundColor: "white",
      alignItems: "center",
      background: "linear-gradient(to right, white, white)",
      padding: "16px 24px",
      borderBottom: "1px solid #e9ecef",
      boxShadow: "0 2px 4px rgba(0,0,0,0.03)",
    }}
  >
    <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
      <span
        style={{
          background: "#1976d2",
          color: "white",
          borderRadius: 4,
          padding: "6px 14px",
          fontWeight: 600,
          fontSize: 14,
          boxShadow: "0 2px 4px rgba(25, 118, 210, 0.2)",
        }}
      >
        EN EJECUCION
      </span>
      {/* <span
        style={{
          fontWeight: 600,
          fontSize: 16,
          color: "#2c3e50",
        }}
      >
        CHANCADO PRIMARIO
      </span> */}
      <span
        style={{
          fontSize: 14,
          color: "#555",
          display: "flex",
          alignItems: "center",
          gap: 6,
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
            d="M8 2V5M16 2V5M3 8H21M5 4H19C20.1046 4 21 4.89543 21 6V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V6C3 4.89543 3.89543 4 5 4Z"
            stroke="#555"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
        09-08-2025
      </span>
      <span
        style={{
          background: "#eee",
          color: "#444",
          borderRadius: 6,
          padding: "6px 14px",
          fontWeight: 600,
          fontSize: 14,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
        }}
      >
        <span style={{ fontSize: 16, fontWeight: 700 }}>13.2 hrs</span>
        <span style={{ fontSize: 12 }}>PENDIENTE</span>
      </span>
      <span
        style={{
          background: "#e53935",
          color: "white",
          borderRadius: 6,
          padding: "6px 14px",
          fontWeight: 600,
          fontSize: 14,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          boxShadow: "0 2px 4px rgba(229, 57, 53, 0.2)",
        }}
      >
        <span style={{ fontSize: 16, fontWeight: 700 }}>10.1 hrs</span>
        <span style={{ fontSize: 12 }}>DELTA WORK</span>
      </span>
    </div>
    {/* <div
      style={{
        marginLeft: "auto",
        color: "#888",
        fontSize: 14,
        fontWeight: 500,
        background: "#f1f3f5",
        padding: "4px 10px",
        borderRadius: 4,
      }}
    >
      ID: 4924
    </div> */}
  </div>
);

export default ReportHeader;
