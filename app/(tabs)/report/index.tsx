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
      <View
        style={{
          flex: 1,
          backgroundColor: "white",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text
          style={{
            fontSize: 50,
            // fontFamily: "Arial",
            color: "#2A3B76",
          }}
        >
          Bienvenido
        </Text>
      </View>
    );
  } else {
    return (
      <SafeAreaView
        style={[{ flex: 1, backgroundColor: "white" }, styles.AndroidSafeArea]}
      >
        <ScrollView
          style={{ backgroundColor: "white" }} // Add backgroundColor here
          showsVerticalScrollIndicator={false}
        >
          <Text> </Text>
          <View style={{ flexDirection: "row", alignSelf: "center" }}>
            <TouchableOpacity onPress={() => update_Data()}>
              <Image
                source={require("../../../assets/pictures/empresa.png")}
                style={styles.roundImageUpload}
              />
            </TouchableOpacity>
          </View>

          {/* <TouchableOpacity
            onPress={
              userType === "Gerente" ||
              userType === "Planificador" ||
              userType === "GerenteContratista" ||
              userType === "SuperUsuario" ||
              userType === "PlanificadorContratista"
                ? () => goToHistoryScreen()
                : () => userTypeWarn()
            }
          >
            <Image
              source={require("../../../assets/pictures/historyIcon.png")}
              style={styles.history}
            />
          </TouchableOpacity> */}
          {/* <Text style={styles.company}>{companyName}</Text> */}
          <Text> </Text>
          <Text> </Text>

          <Text style={styles.company}>EMPRESA MINERA ANTAPACCAY SA</Text>

          <Text style={styles.company}>PARADA DE PLANTA JULIO 2025</Text>

          <Text> </Text>
          {/* {company !== "TOTAL CONTRATISTAS" &&
            (userType === "Gerente" ||
              userType === "Planificador" ||
              userType === "Supervisor" ||
              userType === "GerenteContratista" ||
              userType === "SuperUsuario" ||
              userType === "PlanificadorContratista") && (
              <RecursosHumanos company={company} />
            )} */}

          <Text> </Text>
          <Text> </Text>

          <View style={styles.iconMinMax}>
            <View style={styles.container22}>
              <Text style={styles.titleText}>Avance Parada de Planta</Text>
            </View>
          </View>
          <Text> </Text>
          {/* <LineChart
            data={dataLineChart}
            width={screenWidth}
            height={256}
            verticalLabelRotation={30}
            chartConfig={chartConfig}
            bezier
          /> */}
          <Text> </Text>
          {/* <View style={styles.iconMinMax}>
            <View style={styles.container22}>
              <Text style={styles.titleText}>Servicios Activos Asignados</Text>
            </View>
            <TouchableOpacity onPress={() => setServiciosActivos(true)}>
              <Image
                source={require("../../../assets/pictures/plus3.png")}
                style={styles.roundImageUploadmas}
              />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setServiciosActivos(false)}>
              <Image
                source={require("../../../assets/pictures/minus3.png")}
                style={styles.roundImageUploadmas}
              />
            </TouchableOpacity>
          </View>

          {serviciosActivos && (
            <>
              <PieChartView data={data} />
              <ServiceList data={data} />
            </>
          )}
          <Text> </Text>
          <Text> </Text> */}

          <View style={styles.iconMinMax}>
            <View style={styles.container22}>
              <Text style={styles.titleText}>
                Estado de Servicios de la Parada
              </Text>
            </View>
            <TouchableOpacity onPress={() => setEstadoServicios(true)}>
              <Image
                source={require("../../../assets/pictures/plus3.png")}
                style={styles.roundImageUploadmas}
              />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setEstadoServicios(false)}>
              <Image
                source={require("../../../assets/pictures/minus3.png")}
                style={styles.roundImageUploadmas}
              />
            </TouchableOpacity>
          </View>
          {estadoServicios && <EstadoServiceList data={data} />}
          <Text> </Text>
          <Text> </Text>
          <PieChartView data={data} />

          {/* <View style={styles.iconMinMax}>
            <View style={styles.container22}>
              <Text style={styles.titleText}>Servicios Inactivos</Text>
            </View>
            <TouchableOpacity onPress={() => setServiciosInactivos(true)}>
              <Image
                source={require("../../../assets/pictures/plus3.png")}
                style={styles.roundImageUploadmas}
              />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setServiciosInactivos(false)}>
              <Image
                source={require("../../../assets/pictures/minus3.png")}
                style={styles.roundImageUploadmas}
              />
            </TouchableOpacity>
          </View>
          <Text></Text> */}

          {serviciosInactivos && (
            <>
              <Text style={{ margin: 10 }}>
                <BarInactiveServices
                  data={data}
                  titulo={"Stand by"}
                  unidad={"servicios"}
                />
              </Text>
              <Text style={{ marginLeft: 10 }}>
                <BarInactiveServices
                  data={data}
                  titulo={"Cancelacion"}
                  unidad={"servicios"}
                />
              </Text>
              <InactiveServiceList data={data} />
            </>
          )}
          <Text> </Text>

          {(userType === "Gerente" ||
            userType === "Planificador" ||
            userType === "GerenteContratista" ||
            userType === "SuperUsuario" ||
            userType === "PlanificadorContratista") && (
            <View style={styles.iconMinMax}>
              <View style={styles.container22}>
                <Text style={styles.titleText}>Monto Servicios</Text>
              </View>
              <TouchableOpacity onPress={() => setMontoServicios(true)}>
                <Image
                  source={require("../../../assets/pictures/plus3.png")}
                  style={styles.roundImageUploadmas}
                />
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setMontoServicios(false)}>
                <Image
                  source={require("../../../assets/pictures/minus3.png")}
                  style={styles.roundImageUploadmas}
                />
              </TouchableOpacity>
            </View>
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
          <Text> </Text>
          <Text> </Text>
          {(userType === "Gerente" ||
            userType === "Planificador" ||
            userType === "GerenteContratista" ||
            userType === "SuperUsuario" ||
            userType === "PlanificadorContratista") && (
            <View style={styles.iconMinMax}>
              <View style={styles.container22}>
                <Text style={styles.titleText}>Monto Estado de Pago</Text>
              </View>
              <TouchableOpacity onPress={() => setMontoEDP(true)}>
                <Image
                  source={require("../../../assets/pictures/plus3.png")}
                  style={styles.roundImageUploadmas}
                />
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setMontoEDP(false)}>
                <Image
                  source={require("../../../assets/pictures/minus3.png")}
                  style={styles.roundImageUploadmas}
                />
              </TouchableOpacity>
            </View>
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

          <Text> </Text>

          <Text> </Text>

          {/* {(userType === "Gerente" ||
            userType === "Planificador" ||
            userType === "GerenteContratista" ||
            userType === "SuperUsuario" ||
            userType === "PlanificadorContratista") && (
            <View style={styles.iconMinMax}>
              <View style={styles.container22}>
                <Text style={styles.titleText}>Montos Comprometidos</Text>
              </View>
              <TouchableOpacity onPress={() => setComprometido(true)}>
                <Image
                  source={require("../../../assets/pictures/plus3.png")}
                  style={styles.roundImageUploadmas}
                />
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setComprometido(false)}>
                <Image
                  source={require("../../../assets/pictures/minus3.png")}
                  style={styles.roundImageUploadmas}
                />
              </TouchableOpacity>
            </View>
          )} */}

          {/* {comprometido &&
            (userType === "Gerente" ||
              userType === "Planificador" ||
              userType === "GerenteContratista" ||
              userType === "SuperUsuario" ||
              userType === "PlanificadorContratista") && (
              <MontoComprometido data={data} />
            )}
          <Text> </Text>
 */}
          <TouchableOpacity onPress={() => getExcelReportData(data)}>
            <Image
              source={require("../../../assets/pictures/excel2.png")}
              style={styles.excel}
            />
          </TouchableOpacity>
          <Text> </Text>

          <Text> </Text>
          <Text> </Text>

          <Text> </Text>
        </ScrollView>
        <Modal show={showModal} close={onCloseOpenModal}>
          {renderComponent}
        </Modal>
      </SafeAreaView>
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
