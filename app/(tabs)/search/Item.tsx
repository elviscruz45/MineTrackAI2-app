import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions,
  StyleSheet,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { MaterialIcon } from "@/components/MaterialIcon";
import styles from "./Item.styles";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "@/firebaseConfig";
import { screen } from "../../../utils";
import { connect } from "react-redux";
import { saveActualServiceAIT } from "../../../redux/actions/post";
import { EquipmentListUpper } from "../../../redux/actions/home";
import { areaLists } from "../../../utils/areaList";
import CircularProgress from "./Item.circularProgress";
import GanttHistorial from "./components/Gantt/Gantt";
import { LoadingSpinner } from "../../../components/LoadingSpinner";
import Toast from "react-native-toast-message";
import { rootReducers } from "@/redux/reducers";
import { useLocalSearchParams } from "expo-router";
import { useRouter } from "expo-router";
import * as Progress from "react-native-progress";
// import { createDocxReport } from "../../../utils/createDocxReport";
import { createEnhancedDocxReport } from "../../../utils/createDocxReport";

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;

// Responsive breakpoints
const isTablet = windowWidth > 768;
const isMobile = windowWidth <= 480;

// Modern styles for enhanced UI/UX
const modernStyles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  serviceCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginVertical: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  serviceHeader: {
    flexDirection: isMobile ? "column" : "row",
    alignItems: isMobile ? "center" : "flex-start",
    marginBottom: 20,
  },
  progressContainer: {
    alignItems: "center",
    marginRight: isMobile ? 0 : 20,
    marginBottom: isMobile ? 16 : 0,
  },
  serviceInfoContainer: {
    flex: 1,
    minWidth: 0,
  },
  serviceName: {
    fontSize: isMobile ? 20 : 24,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 12,
    textAlign: isMobile ? "center" : "left",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    flexWrap: "wrap",
  },
  infoIcon: {
    marginRight: 8,
    width: 20,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
    marginRight: 4,
  },
  infoValue: {
    fontSize: 14,
    color: "#1a1a1a",
    fontWeight: "400",
    flex: 1,
  },
  progressSection: {
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  progressHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
    marginLeft: 8,
  },
  progressBarContainer: {
    marginBottom: 12,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#e9ecef",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "500",
  },
  dateCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#007AFF",
  },
  actionButtonsContainer: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  actionButton: {
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 8,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 80,
    flex: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  actionButtonIcon: {
    width: 32,
    height: 32,
    marginBottom: 8,
  },
  actionButtonLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: "#666",
    textAlign: "center",
  },
});
// function parseCustomDate(dateStr: string) {
//   // Try DD/MM/YYYY or D/M/YY
//   const regex =
//     /^(\d{1,2})\/(\d{1,2})\/(\d{2,4}) (\d{1,2}):(\d{2}):(\d{2}) (AM|PM)$/;
//   const match = dateStr?.match(regex);
//   if (match) {
//     let [, day, month, year, hour, minute, second, ampm] = match;
//     // Handle 2-digit year
//     if (year.length === 2) year = "20" + year;
//     hour = String(
//       ampm === "PM" && hour !== "12"
//         ? Number(hour) + 12
//         : hour === "12" && ampm === "AM"
//         ? 0
//         : hour
//     );
//     return new Date(
//       Number(year),
//       Number(month) - 1,
//       Number(day),
//       Number(hour),
//       Number(minute),
//       Number(second)
//     );
//   }
//   // fallback: try Date.parse
//   const fallback = new Date(dateStr);
//   return isNaN(fallback.getTime()) ? null : fallback;
// }
function parseCustomDate(dateStr: string) {
  if (!dateStr) return null;
  // Intenta con segundos y AM/PM
  let regex =
    /^(\d{1,2})\/(\d{1,2})\/(\d{2,4}) (\d{1,2}):(\d{2})(?::(\d{2}))?\s?(AM|PM)?$/i;
  let match = dateStr.match(regex);
  if (match) {
    let [, day, month, year, hour, minute, second = "0", ampm] = match;
    if (year?.length === 2) year = "20" + year;
    if (ampm) {
      hour = String(
        ampm.toUpperCase() === "PM" && hour !== "12"
          ? Number(hour) + 12
          : hour === "12" && ampm.toUpperCase() === "AM"
          ? 0
          : hour
      );
    }
    return new Date(
      Number(year),
      Number(month) - 1,
      Number(day),
      Number(hour),
      Number(minute),
      Number(second)
    );
  }
  // fallback: try Date.parse
  const fallback = new Date(dateStr);
  return isNaN(fallback.getTime()) ? null : fallback;
}

