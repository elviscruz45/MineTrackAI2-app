import React, { useState, useEffect } from "react";
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
      <div
        style={{ flex: 1, backgroundColor: "white", ...styles.AndroidSafeArea }}
      >
        <div
          style={{
            backgroundColor: "white",
            overflowY: "auto",
            height: "100vh",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <button
              onClick={update_Data}
              style={{
                background: "none",
                border: "none",
                padding: 0,
                cursor: "pointer",
              }}
            >
              <img
                src={require("../../../assets/pictures/empresa.png")}
                style={styles.roundImageUpload}
                alt="Empresa"
              />
            </button>
          </div>

          <div style={{ height: 16 }} />
          <div style={{ height: 16 }} />

          <h2 style={styles.company}>EMPRESA MINERA ANTAPACCAY SA</h2>
          <h3 style={styles.company}>PARADA DE PLANTA JULIO 2025</h3>

          <div style={{ height: 16 }} />
          <div style={{ height: 16 }} />
          <div style={{ height: 16 }} />

          <div style={styles.iconMinMax}>
            <div style={styles.container22}>
              <h4 style={styles.titleText}>Avance Parada de Planta</h4>
            </div>
          </div>
          <div style={{ height: 16 }} />

          <div style={{ height: 16 }} />

          <div style={styles.iconMinMax}>
            <div style={styles.container22}>
              <h4 style={styles.titleText}>Estado de Servicios de la Parada</h4>
            </div>
            <button
              onClick={() => setEstadoServicios(true)}
              style={{
                background: "none",
                border: "none",
                padding: 0,
                cursor: "pointer",
              }}
            >
              <img
                src={require("../../../assets/pictures/plus3.png")}
                style={styles.roundImageUploadmas}
                alt="plus"
              />
            </button>
            <button
              onClick={() => setEstadoServicios(false)}
              style={{
                background: "none",
                border: "none",
                padding: 0,
                cursor: "pointer",
              }}
            >
              <img
                src={require("../../../assets/pictures/minus3.png")}
                style={styles.roundImageUploadmas}
                alt="minus"
              />
            </button>
          </div>
          {estadoServicios && <EstadoServiceList data={data} />}
          <div style={{ height: 16 }} />
          <div style={{ height: 16 }} />
          <PieChartView data={data} />

          {serviciosInactivos && (
            <>
              <div style={{ margin: 10 }}>
                <BarInactiveServices
                  data={data}
                  titulo={"Stand by"}
                  unidad={"servicios"}
                />
              </div>
              <div style={{ marginLeft: 10 }}>
                <BarInactiveServices
                  data={data}
                  titulo={"Cancelacion"}
                  unidad={"servicios"}
                />
              </div>
              <InactiveServiceList data={data} />
            </>
          )}
          <div style={{ height: 16 }} />

          {(userType === "Gerente" ||
            userType === "Planificador" ||
            userType === "GerenteContratista" ||
            userType === "SuperUsuario" ||
            userType === "PlanificadorContratista") && (
            <div style={styles.iconMinMax}>
              <div style={styles.container22}>
                <h4 style={styles.titleText}>Monto Servicios</h4>
              </div>
              <button
                onClick={() => setMontoServicios(true)}
                style={{
                  background: "none",
                  border: "none",
                  padding: 0,
                  cursor: "pointer",
                }}
              >
                <img
                  src={require("../../../assets/pictures/plus3.png")}
                  style={styles.roundImageUploadmas}
                  alt="plus"
                />
              </button>
              <button
                onClick={() => setMontoServicios(false)}
                style={{
                  background: "none",
                  border: "none",
                  padding: 0,
                  cursor: "pointer",
                }}
              >
                <img
                  src={require("../../../assets/pictures/minus3.png")}
                  style={styles.roundImageUploadmas}
                  alt="minus"
                />
              </button>
            </div>
          )}
          {montoServicios &&
            (userType === "Gerente" ||
              userType === "Planificador" ||
              userType === "GerenteContratista" ||
              userType === "SuperUsuario" ||
              userType === "PlanificadorContratista") && (
              <>
                <BarChartMontoServicios data={data} />
                <MontoServiceList data={data} />
              </>
            )}
          <div style={{ height: 16 }} />
          <div style={{ height: 16 }} />
          {(userType === "Gerente" ||
            userType === "Planificador" ||
            userType === "GerenteContratista" ||
            userType === "SuperUsuario" ||
            userType === "PlanificadorContratista") && (
            <div style={styles.iconMinMax}>
              <div style={styles.container22}>
                <h4 style={styles.titleText}>Monto Estado de Pago</h4>
              </div>
              <button
                onClick={() => setMontoEDP(true)}
                style={{
                  background: "none",
                  border: "none",
                  padding: 0,
                  cursor: "pointer",
                }}
              >
                <img
                  src={require("../../../assets/pictures/plus3.png")}
                  style={styles.roundImageUploadmas}
                  alt="plus"
                />
              </button>
              <button
                onClick={() => setMontoEDP(false)}
                style={{
                  background: "none",
                  border: "none",
                  padding: 0,
                  cursor: "pointer",
                }}
              >
                <img
                  src={require("../../../assets/pictures/minus3.png")}
                  style={styles.roundImageUploadmas}
                  alt="minus"
                />
              </button>
            </div>
          )}

          {montoEDP &&
            (userType === "Gerente" ||
              userType === "Planificador" ||
              userType === "GerenteContratista" ||
              userType === "SuperUsuario" ||
              userType === "PlanificadorContratista") && (
              <>
                <BarChartProceso data={data} />
                <MontoEDPList data={data} />
              </>
            )}

          <div style={{ height: 16 }} />
          <div style={{ height: 16 }} />

          <button
            onClick={() => getExcelReportData(data)}
            style={{
              background: "none",
              border: "none",
              padding: 0,
              cursor: "pointer",
            }}
          >
            <img
              src={require("../../../assets/pictures/excel2.png")}
              style={styles.excel}
              alt="excel"
            />
          </button>
          <div style={{ height: 16 }} />
          <div style={{ height: 16 }} />
          <div style={{ height: 16 }} />
          <div style={{ height: 16 }} />
        </div>
        {/* Modal logic for web */}
        <Modal show={showModal} close={onCloseOpenModal}>
          {renderComponent}
        </Modal>
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
