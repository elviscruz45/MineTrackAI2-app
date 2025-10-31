import React, { useState, useEffect } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
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
  const [selectedCompany, setSelectedCompany] = useState("Todos");
  const [selectedType, setSelectedType] = useState("Todos");
  const [selectedArea, setSelectedArea] = useState("Todos");

  const [selectedDate, setSelectedDate] = useState("2025-07");
  const [filteredProjects, setFilteredProjects] = useState(availableProjects);
  const [searchTerm, setSearchTerm] = useState("");
  const [firebaseProjects, setFirebaseProjects] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<any>(null);

  // NEW: Fetch projects from Firestore on mount
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const proyectosRef = collection(db, "proyectos");
        const proyectosQuery = query(
          proyectosRef,
          orderBy("createdAt", "desc")
        );

        const snapshot = await getDocs(proyectosQuery);
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
        padding: "10px",
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          borderRadius: 10,
          width: "100%",
          maxWidth: window.innerWidth > 600 ? 600 : "95%",
          maxHeight: window.innerWidth < 600 ? "95vh" : "90vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          boxShadow: "0 2px 25px rgba(0,0,0,0.25)",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "18px 24px",
            background: "linear-gradient(90deg,#28A745 70%,#28A745 100%)",
            borderTopLeftRadius: 10,
            borderTopRightRadius: 10,
            marginBottom: 0,
            borderBottom: "1px solid #eaeaea",
          }}
        >
          <span
            style={{
              fontSize: 20,
              fontWeight: "bold",
              color: "white",
              letterSpacing: 1,
              fontFamily: "'Inter', 'Segoe UI', 'Arial', sans-serif",
            }}
          >
            Seleccionar Proyecto
          </span>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              color: "white",
              fontSize: 28,
              cursor: "pointer",
              padding: 0,
              fontWeight: 700,
              lineHeight: 1,
              fontFamily: "'Inter', 'Segoe UI', 'Arial', sans-serif",
            }}
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>

        {/* Contenido con scroll */}
        <div
          style={{
            flex: 1,
            padding: "0 20px",
            overflowY: "auto",
            marginBottom: 20,
          }}
        >
          {/* Filtros */}
          <div
            style={{
              marginBottom: 20,
            }}
          >
            <h4
              style={{
                margin: "0 0 15px 0",
                color: "#555",
                fontSize: 14,
                fontWeight: "bold",
                fontFamily: "'Inter', 'Segoe UI', 'Arial', sans-serif",
              }}
            ></h4>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  window.innerWidth < 600 ? "1fr" : "1fr 1fr",
                gap: window.innerWidth < 600 ? "15px" : "15px",
              }}
            >
              {/* Company dropdown */}
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: 5,
                    fontSize: 14,
                    color: "#555",
                    fontWeight: "500",
                    fontFamily: "'Inter', 'Segoe UI', 'Arial', sans-serif",
                  }}
                >
                  Empresa
                </label>
                <select
                  value={selectedCompany}
                  onChange={(e) => setSelectedCompany(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "1px solid #ddd",
                    borderRadius: 5,
                    fontSize: 14,
                    backgroundColor: "white",
                    fontFamily: "'Inter', 'Segoe UI', 'Arial', sans-serif",
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
                    marginBottom: 5,
                    fontSize: 14,
                    color: "#555",
                    fontWeight: "500",
                    fontFamily: "'Inter', 'Segoe UI', 'Arial', sans-serif",
                  }}
                >
                  Tipo de Proyecto
                </label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "1px solid #ddd",
                    borderRadius: 5,
                    fontSize: 14,
                    backgroundColor: "white",
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
                    marginBottom: 5,
                    fontSize: 14,
                    color: "#555",
                    fontWeight: "500",
                  }}
                >
                  Área
                </label>
                <select
                  value={selectedArea}
                  onChange={(e) => setSelectedArea(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "1px solid #ddd",
                    borderRadius: 5,
                    fontSize: 14,
                    backgroundColor: "white",
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
                    marginBottom: 5,
                    fontSize: 14,
                    color: "#555",
                    fontWeight: "500",
                  }}
                >
                  Mes y Año
                </label>
                <input
                  type="month"
                  value={selectedDate}
                  onChange={(e) => {
                    // e.target.value is "YYYY-MM"
                    setSelectedDate(e.target.value);
                  }}
                  style={{
                    width: "93%",
                    padding: "10px",
                    border: "1px solid #ddd",
                    borderRadius: 5,
                    fontSize: 14,
                    backgroundColor: "white",
                    fontFamily: "'Inter', 'Segoe UI', 'Arial', sans-serif",
                  }}
                />
              </div>
            </div>

            {/* Search box */}
            <div style={{ marginTop: 15 }}>
              <label
                style={{
                  display: "block",
                  marginBottom: 5,
                  fontSize: 14,
                  color: "#555",
                  fontWeight: "500",
                  fontFamily: "'Inter', 'Segoe UI', 'Arial', sans-serif",
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
                  width: "93%",
                  padding: "10px",
                  border: "1px solid #ddd",
                  borderRadius: 5,
                  fontSize: 14,
                  fontFamily: "'Inter', 'Segoe UI', 'Arial', sans-serif",
                }}
              />
            </div>
          </div>

          {/* Projects list */}
          <div
            style={{
              marginBottom: 15,
            }}
          >
            <h4
              style={{
                margin: "0 0 10px 0",
                color: "#555",
                fontSize: 14,
                fontWeight: "bold",
                fontFamily: "'Inter', 'Segoe UI', 'Arial', sans-serif",
              }}
            >
              Proyectos Disponibles
            </h4>

            {filteredProjects.length === 0 ? (
              <p
                style={{
                  color: "#888",
                  textAlign: "center",
                  padding: "20px 0",
                  fontSize: 14,
                  fontFamily: "'Inter', 'Segoe UI', 'Arial', sans-serif",
                }}
              >
                No se encontraron proyectos con estos filtros.
              </p>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                  maxHeight: window.innerWidth < 600 ? "180px" : "200px",
                  overflowY: "auto",
                  border: "1px solid #eee",
                  borderRadius: 5,
                  padding: "10px",
                }}
              >
                {filteredProjects.map((project: any, index) => (
                  <div
                    key={index}
                    onClick={() => handleProjectSelection(project)}
                    style={{
                      padding: "10px 12px",
                      borderRadius: 5,
                      backgroundColor:
                        currentProject.projectName === project.projectName
                          ? "#f0f5ff"
                          : "white",
                      border: `1px solid ${
                        currentProject.projectName === project.projectName
                          ? "#2A3B76"
                          : "#eee"
                      }`,
                      cursor: "pointer",
                      transition: "all 0.2s",
                      display: "flex",
                      alignItems: "center",
                      fontFamily: "'Inter', 'Segoe UI', 'Arial', sans-serif",
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontWeight: 500,
                          color: "#333",
                          fontSize: 14,
                          fontFamily:
                            "'Inter', 'Segoe UI', 'Arial', sans-serif",
                        }}
                      >
                        {`${project.projectName}`.toUpperCase()}
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          color: "#888",
                          marginTop: 2,
                          fontFamily:
                            "'Inter', 'Segoe UI', 'Arial', sans-serif",
                        }}
                      >
                        {project.Area || "PARADA DE PLANTA"}
                      </div>
                    </div>
                    {currentProject.projectName === project.projectName && (
                      <div style={{ color: "#2A3B76" }}>
                        <svg
                          width="18"
                          height="18"
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
        </div>

        {/* Actions */}
        <div
          style={{
            display: "flex",

            flexDirection: "row",
            justifyContent: "flex-end",
            marginTop: 20,
            padding: "0 20px 20px 20px",
            gap: "10px",
            marginBottom: window.innerWidth < 600 ? 30 : 80,
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: "10px 15px",
              border: "1px solid #ddd",
              borderRadius: 5,
              marginRight: 10,
              backgroundColor: "white",
              color: "#666",
              fontSize: 14,
              cursor: "pointer",
              fontFamily: "'Inter', 'Segoe UI', 'Arial', sans-serif",
            }}
          >
            Cancelar
          </button>

          <button
            onClick={() => {
              const projectName =
                filteredProjects.length > 0
                  ? filteredProjects[0]
                  : currentProject;
              setIdProyecto(selectedProject?.id || "");
              onClose();
            }}
            style={{
              backgroundColor: "#28A745",
              color: "white",
              border: "none",
              borderRadius: 5,
              padding: "10px 15px",
              fontSize: 14,
              cursor: "pointer",
              fontWeight: "bold",
              fontFamily: "'Inter', 'Segoe UI', 'Arial', sans-serif",
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
