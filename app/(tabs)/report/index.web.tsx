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

import ReportHeader from "./webcomponents/ReportHeader";
import ReportNavbar from "./webcomponents/ReportNavbar";
import ProjectSelector from "./webcomponents/ProjectSelector";
import ProjectFilterModal from "../home/components/ProjectFilterModal";
import ActivityView from "./webcomponents/ActivityView";
import OnePageView from "./webcomponents/OnePageView";
import CriticalRouteView from "./webcomponents/CriticalRouteView";
import SafetyView from "./webcomponents/SafetyView";
import EnvironmentView from "./webcomponents/EnvironmentView";

// Mock data for projects
const AVAILABLE_PROJECTS = [
  "CHANCADO PRIMARIO",
  "CHANCADO SECUNDARIO",
  "MOLIENDA",
  "FLOTACIÓN",
  "ESPESADORES",
  "FILTRADO",
  "CHANCADO TERCIARIO",
  "SISTEMA DE FAJAS",
  "ALMACENAMIENTO DE CONCENTRADO",
  "PLANTA DE CAL",
  "SISTEMA DE BOMBEO",
];

function ReportnoRedux(props: any) {
  const router = useRouter();

  // const [showModal, setShowModal] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [renderComponent, setRenderComponent] = useState<any>(null);
  const [company, setCompany] = useState("TOTAL CONTRATISTAS");
  const [companyList, setCompanyList] = useState<any>();
  // const onCloseOpenModal = () => setShowModal((prevState) => !prevState);
  const userType = props.profile?.userType;

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
  const [selectedCompany, setSelectedCompany] = useState("Antapaccay");
  const [selectedType, setSelectedType] = useState("Parada de Planta");
  const [selectedDate, setSelectedDate] = useState("14/07/2025");
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

  console.log("Data in Report Screenn:", data);

  // go to a history screen

  const handleProjectChange = (project: string) => {
    setSelectedProject(project);
    // Here you would typically fetch or filter data based on the selected project
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
                  {/* <h4
                    style={{
                      margin: 0,
                      fontSize: 18,
                      color: "#2A3B76",
                      fontWeight: 600,
                    }}
                  >
                    Curva S de Avance General
                  </h4> */}

                  <div
                    style={{
                      display: "flex",
                      gap: 12,
                    }}
                  ></div>
                </div>

                {/* Show content based on active tab */}
                {activeTab === "Proyeccion" ? (
                  <AvanceProgressChart data={data} />
                ) : activeTab === "Actividades" ? (
                  <ActivityView data={data} />
                ) : // ) : activeTab === "OnePage Mantención" ? (
                //   <OnePageView selectedProject={selectedProject} />
                activeTab === "Ruta Critica" ? (
                  <CriticalRouteView data={data} />
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
