import React from "react";

const navItems = [
  {
    label: "Proyeccion",
    icon: (active: boolean) => (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M21 21H3V3H21V21ZM21 3H3M16 10.34L21 5.34M3 10.34H16M3 10.34V21M16 10.34V21"
          stroke={active ? "#1976d2" : "#555"}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    label: "Actividades",
    icon: (active: boolean) => (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M9 6L20 6M9 12H20M9 18H20M5 6V6.01M5 12V12.01M5 18V18.01"
          stroke={active ? "#1976d2" : "#555"}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    label: "Ruta Critica",
    icon: (active: boolean) => (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12 2L20 7.5V16.5L12 22L4 16.5V7.5L12 2Z"
          stroke={active ? "#1976d2" : "#555"}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12 22V16.5"
          stroke={active ? "#1976d2" : "#555"}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M20 7.5L12 12L4 7.5"
          stroke={active ? "#1976d2" : "#555"}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12 2V7.5"
          stroke={active ? "#1976d2" : "#555"}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12 12V16.5"
          stroke={active ? "#1976d2" : "#555"}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  //   {
  //     label: "Secciones y Piezas",
  //     icon: (active: boolean) => (
  //       <svg
  //         width="18"
  //         height="18"
  //         viewBox="0 0 24 24"
  //         fill="none"
  //         xmlns="http://www.w3.org/2000/svg"
  //       >
  //         <path
  //           d="M17 3L21 7L7 21L3 17L17 3Z"
  //           stroke={active ? "#1976d2" : "#555"}
  //           strokeWidth="2"
  //           strokeLinecap="round"
  //           strokeLinejoin="round"
  //         />
  //         <path
  //           d="M14 6L18 10"
  //           stroke={active ? "#1976d2" : "#555"}
  //           strokeWidth="2"
  //           strokeLinecap="round"
  //           strokeLinejoin="round"
  //         />
  //         <path
  //           d="M9.5 12.5L5.5 16.5"
  //           stroke={active ? "#1976d2" : "#555"}
  //           strokeWidth="2"
  //           strokeLinecap="round"
  //           strokeLinejoin="round"
  //         />
  //         <path
  //           d="M7 17L3 21"
  //           stroke={active ? "#1976d2" : "#555"}
  //           strokeWidth="2"
  //           strokeLinecap="round"
  //           strokeLinejoin="round"
  //         />
  //       </svg>
  //     ),
  //   },
  {
    label: "Seguridad",
    icon: (active: boolean) => (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15M9 5C9 6.10457 9.89543 7 11 7H13C14.1046 7 15 6.10457 15 5M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5M12 12H15M12 16H15M9 12H9.01M9 16H9.01"
          stroke={active ? "#1976d2" : "#555"}
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  // {
  //   label: "Medio Ambiente",
  //   icon: (active: boolean) => (
  //     <svg
  //       width="18"
  //       height="18"
  //       viewBox="0 0 24 24"
  //       fill="none"
  //       xmlns="http://www.w3.org/2000/svg"
  //     >
  //       <path
  //         d="M15 8H15.01M3 6C3 4.89543 3.89543 4 5 4H19C20.1046 4 21 4.89543 21 6V18C21 19.1046 20.1046 20 19 20H5C3.89543 20 3 19.1046 3 18V6Z"
  //         stroke={active ? "#1976d2" : "#555"}
  //         strokeWidth="2"
  //         strokeLinecap="round"
  //         strokeLinejoin="round"
  //       />
  //       <path
  //         d="M3 15.9998L8 10.9998L13 15.9998"
  //         stroke={active ? "#1976d2" : "#555"}
  //         strokeWidth="2"
  //         strokeLinecap="round"
  //         strokeLinejoin="round"
  //       />
  //       <path
  //         d="M14 13.9998L16 11.9998L21 16.9998"
  //         stroke={active ? "#1976d2" : "#555"}
  //         strokeWidth="2"
  //         strokeLinecap="round"
  //         strokeLinejoin="round"
  //       />
  //     </svg>
  //   ),
  // },
  {
    label: "Gerencia",
    icon: (active: boolean) => (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect
          x="3"
          y="3"
          width="7"
          height="7"
          rx="1"
          stroke={active ? "#1976d2" : "#555"}
          strokeWidth="2"
        />
        <rect
          x="14"
          y="3"
          width="7"
          height="7"
          rx="1"
          stroke={active ? "#1976d2" : "#555"}
          strokeWidth="2"
        />
        <rect
          x="3"
          y="14"
          width="7"
          height="7"
          rx="1"
          stroke={active ? "#1976d2" : "#555"}
          strokeWidth="2"
        />
        <path
          d="M14 17.5H21M17.5 14V21"
          stroke={active ? "#1976d2" : "#555"}
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    label: "Mantenimiento",
    icon: (active: boolean) => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path
          d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"
          stroke={active ? "#1976d2" : "#555"}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    label: "Salud Equipos",
    icon: (active: boolean) => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path
          d="M22 12h-4l-3 9L9 3l-3 9H2"
          stroke={active ? "#1976d2" : "#555"}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  // {
  //   label: "OnePage Mantención",
  //   icon: (active: boolean) => (
  //     <svg
  //       width="18"
  //       height="18"
  //       viewBox="0 0 24 24"
  //       fill="none"
  //       xmlns="http://www.w3.org/2000/svg"
  //     >
  //       <path
  //         d="M13 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V9M13 2L20 9M13 2V9H20M8 13H16M8 17H16"
  //         stroke={active ? "#1976d2" : "#555"}
  //         strokeWidth="2"
  //         strokeLinecap="round"
  //         strokeLinejoin="round"
  //       />
  //     </svg>
  //   ),
  // },
];

const ReportNavbar: React.FC<{
  active?: string;
  onSelect?: (label: string) => void;
}> = ({ active = "Proyeccion", onSelect }) => (
  <nav
    className="report-navbar"
    style={{
      display: "flex",
      alignItems: "center",
      borderBottom: "2px solid #e9ecef",
      background: "white",
      paddingLeft: 16,
      boxShadow: "0 1px 4px rgba(42,59,118,0.07)",
      overflowX: "auto",
      overflowY: "hidden",
      WebkitOverflowScrolling: "touch" as any,
      scrollbarWidth: "none" as any,
      msOverflowStyle: "none" as any,
      fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
    }}
  >
    {navItems.map((item) => (
      <div
        key={item.label}
        className={active === item.label ? "active" : ""}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 7,
          padding: "13px 16px",
          cursor: "pointer",
          flexShrink: 0,
          borderBottom:
            active === item.label
              ? "2px solid #2A3B76"
              : "2px solid transparent",
          color: active === item.label ? "#2A3B76" : "#64748b",
          fontWeight: active === item.label ? 600 : 500,
          fontSize: 13,
          letterSpacing: active === item.label ? 0 : 0.1,
          transition: "all 0.18s ease",
          position: "relative",
        }}
        onClick={() => onSelect && onSelect(item.label)}
      >
        {item.icon(active === item.label)}
        <span>{item.label}</span>
        {active === item.label && (
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: 2,
              background: "#1976d2",
              borderRadius: "1px 1px 0 0",
            }}
          />
        )}
      </div>
    ))}
    <style>{`.report-navbar::-webkit-scrollbar { display: none; }`}</style>
  </nav>
);

export default ReportNavbar;