// Helper function to format dates in a cleaner way
function formatDateDisplay(dateInput: any) {
  if (!dateInput) return "No definido";

  if (dateInput?.seconds) {
    const date = new Date(dateInput.seconds * 1000);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return dateInput;
}

function ItemScreenNotRedux(props: any) {
  const router = useRouter();
  const [loadingReport, setLoadingReport] = useState(false);

  //global state management for the user_uid
  const { Item }: any = useLocalSearchParams();

  let AITServiceList;

  const [post, setPost] = useState(null);
  const [serviceInfo, setServiceInfo] = useState<any>();

  //Data about the company belong this event
  function capitalizeFirstLetter(str: string) {
    return str?.charAt(0).toUpperCase() + str?.slice(1);
  }
  const regex = /@(.+?)\./i;

  ///the algoritm to retrieve the image source to render the icon
  const area = serviceInfo?.AreaServicio;
  const indexareaList = areaLists?.findIndex((item) => item.value === area);
  const imageSource =
    areaLists[indexareaList]?.image ||
    require("../../../assets/equipmentplant/logoMetso4.png");
  // require("../../../assets/equipmentplant/ImageIcons/confipetrolLogos.png");
  /// the algorithm to retrieve the amount with format
  const formattedAmount = new Intl.NumberFormat("en-US", {
    style: "decimal",
    useGrouping: true,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(serviceInfo?.Monto);

  ///function to change the format of FechaFin from ServiciosAIT firebase collection
  const formatDate = (item: any) => {
    if (!item) return;
    const date = new Date(item);

    const monthNames = [
      "ene.",
      "feb.",
      "mar.",
      "abr.",
      "may.",
      "jun.",
      "jul.",
      "ago.",
      "sep.",
      "oct.",
      "nov.",
      "dic.",
    ];
    const day = date.getDate();
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    const hour = date.getHours();
    const minute = date.getMinutes();
    const formattedDate = `${day} ${month} ${year}`;
    return formattedDate;
  };

  // Considering if there are a modification in the service
  const HHModificado = serviceInfo?.HHModificado ?? 0;
  const MontoModificado = serviceInfo?.MontoModificado ?? 0;
  const NuevaFechaEstimada = serviceInfo?.NuevaFechaEstimada ?? 0;

  const HHtoRender =
    HHModificado > serviceInfo?.HorasHombre
      ? HHModificado
      : serviceInfo?.HorasHombre;
  const MontoModificadotoRender =
    MontoModificado > serviceInfo?.Monto ? MontoModificado : serviceInfo?.Monto;
  const NuevaFechaEstimadatoRender =
    NuevaFechaEstimada > serviceInfo?.FechaFin
      ? formatDate(NuevaFechaEstimada?.seconds * 1000)
      : formatDate(serviceInfo?.FechaFin?.seconds * 1000);

  const NuevaFechaEstimadatoCalculate =
    NuevaFechaEstimada > serviceInfo?.FechaFin
      ? NuevaFechaEstimada
      : serviceInfo?.FechaFin;

  const dateString = serviceInfo?.FechaFin;
  let daysLeft = 0;
  if (!dateString || typeof dateString !== "string") {
    daysLeft = 0;
  } else {
    const [day, month, year, time] = dateString.split(/[/ ]/);
    const date = new Date(`${year}-${month}-${day}T${time}`);
    const milliseconds = date.getTime();
    // Calculate the amount of hours left until the service ends
    const hoursLeft = (milliseconds - Date.now()) / 3600000;
    daysLeft = isNaN(hoursLeft) ? 0 : Math.round(hoursLeft);
  }
  //calculate the amount of days to finish the service based if there are a new modification or not
  // let daysLeft = ((milliseconds - Date.now()) / 3600000).toFixed(0);

  // Get the current date
  const currentDate = new Date();

  // Subtract 30 days from the current date
  const pastDate = new Date();
  pastDate.setDate(currentDate.getDate() - 30);

  const [startDate, setStartDate] = useState(pastDate);
  const [endDate, setEndDate] = useState(currentDate);
  const [removeFilter, setRemoveFilter] = useState(true);

  //Using navigation.navigate I send it to another screen (post)
  const goToPublicar = () => {
    if (!imageSource && !serviceInfo.photoServiceURL) {
      Toast.show({
        type: "error",
        text1: "Actualizar foto del servicio para continuar",
        visibilityTime: 2000,
        autoHide: true,
        topOffset: 30,
        bottomOffset: 40,
      });
      return;
    }

    router.back();
  };

  useEffect(() => {
    const companyName =
      capitalizeFirstLetter(props.email?.match(regex)?.[1]) || "Anonimo";
    AITServiceList = props.servicesData;

    let service = AITServiceList.filter(
      (item: any) => item.idServiciosAIT === Item
    )[0];

    const lista: any = [];
    service?.events?.forEach((item: any) => {
      const dataschema = {
        ...item,
        time: "01 Ene",
        title: item.titulo,
        description: item.comentarios,
        lineColor: "skyblue",
        icon: require("../../../assets/pictures/empresa.png"),
        imageUrl: item.fotoUsuarioPerfil,
        idDocAITFirestoreDB: Item,
      };
      lista.push(dataschema);
    });

    setPost(lista);

    setServiceInfo(service);
    props.saveActualServiceAIT(service);
  }, [props.servicesData, Item]);

  //this function goes to another screen to get more detail about the service state

  console.log("serviceInfo", serviceInfo);
  const Detalles = (data: any) => {
    const tareosEvents = data?.events?.map((item: any) => {
      return {
        supervisores: item.supervisores,
        soldador: item.soldador,
        liderTecnico: item.liderTecnico,
        ayudante: item.ayudante,
        HSE: item.HSE,
        tecnico: item.tecnico,
      };
    });

    const FechaInicio = data?.FechaInicio?.seconds
      ? (() => {
          const date = new Date(serviceInfo.FechaInicio.seconds * 1000);
          const day = String(date.getDate()).padStart(2, "0");
          const month = String(date.getMonth() + 1).padStart(2, "0");
          const year = date.getFullYear();
          let hours = date.getHours();
          const minutes = String(date.getMinutes()).padStart(2, "0");
          const seconds = String(date.getSeconds()).padStart(2, "0");
          const ampm = hours >= 12 ? "PM" : "AM";
          hours = hours % 12;
          hours = hours ? hours : 12; // the hour '0' should be '12'
          return `${day}/${month}/${year} ${String(hours).padStart(
            2,
            "0"
          )}:${minutes}:${seconds} ${ampm}`;
        })()
      : data?.FechaInicio;

    const FechaFin = data?.FechaFin?.seconds
      ? (() => {
          const date = new Date(serviceInfo.FechaFin.seconds * 1000);
          const day = String(date.getDate()).padStart(2, "0");
          const month = String(date.getMonth() + 1).padStart(2, "0");
          const year = date.getFullYear();
          let hours = date.getHours();
          const minutes = String(date.getMinutes()).padStart(2, "0");
          const seconds = String(date.getSeconds()).padStart(2, "0");
          const ampm = hours >= 12 ? "PM" : "AM";
          hours = hours % 12;
          hours = hours ? hours : 12; // the hour '0' should be '12'
          return `${day}/${month}/${year} ${String(hours).padStart(
            2,
            "0"
          )}:${minutes}:${seconds} ${ampm}`;
        })()
      : data?.FechaFin;

    //new Date(item.createdAt.seconds * 1000)

    console.log("FechaInicio PROGRAMADO", FechaInicio);
    console.log("FechaFin PROGRAMADO", FechaFin);

    // const DiasTotales = Number(FechaFin) - Number(FechaInicio);

    const fechaInicioDate = parseCustomDate(FechaInicio);
    const fechaFinDate = parseCustomDate(FechaFin);

    let HorasTotales = 0;
    if (fechaInicioDate && fechaFinDate) {
      HorasTotales =
        (fechaFinDate.getTime() - fechaInicioDate.getTime()) / 3600000; // hours
    }
    console.log("fechaInicioDate", fechaInicioDate);
    console.log("fechaFinDate", fechaFinDate);
    console.log("HorasTotales", HorasTotales);

    const AvanceEventos = data?.events?.map((item: any) => {
      // Build Date directly from Firestore timestamp
      const FechaAvanceDate =
        item.createdAt?.seconds != null
          ? new Date(item.createdAt.seconds * 1000)
          : null;

      let horasdesdeFechaInicio = 0;
      if (FechaAvanceDate && fechaInicioDate) {
        horasdesdeFechaInicio =
          (FechaAvanceDate.getTime() - fechaInicioDate.getTime()) / 3600000;
      }

      return {
        fechaAvance: FechaAvanceDate,
        porcentajeAvance: item.porcentajeAvance,
        horasdesdeFechaInicio,
      };
    });

    router.push({
      pathname: "/search/moreDetail",
      params: {
        idServiciosAIT: data?.idServiciosAIT,
        area: data?.AreaServicio,
        Monto: data?.Monto,
        HorasHombre: data?.HorasHombre,
        HHModificado: data?.HHModificado,
        MontoModificado: data?.MontoModificado,
        NuevaFechaEstimada: data?.NuevaFechaEstimada,
        FechaFin: FechaFin,
        // FechaInicio: new Date(
        //   data?.FechaInicio.seconds * 1000
        // ).toLocaleString(),
        FechaInicio: FechaInicio,
        FechaFinISO: data?.FechaFin?.seconds * 1000,
        FechaInicioISO: data?.FechaInicio?.seconds * 1000,
        createdAt: data?.createdAt,
        ResponsableEmpresaUsuario: data?.ResponsableEmpresaUsuario,
        ResponsableEmpresaUsuario2: data?.ResponsableEmpresaUsuario2,
        ResponsableEmpresaUsuario3: data?.ResponsableEmpresaUsuario3,
        ResponsableEmpresaContratista: data?.ResponsableEmpresaContratista,
        ResponsableEmpresaContratista2: data?.ResponsableEmpresaContratista2,
        ResponsableEmpresaContratista3: data?.ResponsableEmpresaContratista3,
        AvanceEjecucion: data?.AvanceEjecucion,
        emailPerfil: data?.emailPerfil,
        photoServiceURL: data?.photoServiceURL?.replace(/%2F/g, "abcdefg"),
        NombreServicio: data?.NombreServicio,
        EmpresaMinera: data?.EmpresaMinera,
        NumeroAIT: data?.NumeroAIT,
        NumeroCotizacion: data?.NumeroCotizacion,
        TipoServicio: data?.TipoServicio,
        AreaServicio: data?.AreaServicio,
        companyName: data?.companyName,
        Moneda: data?.Moneda,
        activities: JSON.stringify(data?.activities),
        activitiesData: JSON.stringify(data?.activitiesData),
        events: JSON.stringify(data?.events),
        tareo: JSON.stringify(tareosEvents),
        Supervisor: data?.Supervisor,
        SupervisorSeguridad: data?.SupervisorSeguridad,
        Lider: data?.Lider,
        Tecnicos: data?.Tecnicos,
        Soldador: data?.Soldador,
        HorasTotales: HorasTotales,
        AvanceEventos: JSON.stringify(AvanceEventos),
      },
    });
  };

  //this function goes to homeTab=>commentScreen
  const comentPost = (data: any) => {
    router.push({
      pathname: "/search/CommentSearch",
      params: {
        idDocFirestoreDB: data.idDocFirestoreDB,
        AITidServicios: data.idDocAITFirestoreDB,
      },
    });
  };

  //this function goes to homeTab=>commentScreen
  const goToDocsToApprove = (data: any) => {
    router.push({
      pathname: "/search/DocstoApprove",
      params: {
        idServiciosAIT: data?.idServiciosAIT,
      },
    });
  };

  //Using navigation.navigate I send it to another screen (post)
  const goToDocs = (item: any) => {
    router.push({
      pathname: "/search/file",
      params: { NombreServicio: item.NombreServicio },
    });
  };

  const createReport = async (post: any, serviceInfo: any) => {
    setLoadingReport(true);
    try {
      const blob = await createEnhancedDocxReport(post, serviceInfo);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Reporte_${serviceInfo.NombreServicio}.docx`;
      //  a.download = "Reporte_de_Servicio.docx";

      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      Toast.show({
        type: "success",
        text1: "Reporte generado exitosamente",
        text2: "El archivo se ha descargado correctamente",
        visibilityTime: 3000,
        autoHide: true,
        topOffset: 30,
        bottomOffset: 40,
      });
    } catch (error) {
      console.error("Error creating report:", error);
      Toast.show({
        type: "error",
        text1: "Error al generar el reporte",
        text2: "Por favor intente nuevamente",
        visibilityTime: 3000,
        autoHide: true,
        topOffset: 30,
        bottomOffset: 40,
      });
    }
    setLoadingReport(false);
  };
  // serviceInfo
  if (!serviceInfo || !post) {
    return <LoadingSpinner />;
  } else if (loadingReport) {
    return <LoadingSpinner />;
  } else {
    return (
      <View style={modernStyles.mainContainer}>
        <ScrollView
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingVertical: 16 }}
        >
          {/* Service Information Card */}
          <View style={modernStyles.serviceCard}>
            <View style={modernStyles.serviceHeader}>
              {/* Progress Circle */}
              <View style={modernStyles.progressContainer}>
                <CircularProgress
                  imageSourceDefault={imageSource}
                  imageStyle={styles.roundImage}
                  avance={serviceInfo.AvanceEjecucion}
                  idait={serviceInfo.idServiciosAIT}
                  image={serviceInfo.photoServiceURL}
                  titulo={serviceInfo.NombreServicio}
                  emailProfile={props.email}
                  emailPost={serviceInfo.emailPerfil}
                />
              </View>

              {/* Service Info */}
              <View style={modernStyles.serviceInfoContainer}>
                <Text style={modernStyles.serviceName}>
                  {serviceInfo.NombreServicio}
                </Text>

                {/* Service Number */}
                <View style={modernStyles.infoRow}>
                  <MaterialIcon
                    name="confirmation-number"
                    size={16}
                    color="#007AFF"
                    style={modernStyles.infoIcon}
                  />
                  <Text style={modernStyles.infoLabel}>
                    Número de Servicio:
                  </Text>
                  <Text style={modernStyles.infoValue}>
                    {serviceInfo.NumeroAIT}
                  </Text>
                </View>

                {/* Start Date */}
                <View style={modernStyles.dateCard}>
                  <View style={modernStyles.infoRow}>
                    <MaterialIcon
                      name="play-arrow"
                      size={16}
                      color="#4caf50"
                      style={modernStyles.infoIcon}
                    />
                    <Text style={modernStyles.infoLabel}>Inicio:</Text>
                    <Text style={modernStyles.infoValue}>
                      {formatDateDisplay(serviceInfo?.FechaInicio)}
                    </Text>
                  </View>
                </View>

                {/* End Date */}
                <View style={modernStyles.dateCard}>
                  <View style={modernStyles.infoRow}>
                    <MaterialIcon
                      name="stop"
                      size={16}
                      color="#f44336"
                      style={modernStyles.infoIcon}
                    />
                    <Text style={modernStyles.infoLabel}>Fin:</Text>
                    <Text style={modernStyles.infoValue}>
                      {formatDateDisplay(serviceInfo?.FechaFin)}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={modernStyles.actionButtonsContainer}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "600",
                color: "#1a1a1a",
                marginBottom: 16,
                textAlign: "center",
              }}
            >
              Acciones Rápidas
            </Text>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-around",
              }}
            >
              <TouchableOpacity
                style={modernStyles.actionButton}
                onPress={() => Detalles(serviceInfo)}
              >
                <MaterialIcon name="info" size={24} color="#007AFF" />
                <Text style={modernStyles.actionButtonLabel}>
                  Más Información
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={modernStyles.actionButton}
                onPress={() => goToDocs(serviceInfo)}
              >
                <MaterialIcon name="folder" size={24} color="#007AFF" />
                <Text style={modernStyles.actionButtonLabel}>Documentos</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={modernStyles.actionButton}
                onPress={() => createReport(post, serviceInfo)}
              >
                <MaterialIcon name="description" size={24} color="#007AFF" />
                <Text style={modernStyles.actionButtonLabel}>
                  Generar Reporte
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* History Section */}
          <View style={modernStyles.serviceCard}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 16,
                justifyContent: "center",
              }}
            >
              <MaterialIcon name="history" size={20} color="#007AFF" />
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "600",
                  color: "#1a1a1a",
                  marginLeft: 8,
                }}
              >
                Historial de Eventos
              </Text>
            </View>

            <GanttHistorial datas={post} comentPost={comentPost} />
          </View>
        </ScrollView>
      </View>
    );
  }
}

const mapStateToProps = (reducers: any) => {
  return {
    servicesData: reducers.home.servicesData,
    email: reducers.profile.email,
    // servicesData: reducers.home.servicesData,
    // totalEventServiceAITLIST: reducers.home.totalEventServiceAITLIST
  };
};

const Item = connect(mapStateToProps, {
  saveActualServiceAIT,
  EquipmentListUpper,
})(ItemScreenNotRedux);

export default Item;
