import React, { useState, useEffect, lazy, Suspense } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from "react-native";
import { connect } from "react-redux";
import styles from "./index.styles";
import PieChartView from "./components/Graphs/PieStatus";
import BarChartMontoServicios from "./components/Graphs/BarChartMontoServicios";
import BarChartProceso from "./components/Graphs/BarChartProceso";

import AvanceProgressChart from "./webcomponents/ProgressChartweb";
import ServiceList from "./components/Resources/ServiceList";
// import { InactiveServiceList } from "../RecursosScreen/InactiveServiceList";
import InactiveServiceList from "./components/Resources/InactiveServiceList";
import MontoEDPList from "./components/Resources/MontoEDPList";
import MontoServiceList from "./components/Resources/MontoServiceList";
import RecursosHumanos from "./components/Resources/RecursosHumanos";
import BarInactiveServices from "./components/Resources/BarInactiveServices";
import MontoComprometido from "./components/Resources/MontoComprometido";
import { getExcelReportData } from "../../../utils/excelData";
import EstadoServiceList from "./components/Resources/EstadoServiceList";
import { screen } from "../../../utils";
import { Modal } from "@/components/Modal/Modal";
// import { ChangeDisplayCompany } from "./components/ChangeCompany/ChangeCompany";
import ChangeDisplayCompany from "./components/ChangeCompany/ChangeCompany";
import Toast from "react-native-toast-message";
import { useRouter } from "expo-router";
import {
  LineChart,
  BarChart,
  PieChart,
  ProgressChart,
  ContributionGraph,
  StackedBarChart,
} from "react-native-chart-kit";
import ReportHeader from "./webcomponents/ReportHeader";
import ReportNavbar from "./webcomponents/ReportNavbar";
import ProjectSelector from "./webcomponents/ProjectSelector";
import ActivityView from "./webcomponents/ActivityView";
import OnePageView from "./webcomponents/OnePageView";
import CriticalRouteView from "./webcomponents/CriticalRouteView";
import SafetyView from "./webcomponents/SafetyView";
import EnvironmentView from "./webcomponents/EnvironmentView";
const screenWidth = Dimensions.get("window").width;

const chartConfig = {
  backgroundGradientFrom: "white", // Negro puro
  backgroundGradientFromOpacity: 1,
  backgroundGradientTo: "white",
  backgroundGradientToOpacity: 1,
  color: (opacity = 1) => `blue`, // Gris claro para contraste sin ser blanco puro
  strokeWidth: 1, // optional, default 3
  barPercentage: 0.5,
  useShadowColorFromDataset: false, // optional
};

