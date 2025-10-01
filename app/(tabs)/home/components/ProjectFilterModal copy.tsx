import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebaseConfig"; // Adjust path if needed

// Mock data for companies and project types
const COMPANIES = [
  "Todos",
  "Antapaccay",
  "Tintaya",
  "Cerro Verde",
  "Las Bambas",
  "Antamina",
];
const PROJECT_TYPES = [
  "Todos",
  "Parada de Planta",
  "Mantenimiento",
  "Expansión",
  "Optimización",
  "Seguridad",
];

const AREA = [
  "Todos",
  "Chancado Primario",
  "Chancado Secundario",
  "Molienda",
  "Flotación",
  "Filtrado",
  "Almacenamiento",
  "Transporte",
  "Logística",
];

interface ProjectFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProject: (
    project: string,
    company?: string,
    type?: string,
    date?: string
  ) => void;
  availableProjects: string[];
  currentProject: any;
  setIdProyecto: any;
}

const ProjectFilterModal = ({
  isOpen,
  onClose,
  onSelectProject,
  availableProjects,
  currentProject,
  setIdProyecto,
}: ProjectFilterModalProps) => {
  // Filter states
  const [selectedCompany, setSelectedCompany] = useState("Antapaccay");
  const [selectedType, setSelectedType] = useState("Parada de Planta");
  const [selectedArea, setSelectedArea] = useState("Chancado Primario");

  const [selectedDate, setSelectedDate] = useState("14/07/2025");
  const [filteredProjects, setFilteredProjects] = useState(availableProjects);
  const [searchTerm, setSearchTerm] = useState("");
  const [firebaseProjects, setFirebaseProjects] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<any>(null);

  console.log("oooaaa besho", firebaseProjects);
  // NEW: Fetch projects from Firestore on mount
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const proyectosRef = collection(db, "proyectos");
        const snapshot = await getDocs(proyectosRef);
        const projects = snapshot.docs.map((doc, index) => {
          // You can customize this to use projectName or any other field
          const data = doc.data();
          return data;
          // return data.projectName || doc.id;
        });
        setFirebaseProjects(projects);
      } catch (error) {
        console.error("Error fetching proyectos:", error);
      }
    };
    fetchProjects();
  }, []);

  useEffect(() => {
    let filtered = firebaseProjects;

    if (searchTerm) {
      filtered = filtered.filter((project) =>
        (project.projectName || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      );
    }

    setFilteredProjects(filtered);
  }, [searchTerm, firebaseProjects]);

  // Select project and close modal
  const handleProjectSelection = (project: string) => {
    onSelectProject(project, selectedCompany, selectedType, selectedDate);
    setSelectedProject(project);
    // onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        zIndex: 1000,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          borderRadius: 8,
          width: "90%",
          maxWidth: 800,
          maxHeight: "90vh",
          boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            backgroundColor: "#2A3B76",
            padding: "16px 24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            color: "white",
          }}
        >
          <h2 style={{ margin: 0, fontSize: 20 }}>Seleccionar Proyecto</h2>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              color: "white",
              fontSize: 24,
              cursor: "pointer",
              padding: 0,
            }}
          >
            &times;
          </button>
        </div>

        {/* Filters */}
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid #eee",
          }}
        >
          <h4 style={{ margin: "0 0 16px 0", color: "#555" }}>Filtros</h4>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: window.innerWidth < 600 ? "1fr" : "1fr 1fr",
              gap: window.innerWidth < 600 ? "12px" : "24px",
              maxWidth: window.innerWidth < 600 ? "100%" : 400,
              margin: "0 auto",
              padding: window.innerWidth < 600 ? "0" : "0 12px",
            }}
          >
            {/* Company dropdown */}
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: 6,
                  fontSize: 16,
                  color: "#2A3B76",
                  fontWeight: 500,
                }}
              >
                Empresa
              </label>
              <select
                value={selectedCompany}
                onChange={(e) => setSelectedCompany(e.target.value)}
                style={{
                  width: "100%",
                  padding: "14px 12px",
                  border: "1px solid #ddd",
                  borderRadius: 6,
                  fontSize: 16,
                  background: "#f8f9fa",
                }}
              >
                {COMPANIES.map((company) => (
                  <option key={company} value={company}>
                    {company}
                  </option>
                ))}
              </select>
            </div>

            {/* Project Type dropdown */}
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: 6,
                  fontSize: 16,
                  color: "#2A3B76",
                  fontWeight: 500,
                }}
              >
                Tipo de Proyecto
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                style={{
                  width: "100%",
                  padding: "14px 12px",
                  border: "1px solid #ddd",
                  borderRadius: 6,
                  fontSize: 16,
                  background: "#f8f9fa",
                }}
              >
                {PROJECT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Area dropdown */}
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: 6,
                  fontSize: 16,
                  color: "#2A3B76",
                  fontWeight: 500,
                }}
              >
                Área
              </label>
              <select
                value={selectedArea}
                onChange={(e) => setSelectedArea(e.target.value)}
                style={{
                  width: "100%",
                  padding: "14px 12px",
                  border: "1px solid #ddd",
                  borderRadius: 6,
                  fontSize: 16,
                  background: "#f8f9fa",
                }}
              >
                {AREA.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Date picker */}
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: 6,
                  fontSize: 16,
                  color: "#2A3B76",
                  fontWeight: 500,
                }}
              >
                Fecha
              </label>
              <input
                type="date"
                value="2025-07-14"
                onChange={(e) => {
                  const parts = e.target.value.split("-");
                  if (parts.length === 3) {
                    setSelectedDate(`${parts[2]}/${parts[1]}/${parts[0]}`);
                  }
                }}
                style={{
                  width: "100%",
                  padding: "14px 12px",
                  border: "1px solid #ddd",
                  borderRadius: 6,
                  fontSize: 16,
                  background: "#f8f9fa",
                }}
              />
            </div>
          </div>

          {/* Search box */}
          <div style={{ marginTop: 16 }}>
            <label
              style={{
                display: "block",
                marginBottom: 8,
                fontSize: 14,
                color: "#666",
              }}
            >
              Buscar Proyecto
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre..."
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid #ddd",
                borderRadius: 4,
                fontSize: 14,
              }}
            />
          </div>
        </div>

        {/* Projects list */}
        <div
          style={{
            padding: "0 24px",
            overflow: "auto",
            maxHeight: "50vh",
          }}
        >
          <h4 style={{ margin: "16px 0", color: "#555" }}>
            Proyectos Disponibles
          </h4>

          {filteredProjects.length === 0 ? (
            <p
              style={{ color: "#888", textAlign: "center", padding: "20px 0" }}
            >
              No se encontraron proyectos con estos filtros.
            </p>
          ) : (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              {filteredProjects.map((project: any, index) => (
                <div
                  key={index}
                  onClick={() => handleProjectSelection(project)}
                  style={{
                    padding: "12px 16px",
                    borderRadius: 4,
                    backgroundColor:
                      currentProject === project ? "#f0f5ff" : "white",
                    border: `1px solid ${
                      currentProject === project ? "#2A3B76" : "#eee"
                    }`,
                    cursor: "pointer",
                    transition: "all 0.2s",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div
                      style={{ fontWeight: 500, color: "#333", fontSize: 15 }}
                    >
                      {/* {"PARADA DE PLANTA"} */}

                      {/* {project.Area || "PARADA DE PLANTA"} */}
                    </div>
                    <div style={{ fontSize: 13, color: "#888", marginTop: 4 }}>
                      {`${project.projectName}`.toUpperCase()}
                    </div>
                  </div>
                  {currentProject.projectName === project.projectName && (
                    <div style={{ color: "#2A3B76" }}>
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="M20 6L9 17L4 12"
                          stroke="#2A3B76"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div
          style={{
            padding: "16px 24px",
            borderTop: "1px solid #eee",
            display: "flex",
            justifyContent: "flex-end",
            gap: "12px",
          }}
        >
          <button
            onClick={onClose}
            style={{
              backgroundColor: "white",
              border: "1px solid #ddd",
              borderRadius: 4,
              padding: "8px 16px",
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            Cancelar
          </button>

          <button
            onClick={() => {
              // Apply the filters and select the first matching project if available
              const projectName =
                filteredProjects.length > 0
                  ? filteredProjects[0]
                  : currentProject;
              // onSelectProject(
              //   projectName,
              //   selectedCompany,
              //   selectedType,
              //   selectedDate
              // );
              setIdProyecto(selectedProject?.id || "");
              // console.log("5555 ==> Selected Project ID:", selectedProject.id);

              // Close the modal after selection

              onClose();
            }}
            style={{
              backgroundColor: "#2A3B76",
              color: "white",
              border: "none",
              borderRadius: 4,
              padding: "8px 16px",
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            Cargar Proyecto
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectFilterModal;
