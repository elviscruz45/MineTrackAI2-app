import React, { useState, useEffect, useMemo } from "react";
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
import GerenciaDashboard from "./webcomponents/GerenciaDashboard";
import PlantAvailabilityReport from "./webcomponents/PlantAvailabilityReport";
import { sortByCodigo } from "../../../utils/sortByCodigo";
import { subscribeServiciosAitByProject } from "@/lib/db/serviciosAit";
import { updateAITServicesDATA } from "../../../redux/actions/home";

function ReportnoRedux(props: any) {
  const router = useRouter();

  // const [showModal, setShowModal] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [renderComponent, setRenderComponent] = useState<any>(null);
  const [company, setCompany] = useState("TOTAL CONTRATISTAS");
  const [companyList, setCompanyList] = useState<any>();
  // const onCloseOpenModal = () => setShowModal((prevState) => !prevState);
  const userType = props.profile?.userType;

  //states to view the tables
  const [serviciosActivos, setServiciosActivos] = useState(false);
  const [estadoServicios, setEstadoServicios] = useState(false);
  const [serviciosInactivos, setServiciosInactivos] = useState(false);
  const [montoServicios, setMontoServicios] = useState(false);
  const [montoEDP, setMontoEDP] = useState(false);
  const [comprometido, setComprometido] = useState(false);
  const [activeTab, setActiveTab] = useState("Proyeccion");
  const [selectedCompany, setSelectedCompany] = useState("Antapaccay");
  const [selectedType, setSelectedType] = useState("Parada de Planta");
  const [selectedDate, setSelectedDate] = useState("14/07/2025");
  //Data about the company belong this event

  const regex = /@(.+?)\./i;
  const companyName = props.email?.match(regex)?.[1].toUpperCase() || "Anonimo";

  const hasProjectData =
    Array.isArray(props.servicesData) && props.servicesData.length > 0;

  const data = useMemo(() => {
    if (!hasProjectData) return undefined;
    return sortByCodigo(props.servicesData);
  }, [props.servicesData, hasProjectData]);

  const selectedProject = useMemo(() => {
    if (!hasProjectData) return null;
    const first = props.servicesData[0];
    return first?.projectName ?? null;
  }, [props.servicesData, hasProjectData]);

  const projectId = hasProjectData ? props.servicesData[0]?.projectId : null;

  useEffect(() => {
    if (Array.isArray(props.servicesData)) {
      setCompanyList([
        ...new Set(props.servicesData?.map((item: any) => item.companyName)),
      ]);
    }
    setCompany(companyName);
  }, []);

  useEffect(() => {
    setActiveTab("Proyeccion");
  }, [hasProjectData, projectId]);

  useEffect(() => {
    if (!projectId || !props.email) return;

    const unsubscribe = subscribeServiciosAitByProject(
      projectId,
      (lista) => {
        props.updateAITServicesDATA(sortByCodigo(lista));
      },
      (error) => console.error("Error en realtime report:", error)
    );

    return unsubscribe;
  }, [projectId, props.email]);

  console.log("Data in Report Screenn:", data);

  if (!hasProjectData) {
    return (
      <div
        style={{
          ...styles.AndroidSafeArea,
          fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
        }}
      >
        <div
          style={{
            background: "linear-gradient(135deg, #2A3B76 0%, #1565c0 100%)",
            padding: "14px 20px",
            display: "flex",
            alignItems: "center",
            gap: 12,
            boxShadow: "0 2px 8px rgba(42,59,118,0.25)",
          }}
        >
          <div
            style={{
              background: "rgba(255,255,255,0.15)",
              border: "1px solid rgba(255,255,255,0.3)",
              color: "white",
              borderRadius: 6,
              padding: "6px 14px",
              fontWeight: 700,
              fontSize: 13,
            }}
          >
            MODO PLANTA
          </div>
          <span style={{ color: "rgba(255,255,255,0.85)", fontSize: 13 }}>
            Sin proyecto seleccionado — reporte de disponibilidad acumulada
          </span>
        </div>
        <div
          key="plant-availability"
          style={{
            backgroundColor: "#f0f4f8",
            overflowY: "auto",
            height: "calc(100vh - 56px)",
            padding: "0 16px 32px",
          }}
        >
          <PlantAvailabilityReport />
        </div>
      </div>
    );
  } else {
    return (
      <div
        style={{
          ...styles.AndroidSafeArea,
          fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
        }}
      >
        <ReportHeader />
        <ReportNavbar active={activeTab} onSelect={setActiveTab} />

        <div
          key={projectId ?? "project-report"}
          style={{
            backgroundColor: "#f0f4f8",
            overflowY: "auto",
            height: "calc(100vh - 120px)",
            padding: "0",
          }}
        >
          {/* Special layout for OnePage Mantención */}
          {activeTab === "OnePage Mantención" ? (
            <OnePageView selectedProject={selectedProject} />
          ) : (
            <div style={{ width: "100%", padding: "0 16px 32px" }}>
              {/* Show content based on active tab */}
              {activeTab === "Proyeccion" ? (
                <AvanceProgressChart data={data} />
              ) : activeTab === "Actividades" ? (
                <ActivityView data={data} />
              ) : activeTab === "Ruta Critica" ? (
                <CriticalRouteView data={data} />
              ) : activeTab === "Seguridad" ? (
                <SafetyView data={data} />
              ) : activeTab === "Medio Ambiente" ? (
                <EnvironmentView selectedProject={selectedProject} />
              ) : activeTab === "Gerencia" ? (
                <GerenciaDashboard data={data} />
              ) : (
                <AvanceProgressChart data={data} />
              )}
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

const Report = connect(mapStateToProps, { updateAITServicesDATA })(ReportnoRedux);

export default Report;