const dataLineChart = {
  labels: ["0", "4", "8", "12", "16", "20", "24", "28", "32", "36", "40"],
  datasets: [
    {
      data: [0, 2, 4, 8, 15, 22, 30, 40, 55, 70, 80, 88, 93, 96, 98, 100],
      color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`, // optional
      strokeWidth: 2, // optional
    },
    {
      data: [0, 1, 3, 6, 12, 13, 14],
      color: (opacity = 1) => `rgba(132, 243, 122, ${opacity})`, // optional
      strokeWidth: 2, // optional
    },
  ],
  legend: ["Programado", "Real"], // optional
};

// Mock data for projects
const AVAILABLE_PROJECTS = [
  "CHANCADO PRIMARIO",
  "CHANCADO SECUNDARIO",
  "MOLIENDA",
  "FLOTACIÓN",
  "ESPESADORES",
  "FILTRADO",
];

function ReportnoRedux(props: any) {
  const router = useRouter();

  const [showModal, setShowModal] = useState(false);
  const [renderComponent, setRenderComponent] = useState<any>(null);
  const [company, setCompany] = useState("TOTAL CONTRATISTAS");
  const [companyList, setCompanyList] = useState<any>();
  const onCloseOpenModal = () => setShowModal((prevState) => !prevState);
  const userType = props.profile?.userType;
  const update_Data = () => {
    setRenderComponent(
      <ChangeDisplayCompany
        onClose={onCloseOpenModal}
        setCompany={setCompany}
        companyList={companyList}
      />
    );
    setShowModal(true);
  };
  //real time updates
  const [data, setData] = useState();

  //states to view the tables
  const [serviciosActivos, setServiciosActivos] = useState(false);
  const [estadoServicios, setEstadoServicios] = useState(false);
  const [serviciosInactivos, setServiciosInactivos] = useState(false);
  const [montoServicios, setMontoServicios] = useState(false);
  const [montoEDP, setMontoEDP] = useState(false);
  const [comprometido, setComprometido] = useState(false);
  const [activeTab, setActiveTab] = useState("Proyeccion");
  const [selectedProject, setSelectedProject] = useState(AVAILABLE_PROJECTS[0]);
  //Data about the company belong this event

  const regex = /@(.+?)\./i;
  const companyName = props.email?.match(regex)?.[1].toUpperCase() || "Anonimo";

  useEffect(() => {
    if (Array.isArray(props.servicesData)) {
      setCompanyList([
        ...new Set(props.servicesData?.map((item: any) => item.companyName)),
      ]);
    }
    setCompany(companyName);
  }, []);

  useEffect(() => {
    setData(props.servicesData);
  }, [props.servicesData, company]);

  // go to a history screen
  const goToHistoryScreen = () => {
    // navigation.navigate(screen.report.tab, {
    //   screen: screen.report.history,
    // });
    router.push({
      pathname: "/report/History",
    });
  };
  const userTypeWarn = () => {
    Toast.show({
      type: "error",
      position: "bottom",
      text1: "No autorizado para esta accion",
    });
  };

  const handleProjectChange = (project: string) => {
    setSelectedProject(project);
    // Here you would filter data based on the selected project
    console.log(`Selected project: ${project}`);
  };

  if (!data) {
    return (
      <div
        style={{
          flex: 1,
          backgroundColor: "white",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <h1 style={{ fontSize: 50, color: "#2A3B76" }}>Bienvenido</h1>
      </div>
    );
  } else {
    return (
      <div style={{ ...styles.AndroidSafeArea }}>
        {/* Project Selector as a navigation bar */}
        <div
          style={{
            backgroundColor: "#f8f9fa",
            padding: "12px 24px",
            borderBottom: "1px solid #eaeaea",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h3
            style={{
              margin: 0,
              fontSize: 16,
              color: "#2A3B76",
              fontWeight: 500,
            }}
          >
            Proyecto Seleccionado:
          </h3>
          <div style={{ width: "300px" }}>
            <ProjectSelector
              currentProject={selectedProject}
              projects={AVAILABLE_PROJECTS}
              onSelectProject={handleProjectChange}
              isNavbar={true}
            />
          </div>
        </div>
        <ReportHeader />
        <ReportNavbar active={activeTab} onSelect={setActiveTab} />

        <div
          style={{
            backgroundColor: "white",
            overflowY: "auto",
            height:
              "calc(100vh - 170px)" /* Adjusted for the new project selector bar */,
            padding: "0 24px",
          }}
        >
          {/* Special layout for OnePage Mantención */}
          {activeTab === "OnePage Mantención" ? (
            <OnePageView selectedProject={selectedProject} />
          ) : (
            <div style={{ width: "100%" }}>
              <h2
                style={{
                  ...styles.company,
                  fontSize: 24,
                  marginBottom: 8,
                  color: "#2A3B76",
                  textAlign: "center",
                }}
              >
                EMPRESA MINERA ANTAPACCAY SA
              </h2>
              <h3
                style={{
                  ...styles.company,
                  fontSize: 18,
                  marginTop: 0,
                  color: "#555",
                  textAlign: "center",
                }}
              >
                PARADA DE PLANTA JULIO 2025
              </h3>

              <div
                style={{
                  marginTop: 32,
                  backgroundColor: "#f8f9fa",
                  padding: 20,
                  borderRadius: 8,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                  width: "100%",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 16,
                  }}
                >
                  <h4
                    style={{
                      margin: 0,
                      fontSize: 18,
                      color: "#2A3B76",
                      fontWeight: 600,
                    }}
                  >
                    Avance Parada de Planta
                  </h4>

                  <div
                    style={{
                      display: "flex",
                      gap: 12,
                    }}
                  >
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
                        boxShadow: "0 2px 4px rgba(42, 59, 118, 0.2)",
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
                          d="M12 4V20M4 12H20"
                          stroke="white"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      Exportar
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
                          d="M4 17V19C4 19.5304 4.21071 20.0391 4.58579 20.4142C4.96086 20.7893 5.46957 21 6 21H18C18.5304 21 19.0391 20.7893 19.4142 20.4142C19.7893 20.0391 20 19.5304 20 19V17M7 11L12 16M12 16L17 11M12 16V4"
                          stroke="#2A3B76"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      Imprimir
                    </button>
                  </div>
                </div>

                {/* Show content based on active tab */}
                {activeTab === "Proyeccion" ? (
                  <AvanceProgressChart data={data} />
                ) : activeTab === "Actividades" ? (
                  <ActivityView selectedProject={selectedProject} />
                ) : activeTab === "OnePage Mantención" ? (
                  <OnePageView selectedProject={selectedProject} />
                ) : activeTab === "Ruta Critica" ? (
                  <CriticalRouteView selectedProject={selectedProject} />
                ) : activeTab === "Seguridad" ? (
                  <SafetyView selectedProject={selectedProject} />
                ) : activeTab === "Medio Ambiente" ? (
                  <EnvironmentView selectedProject={selectedProject} />
                ) : (
                  <AvanceProgressChart data={data} />
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
}

const mapStateToProps = (reducers: any) => {
  return {
    servicesData: reducers.home.servicesData,
    email: reducers.profile.email,
    profile: reducers.profile.profile,
  };
};

const Report = connect(mapStateToProps, {})(ReportnoRedux);

export default Report;
