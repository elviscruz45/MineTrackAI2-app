import React from "react";

interface ProjectSelectorProps {
  currentProject: string;
  projects: string[];
  onSelectProject: (project: string) => void;
  isNavbar?: boolean;
}

const ProjectSelector: React.FC<ProjectSelectorProps> = ({
  currentProject,
  projects,
  onSelectProject,
  isNavbar = false,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  // Navbar version of the selector (simplified)
  if (isNavbar) {
    return (
      <div
        className="project-selector-navbar"
        style={{
          position: "relative",
          width: "100%",
        }}
      >
        <select
          value={currentProject}
          onChange={(e) => onSelectProject(e.target.value)}
          style={{
            width: "100%",
            padding: "8px 12px",
            borderRadius: 4,
            border: "1px solid #2A3B76",
            backgroundColor: "white",
            fontSize: 14,
            color: "#2A3B76",
            fontWeight: 500,
            appearance: "none",
            cursor: "pointer",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          }}
        >
          {projects.map((project) => (
            <option key={project} value={project}>
              {project}
            </option>
          ))}
        </select>
        <div
          style={{
            position: "absolute",
            right: 12,
            top: "50%",
            transform: "translateY(-50%)",
            pointerEvents: "none",
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
              d="M6 9L12 15L18 9"
              stroke="#2A3B76"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    );
  }

  // Original version for sidebar
  return (
    <div
      className="project-selector"
      style={{
        position: "relative",
        width: "100%",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <h3
          style={{
            fontWeight: 600,
            color: "#2A3B76",
            margin: 0,
            fontSize: 18,
          }}
        >
          Proyecto Actual
        </h3>

        <button
          style={{
            background: "#2A3B76",
            color: "white",
            border: "none",
            borderRadius: 4,
            padding: "6px 12px",
            fontSize: 14,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
          onClick={() => {}}
        >
          <span>Historial</span>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 8V12L15 15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      <div
        style={{
          position: "relative",
          marginBottom: 24,
        }}
      >
        <select
          value={currentProject}
          onChange={(e) => onSelectProject(e.target.value)}
          style={{
            width: "100%",
            padding: "12px 16px",
            borderRadius: 8,
            border: "1px solid #e0e0e0",
            backgroundColor: "#f9f9f9",
            fontSize: 16,
            color: "#333",
            appearance: "none",
            cursor: "pointer",
            boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
          }}
        >
          {projects.map((project) => (
            <option key={project} value={project}>
              {project}
            </option>
          ))}
        </select>
        <div
          style={{
            position: "absolute",
            right: 16,
            top: "50%",
            transform: "translateY(-50%)",
            pointerEvents: "none",
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
              d="M6 9L12 15L18 9"
              stroke="#555"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default ProjectSelector;
