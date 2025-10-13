import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Dimensions,
  TouchableOpacity,
  Button,
  Platform,
  Alert,
  ScrollView,
  StyleSheet,
} from "react-native";
import { Image as ImageExpo } from "expo-image";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import styles from "./moreDetail.styles";
import { screen } from "../../../utils";
import { connect } from "react-redux";
// import { saveActualEquipment } from "../../redux/actions/post";
import { EquipmentListUpper } from "../../../redux/actions/home";
import { areaLists } from "../../../utils/areaList";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { userTypeList } from "../../../utils/userTypeList";
import { useRouter, useLocalSearchParams } from "expo-router";
import BarChartTareo from "./moreDetail.Chart";
import ChangeDisplayFechaReal from "./components/FechaReal/ChangeDisplayFechaReal";
import { Modal } from "@/components/Modal/Modal";
import {
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  onSnapshot,
  getDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "@/firebaseConfig";
import Toast from "react-native-toast-message";
// import {
//   LineChart,
//   BarChart,
//   PieChart,
//   ProgressChart,
//   ContributionGraph,
//   StackedBarChart,
// } from "react-native-chart-kit";
import * as Progress from "react-native-progress";

type ZingChartType = React.ComponentType<{ data: any }>;
interface ProgressChartProps {
  data?: any;
}
const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;

// Responsive breakpoints
const isTablet = windowWidth > 768;
const isMobile = windowWidth <= 480;

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

function MoreDetailScreenNoRedux(props: any) {
  const [data, setData] = useState();
  const [showModal, setShowModal] = useState<any>(false);
  const [renderComponent, setRenderComponent] = useState<any>("");
  const [isClient, setIsClient] = useState(false);
  const [updateing, setUpdating] = useState(false);

  const [ZingChartComponent, setZingChartComponent] =
    useState<ZingChartType | null>(null);
  const onCloseOpenModal = () => setShowModal((prevState: any) => !prevState);

  useEffect(() => {
    setIsClient(true);

    // Only import ZingChart on the client side
    if (typeof window !== "undefined") {
      const importZingChart = async () => {
        try {
          const zingchartModule = await import("zingchart-react");
          await import("zingchart/es6");
          setZingChartComponent(() => zingchartModule.default);
        } catch (error) {
          console.error("Failed to load ZingChart:", error);
        }
      };

      importZingChart();
    }
  }, []);

  const router = useRouter();
  //global state management for the user_uid
  const {
    idServiciosAIT,
    area,
    Monto,
    HorasHombre,
    HHModificado,
    MontoModificado,
    NuevaFechaEstimada,
    FechaFin,
    FechaInicio,
    FechaFinISO,
    FechaInicioISO,
    createdAt,
    ResponsableEmpresaUsuario,
    ResponsableEmpresaUsuario2,
    ResponsableEmpresaUsuario3,
    ResponsableEmpresaContratista,
    ResponsableEmpresaContratista2,
    ResponsableEmpresaContratista3,
    AvanceEjecucion,
    photoServiceURL,
    emailPerfil,
    Moneda,
    NombreServicio,
    EmpresaMinera,
    NumeroAIT,
    NumeroCotizacion,
    TipoServicio,
    AreaServicio,
    companyName,
    events,
    events1,
    activities,
    activitiesData,
    tareo,
    Supervisor,
    SupervisorSeguridad,
    Lider,
    Tecnicos,
    Soldador,
    HorasTotales,
    AvanceEventos,
  }: any = useLocalSearchParams();

  // Función para generar configuración de ZingChart basada en CurvaS
  const generateCurvaSChartConfig = (
    horasTotales: string,
    avanceEventos: string
  ) => {
    const listaActividades = JSON.parse(activitiesData || "[]");

    const steps = 15;
    const totalHoras = Number(horasTotales) || 288;
    const fechaInicioProyecto = parseCustomDate(
      listaActividades[0]?.FechaInicio
    );

    if (!fechaInicioProyecto) {
      return null; // No se puede generar el gráfico sin fecha de inicio
    }

    // Encuentra la mayor diferencia (en horas) entre fechaInicioProyecto y cualquier RealFechaFin
    let maxHorasReal = totalHoras;
    listaActividades.forEach((actividad: any) => {
      if (actividad.RealFechaFin && fechaInicioProyecto) {
        const finReal = new Date(actividad.RealFechaFin);
        const horasDesdeInicio =
          (finReal.getTime() - fechaInicioProyecto.getTime()) / 3600000;
        if (horasDesdeInicio > maxHorasReal) {
          maxHorasReal = horasDesdeInicio;
        }
      }
    });

    // Generar fechas para el eje X basado en maxHorasReal
    const fechasEjeX = Array.from({ length: steps + 1 }, (_, index) => {
      const horas = Math.round((maxHorasReal * index) / steps);
      const fecha = new Date(fechaInicioProyecto.getTime() + horas * 3600000);
      return (
        fecha.toLocaleDateString("es-ES", {
          day: "2-digit",
          month: "2-digit",
          year: "2-digit",
        }) + "\n08:00"
      );
    });

    // Valores numéricos para cálculos internos
    const axe_x_values = Array.from({ length: steps + 1 }, (_, index) => {
      return Math.round((maxHorasReal * index) / steps);
    });

    // Curva S planificada: siempre 16 valores, si axe_x es más largo, rellenar con 100
    const axe_y1_base = [
      0, 2, 4, 8, 15, 22, 30, 40, 55, 70, 80, 88, 93, 96, 98, 100,
    ];
    let axe_y1 = axe_y1_base.slice(0, axe_x_values.length);
    if (axe_x_values.length > axe_y1_base.length) {
      // Rellenar con 100 hasta igualar la longitud de axe_x
      axe_y1 = [
        ...axe_y1_base,
        ...Array(axe_x_values.length - axe_y1_base.length).fill(100),
      ];
    }

    // Calcular total de horas planificadas para ponderación
    const totalHorasPlanificadas = listaActividades.reduce(
      (acc: any, actividad: any) => {
        const inicio = parseCustomDate(actividad.FechaInicio);
        const fin = parseCustomDate(actividad.FechaFin);
        if (inicio && fin) {
          const horas = (fin.getTime() - inicio.getTime()) / 3600000;
          return acc + horas;
        }
        return acc;
      },
      0
    );

    // Curva real basada en actividades completadas (ponderada por horas)
    const axe_y2 = axe_x_values.map((hour) => {
      if (totalHorasPlanificadas === 0) return 0;

      let horasCompletadas = 0;

      listaActividades.forEach((actividad: any) => {
        if (
          !actividad.RealFechaFin ||
          !actividad.FechaInicio ||
          !actividad.FechaFin
        )
          return;

        const finReal = new Date(actividad.RealFechaFin);
        const horasDesdeInicio =
          (finReal.getTime() - fechaInicioProyecto.getTime()) / 3600000;

        // Si la actividad fue completada antes o igual a ese hour, suma sus horas planificadas
        if (horasDesdeInicio <= hour) {
          const inicio = parseCustomDate(actividad.FechaInicio);
          const fin = parseCustomDate(actividad.FechaFin);
          if (inicio && fin) {
            const horas = (fin.getTime() - inicio.getTime()) / 3600000;
            horasCompletadas += horas;
          }
        }
      });

      // Porcentaje ponderado de avance real, nunca mayor a 100%
      return Math.min(
        100,
        Math.round((horasCompletadas / totalHorasPlanificadas) * 100)
      );
    });

    // Curva proyectada (continuación de la curva real hacia el final planificado)
    const ultimoReal = axe_y2[axe_y2.length - 1] || 0;
    const axe_y3 = axe_x_values.map((_, index) => {
      if (index < axe_y2.length && axe_y2[index] > 0) {
        return null; // No mostrar proyección donde ya hay datos reales
      }
      // Proyección lineal desde el último punto real hasta 100%
      const progreso = index / (axe_x_values.length - 1);
      return ultimoReal + (100 - ultimoReal) * progreso;
    });

    return {
      type: "line",
      backgroundColor: "white",
      title: {
        fontSize: 18,
        fontColor: "#333",
        fontWeight: "bold",
        marginBottom: 20,
      },
      legend: {
        align: "center",
        verticalAlign: "bottom",
        backgroundColor: "transparent",
        borderWidth: 0,
        item: {
          fontColor: "#333",
          fontSize: 12,
          padding: "5px",
        },
        marker: {
          type: "circle",
          size: 8,
        },
      },
      scaleX: {
        label: {
          text: "Fechas",
          fontSize: 12,
          fontColor: "#333",
        },
        labels: fechasEjeX,
        lineColor: "#ccc",
        tick: {
          lineColor: "#ccc",
        },
        item: {
          fontColor: "#333",
          fontSize: 10,
          angle: -45,
        },
        guide: {
          visible: true,
          lineColor: "#f0f0f0",
          lineStyle: "solid",
        },
      },
      scaleY: {
        label: {
          text: "Porcentaje (%)",
          fontSize: 12,
          fontColor: "#333",
        },
        values: "0:100:10",
        lineColor: "#ccc",
        tick: {
          lineColor: "#ccc",
        },
        item: {
          fontColor: "#333",
          fontSize: 10,
        },
        guide: {
          lineStyle: "solid",
          lineColor: "#f0f0f0",
        },
      },
      series: [
        {
          text: "PROGRAMADO",
          values: axe_y1,
          lineColor: "#2196F3", // Azul como en la imagen
          lineWidth: 3,
          marker: {
            backgroundColor: "#2196F3",
            borderColor: "#2196F3",
            borderWidth: 2,
            size: 6,
          },
          legendMarker: {
            backgroundColor: "#2196F3",
          },
        },
        {
          text: "REAL",
          values: axe_y2,
          lineColor: "#F44336", // Rojo como en la imagen
          lineWidth: 3,
          marker: {
            backgroundColor: "#F44336",
            borderColor: "#F44336",
            borderWidth: 2,
            size: 6,
          },
          legendMarker: {
            backgroundColor: "#F44336",
          },
        },
        // {
        //   text: "PROYECTADO",
        //   values: axe_y3,
        //   lineColor: "#FF9800", // Naranja como en la imagen
        //   lineWidth: 3,
        //   lineStyle: "dashed", // Línea discontinua
        //   marker: {
        //     backgroundColor: "#FF9800",
        //     borderColor: "#FF9800",
        //     borderWidth: 2,
        //     size: 6,
        //   },
        //   legendMarker: {
        //     backgroundColor: "#FF9800",
        //   },
        // },
      ],
      plot: {
        aspect: "spline",
        tooltip: {
          visible: true,
          format: "%t: %v%",
          backgroundColor: "rgba(0,0,0,0.8)",
          fontColor: "white",
          fontSize: 12,
          padding: 8,
          borderRadius: 4,
        },
      },
      plotarea: {
        backgroundColor: "white",
        margin: "60px 60px 80px 80px",
      },
    };
  };

  // Generar configuración del gráfico
  const curvaSChartConfig = generateCurvaSChartConfig(
    HorasTotales,
    AvanceEventos
  );

  //retrieving serviceAIT list data from firebase
  useEffect(() => {
    const listaActividades = JSON.parse(activitiesData || "[]");

    setData(listaActividades);
  }, []);

  const userType = props.profile?.userType;
  ///the algoritm to retrieve the image source to render the icon
  const indexareaList = areaLists.findIndex((item) => item.value === area);
  const imageSource =
    areaLists[indexareaList]?.image ||
    require("../../../assets/equipmentplant/ImageIcons/fhIcon1.jpeg");

  const photoServiceURLDecoded = photoServiceURL.replace(/abcdefg/g, "%2F");

  const durationInMilliseconds = FechaFinISO - FechaInicioISO;

  //Algorithm to   convert string to a list to render a list of names

  const UsuarioAdministrador = ResponsableEmpresaUsuario?.split(",");
  const UsuarioPlaneamiento = ResponsableEmpresaUsuario2?.split(",");
  const UsuarioMantenimiento = ResponsableEmpresaUsuario3?.split(",");

  const ContratistaGerente = ResponsableEmpresaContratista?.split(",");
  const ContratistaPlanificador = ResponsableEmpresaContratista2?.split(",");
  const ContratistaSupervisor = ResponsableEmpresaContratista3?.split(",");

  const ResposableList = (array: any) => {
    return (
      <View>
        <FlatList
          data={array}
          renderItem={({ item }) => {
            return (
              <View>
                <Text style={styles.info3}>{item}</Text>
              </View>
            );
          }}
          keyExtractor={(item, index) => index.toString()}
          scrollEnabled={false}
        />
      </View>
    );
  };

  const activitiesList = (array: any) => {
    return (
      <View>
        <FlatList
          data={array}
          renderItem={({ index, item }) => {
            const FechaInicio = item.FechaInicio;
            const FechaFin = item.FechaFin;

            const InicioReal = item?.RealFechaInicio
              ? new Date(item?.RealFechaInicio)?.toLocaleString("en-GB", {
                  hour12: false,
                })
              : "";
            const FinReal = item?.RealFechaFin
              ? new Date(item?.RealFechaFin)?.toLocaleString("en-GB", {
                  hour12: false,
                })
              : "";

            return (
              <View style={modernStyles.activityCard}>
                {/* Activity Header */}
                <View style={modernStyles.activityHeader}>
                  <Text style={modernStyles.activityCode}>{item.Codigo}</Text>
                  <Text style={modernStyles.activityTitle}>
                    {item.NombreServicio}
                  </Text>
                </View>

                {/* Dates Section */}
                <View style={modernStyles.dateContainer}>
                  {/* Programmed Dates Column */}
                  <View style={modernStyles.dateColumn}>
                    <Text style={modernStyles.dateLabel}>
                      📅 Fechas Programadas
                    </Text>

                    <View style={{ marginBottom: 8 }}>
                      <Text
                        style={[
                          modernStyles.dateLabel,
                          { fontSize: 11, marginBottom: 2 },
                        ]}
                      >
                        Inicio:
                      </Text>
                      <Text style={modernStyles.dateValue}>
                        {formatDateDisplay(FechaInicio)}
                      </Text>
                    </View>

                    <View>
                      <Text
                        style={[
                          modernStyles.dateLabel,
                          { fontSize: 11, marginBottom: 2 },
                        ]}
                      >
                        Fin:
                      </Text>
                      <Text style={modernStyles.dateValue}>
                        {formatDateDisplay(FechaFin)}
                      </Text>
                    </View>
                  </View>

                  {/* Real Dates Column */}
                  <View style={modernStyles.dateColumn}>
                    <Text style={modernStyles.dateLabel}>✅ Fechas Reales</Text>

                    <View style={{ marginBottom: 8 }}>
                      <Text
                        style={[
                          modernStyles.dateLabel,
                          { fontSize: 11, marginBottom: 2 },
                        ]}
                      >
                        Inicio:
                      </Text>
                      <TouchableOpacity
                        onPress={() => {
                          setRenderComponent(
                            <ChangeDisplayFechaReal
                              onClose={onCloseOpenModal}
                              setData={setData}
                              data={data}
                              codigo={item.Codigo}
                              tipo={"Inicio"}
                            />
                          );
                          onCloseOpenModal();
                        }}
                      >
                        <Text
                          style={
                            InicioReal
                              ? modernStyles.dateValueReal
                              : modernStyles.editableDate
                          }
                        >
                          {InicioReal || "Tap para agregar"}
                        </Text>
                      </TouchableOpacity>
                    </View>

                    <View>
                      <Text
                        style={[
                          modernStyles.dateLabel,
                          { fontSize: 11, marginBottom: 2 },
                        ]}
                      >
                        Fin:
                      </Text>
                      <TouchableOpacity
                        onPress={() => {
                          setRenderComponent(
                            <ChangeDisplayFechaReal
                              onClose={onCloseOpenModal}
                              setData={setData}
                              data={data}
                              codigo={item.Codigo}
                              tipo={"Fin"}
                            />
                          );
                          onCloseOpenModal();
                        }}
                      >
                        <Text
                          style={
                            FinReal
                              ? modernStyles.dateValueReal
                              : modernStyles.editableDate
                          }
                        >
                          {FinReal || "Tap para agregar"}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>

                {/* Status Indicator */}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginTop: 12,
                    paddingTop: 12,
                    borderTopWidth: 1,
                    borderTopColor: "#f0f0f0",
                  }}
                >
                  <View
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor:
                        InicioReal && FinReal
                          ? "#4caf50"
                          : InicioReal
                          ? "#ff9800"
                          : "#f44336",
                      marginRight: 8,
                    }}
                  />
                  <Text
                    style={{
                      fontSize: 12,
                      color: "#666",
                      fontWeight: "500",
                    }}
                  >
                    {InicioReal && FinReal
                      ? "Completado"
                      : InicioReal
                      ? "En progreso"
                      : "Pendiente"}
                  </Text>
                </View>
              </View>
            );
          }}
          keyExtractor={(item, index) => index.toString()}
          scrollEnabled={false}
          showsVerticalScrollIndicator={false}
        />
      </View>
    );
  };
  // //Algorithm to render the bar status
  // const BarProgress = (percentage: any) => {
  //   const TotalSizeCompleted = windowWidth - 20;
  //   const percentajeNormalized = (percentage * TotalSizeCompleted) / 100;

  //   return (
  //     <View style={{ flexDirection: "row", height: 10, margin: 10 }}>
  //       <View
  //         style={{
  //           backgroundColor:
  //             AvanceEjecucion >= AvanceProyected ? "blue" : "red",
  //           width: percentajeNormalized ? percentajeNormalized : 0,
  //           borderRadius: 5,
  //         }}
  //       />
  //     </View>
  //   );
  // };

  // go to edit screen
  const goToEditAITScreen = () => {
    router.push({
      pathname: "/search/EditAIT",
      params: {
        idServiciosAIT: idServiciosAIT,
        AreaServicio: AreaServicio,
        Monto: Monto,
        HorasHombre: HorasHombre,
        HHModificado: HHModificado,
        MontoModificado: MontoModificado,
        NuevaFechaEstimada: NuevaFechaEstimada,
        FechaFin: FechaFin,
        FechaInicio: FechaInicio,
        createdAt: createdAt,
        ResponsableEmpresaUsuario: ResponsableEmpresaUsuario,
        ResponsableEmpresaUsuario2: ResponsableEmpresaUsuario2,
        ResponsableEmpresaUsuario3: ResponsableEmpresaUsuario3,
        ResponsableEmpresaContratista: ResponsableEmpresaContratista,
        ResponsableEmpresaContratista2: ResponsableEmpresaContratista2,
        ResponsableEmpresaContratista3: ResponsableEmpresaContratista3,
        AvanceEjecucion: AvanceEjecucion,
        emailPerfil: emailPerfil,
        photoServiceURL: photoServiceURL,
        NombreServicio: NombreServicio,
        EmpresaMinera: EmpresaMinera,
        NumeroAIT: NumeroAIT,
        NumeroCotizacion: NumeroCotizacion,
        TipoServicio: TipoServicio,
        companyName: companyName,
        Moneda: Moneda,
      },
    });
  };

  const graphScreen = () => {
    router.push({
      pathname: "/search/Graph",
      // params: { item: item },
    });
  };

  const updateDates = async () => {
    //updating events in ServiciosAIT to filter the deleted event
    const Ref = doc(db, "ServiciosAIT", idServiciosAIT);
    const docSnapshot: any = await getDoc(Ref);
    const activitiesData = docSnapshot.data().activitiesData;

    const updatedData = {
      activitiesData: data,
    };

    await updateDoc(Ref, updatedData);
    router.back();

    setUpdating((prev) => !prev);

    Toast.show({
      type: "success",
      position: "bottom",
      text1: "Se ha guardado correctamente",
    });
  };

  const finalizeService = async () => {
    Alert.alert(
      "Finalizar Servicio",
      "Estas Seguro que desear Finalizar la actividad?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Aceptar",
          onPress: async () => {
            Toast.show({
              type: "success",
              position: "bottom",
              text1: "Se ha Finalizado correctamente",
            });
          },
        },
      ],
      { cancelable: false }
    );
  };
  return (
    <View style={modernStyles.mainContainer}>
      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        contentContainerStyle={modernStyles.scrollContainer}
        showsVerticalScrollIndicator={true}
        bounces={true}
      >
        {/* Header Section with Edit Button and Profile */}
        <View style={modernStyles.headerContainer}>
          {(props.email === emailPerfil ||
            props.profile?.userType === "SuperUsuario") && (
            <TouchableOpacity
              style={modernStyles.editButton}
              onPress={() => goToEditAITScreen()}
            >
              <Ionicons name="pencil" size={20} color="white" />
            </TouchableOpacity>
          )}

          {photoServiceURLDecoded ? (
            <View style={modernStyles.profileImageContainer}>
              <ImageExpo
                source={{ uri: photoServiceURLDecoded }}
                style={modernStyles.profileImage}
                cachePolicy={"memory-disk"}
              />
            </View>
          ) : null}

          <Text style={modernStyles.titleText}>{NombreServicio}</Text>
        </View>

        {/* Main Content */}
        <View>
          {/* Información General Card */}
          <View style={modernStyles.infoCard}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <MaterialIcons
                name="business"
                size={20}
                color="#007AFF"
                style={modernStyles.iconStyle}
              />
              <Text style={modernStyles.infoCardTitle}>
                Información General
              </Text>
            </View>

            <View style={modernStyles.infoRow}>
              <Text style={modernStyles.infoLabel}>Empresa Minera:</Text>
              <Text style={modernStyles.infoValue}>{EmpresaMinera}</Text>
            </View>

            <View style={modernStyles.infoRow}>
              <Text style={modernStyles.infoLabel}>Orden de servicio:</Text>
              <Text style={modernStyles.infoValue}>{NumeroAIT}</Text>
            </View>

            <View style={modernStyles.infoRow}>
              <Text style={modernStyles.infoLabel}>Tipo de Servicio:</Text>
              <Text style={modernStyles.infoValue}>{TipoServicio}</Text>
            </View>
          </View>

          {/* Fechas Card */}
          <View style={modernStyles.infoCard}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <MaterialIcons
                name="schedule"
                size={20}
                color="#007AFF"
                style={modernStyles.iconStyle}
              />
              <Text style={modernStyles.infoCardTitle}>Cronograma</Text>
            </View>

            <View style={modernStyles.infoRow}>
              <Text style={modernStyles.infoLabel}>
                Fecha de Inicio Planeado:
              </Text>
              <Text style={modernStyles.infoValue}>
                {typeof FechaInicio === "string"
                  ? FechaInicio
                  : new Date(FechaInicio.seconds * 1000).toISOString()}
              </Text>
            </View>

            <View style={modernStyles.infoRow}>
              <Text style={modernStyles.infoLabel}>Fecha de Fin Planeado:</Text>
              <Text style={modernStyles.infoValue}>
                {typeof FechaFin === "string"
                  ? FechaFin
                  : new Date(FechaFin?.seconds * 1000).toLocaleString()}
              </Text>
            </View>
          </View>

          {/* Personal Cotizado Card */}
          <View style={modernStyles.infoCard}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <MaterialIcons
                name="people"
                size={20}
                color="#007AFF"
                style={modernStyles.iconStyle}
              />
              <Text style={modernStyles.infoCardTitle}>Personal Cotizado</Text>
            </View>

            <View style={modernStyles.infoRow}>
              <Text style={modernStyles.infoLabel}>Supervisor Mecánico:</Text>
              <Text style={modernStyles.infoValue}>{Supervisor}</Text>
            </View>

            <View style={modernStyles.infoRow}>
              <Text style={modernStyles.infoLabel}>
                Supervisor de Seguridad:
              </Text>
              <Text style={modernStyles.infoValue}>{SupervisorSeguridad}</Text>
            </View>

            <View style={modernStyles.infoRow}>
              <Text style={modernStyles.infoLabel}>Lider Mecánico:</Text>
              <Text style={modernStyles.infoValue}>{Lider}</Text>
            </View>

            <View style={modernStyles.infoRow}>
              <Text style={modernStyles.infoLabel}>Mecánico:</Text>
              <Text style={modernStyles.infoValue}>{Tecnicos}</Text>
            </View>

            <View style={modernStyles.infoRow}>
              <Text style={modernStyles.infoLabel}>Soldador:</Text>
              <Text style={modernStyles.infoValue}>{Soldador}</Text>
            </View>
          </View>

          {/* Horas Hombre Card */}
          <View style={modernStyles.infoCard}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <MaterialIcons
                name="access-time"
                size={20}
                color="#007AFF"
                style={modernStyles.iconStyle}
              />
              <Text style={modernStyles.infoCardTitle}>
                Horas Hombre Cotizado
              </Text>
            </View>

            <View style={modernStyles.infoRow}>
              <Text style={modernStyles.infoLabel}>Supervisor Mecánico:</Text>
              <Text style={modernStyles.infoValue}>
                {Supervisor * Number(HorasTotales)}
              </Text>
            </View>

            <View style={modernStyles.infoRow}>
              <Text style={modernStyles.infoLabel}>
                Supervisor de Seguridad:
              </Text>
              <Text style={modernStyles.infoValue}>
                {SupervisorSeguridad * Number(HorasTotales)}
              </Text>
            </View>

            <View style={modernStyles.infoRow}>
              <Text style={modernStyles.infoLabel}>Lider Mecánico:</Text>
              <Text style={modernStyles.infoValue}>
                {Lider * Number(HorasTotales)}
              </Text>
            </View>

            <View style={modernStyles.infoRow}>
              <Text style={modernStyles.infoLabel}>Mecánico:</Text>
              <Text style={modernStyles.infoValue}>
                {Tecnicos * Number(HorasTotales)}
              </Text>
            </View>

            <View style={modernStyles.infoRow}>
              <Text style={modernStyles.infoLabel}>Soldador:</Text>
              <Text style={modernStyles.infoValue}>
                {Soldador * Number(HorasTotales)}
              </Text>
            </View>
          </View>

          {/* Diagramas Section */}
          {TipoServicio === "Molino de Bolas" && (
            <View style={modernStyles.diagramContainer}>
              <Text style={modernStyles.chartTitle}>
                DIAGRAMA - MOLINO DE BOLAS
              </Text>
              <TouchableOpacity onPress={() => graphScreen()}>
                <ImageExpo
                  source={require("../../../assets/screens/mol2.jpg")}
                  style={modernStyles.diagramImage}
                  cachePolicy={"memory-disk"}
                />
              </TouchableOpacity>
            </View>
          )}

          {TipoServicio === "Molino SAG" && (
            <View style={modernStyles.diagramContainer}>
              <Text style={modernStyles.chartTitle}>DIAGRAMA - MOLINO SAG</Text>
              <ImageExpo
                source={require("../../../assets/screens/sag.png")}
                style={modernStyles.diagramImage}
                cachePolicy={"memory-disk"}
              />
            </View>
          )}

          {TipoServicio === "Chancadora Primaria" && (
            <View style={modernStyles.diagramContainer}>
              <Text style={modernStyles.chartTitle}>
                DIAGRAMA - CHANCADORA PRIMARIA
              </Text>
              <ImageExpo
                source={require("../../../assets/screens/dumpPocket.png")}
                style={modernStyles.diagramImage}
                cachePolicy={"memory-disk"}
              />
            </View>
          )}

          {/* Curva S Chart */}
          <View style={modernStyles.chartContainer}>
            <Text style={modernStyles.chartTitle}>CURVA S</Text>
            {ZingChartComponent ? (
              <ZingChartComponent data={curvaSChartConfig} />
            ) : (
              <Text style={modernStyles.loadingText}>Cargando gráfico...</Text>
            )}
          </View>

          {TipoServicio === "Parada de Planta" && (
            <View style={modernStyles.infoCard}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 16,
                }}
              >
                <MaterialIcons
                  name="assignment"
                  size={20}
                  color="#007AFF"
                  style={modernStyles.iconStyle}
                />
                <Text style={modernStyles.infoCardTitle}>
                  REPORTE DE ACTIVIDADES
                </Text>
              </View>

              {activitiesList(data)}

              <TouchableOpacity
                style={modernStyles.saveButton}
                onPress={() => updateDates()}
              >
                <Text style={modernStyles.saveButtonText}>
                  💾 Guardar las fechas reales
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Recursos Humanos Chart */}
          {events && (
            <View style={modernStyles.chartContainer}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 16,
                }}
              >
                <MaterialIcons
                  name="bar-chart"
                  size={20}
                  color="#007AFF"
                  style={modernStyles.iconStyle}
                />
                <Text style={modernStyles.chartTitle}>RECURSOS HUMANOS</Text>
              </View>
              <BarChartTareo data={JSON.parse(tareo)} />
            </View>
          )}

          {/* Responsables Section */}
          <View style={modernStyles.infoCard}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <MaterialIcons
                name="supervisor-account"
                size={20}
                color="#007AFF"
                style={modernStyles.iconStyle}
              />
              <Text style={modernStyles.infoCardTitle}>RESPONSABLES</Text>
            </View>

            <View style={{ marginBottom: 12 }}>
              <Text style={modernStyles.infoLabel}>Mantenimiento Minera:</Text>
              {ResposableList(UsuarioMantenimiento)}
            </View>

            <View>
              <Text style={modernStyles.infoLabel}>
                Supervisores Contratista:
              </Text>
              {ResposableList(ContratistaSupervisor)}
            </View>
          </View>
        </View>

        <Modal show={showModal} close={onCloseOpenModal}>
          {renderComponent}
        </Modal>
      </KeyboardAwareScrollView>
    </View>
  );
}

const mapStateToProps = (reducers: any) => {
  return {
    email: reducers.profile.email,
    profile: reducers.profile.profile,
  };
};

const MoreDetail = connect(mapStateToProps, {
  // saveActualEquipment,
  EquipmentListUpper,
})(MoreDetailScreenNoRedux);

// Modern styles for enhanced UI/UX
const modernStyles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: isMobile ? 16 : isTablet ? 32 : 24,
    paddingVertical: 20,
  },
  headerContainer: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  editButton: {
    position: "absolute",
    top: 15,
    right: 15,
    backgroundColor: "#007AFF",
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 10,
  },
  profileImageContainer: {
    alignSelf: "center",
    marginBottom: 16,
  },
  profileImage: {
    width: isMobile ? 120 : 150,
    height: isMobile ? 120 : 150,
    borderRadius: isMobile ? 60 : 75,
    borderWidth: 4,
    borderColor: "#007AFF",
  },
  titleText: {
    fontSize: isMobile ? 24 : 28,
    fontWeight: "bold",
    color: "#1a1a1a",
    textAlign: "center",
    marginBottom: 8,
  },
  infoCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  infoCardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#007AFF",
    marginBottom: 12,
  },
  infoCardTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
    flexWrap: "wrap",
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
    flex: isMobile ? 1 : 0.4,
    marginRight: 8,
  },
  infoValue: {
    fontSize: 14,
    color: "#1a1a1a",
    flex: isMobile ? 1 : 0.6,
    fontWeight: "400",
  },
  chartContainer: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  chartTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1a1a1a",
    textAlign: "center",
    marginBottom: 16,
  },
  diagramContainer: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  diagramImage: {
    width: isMobile ? windowWidth - 80 : 350,
    height: isMobile ? windowWidth - 80 : 350,
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#007AFF",
    marginTop: 8,
    marginBottom: 12,
    paddingLeft: 4,
  },
  loadingText: {
    textAlign: "center",
    color: "#666",
    fontStyle: "italic",
    padding: 20,
  },
  iconStyle: {
    marginRight: 8,
  },
  // Estilos para Activities List
  activityCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: "#007AFF",
  },
  activityHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  activityCode: {
    backgroundColor: "#007AFF",
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 8,
    minWidth: 40,
    textAlign: "center",
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
    flex: 1,
  },
  dateContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  dateColumn: {
    flex: 1,
    marginHorizontal: 4,
  },
  dateLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: "#666",
    marginBottom: 4,
  },
  dateValue: {
    fontSize: 13,
    color: "#1a1a1a",
    backgroundColor: "#f8f9fa",
    padding: 8,
    borderRadius: 6,
    textAlign: "center",
  },
  dateValueReal: {
    fontSize: 13,
    color: "#007AFF",
    backgroundColor: "#e3f2fd",
    padding: 8,
    borderRadius: 6,
    textAlign: "center",
    fontWeight: "500",
  },
  editableDate: {
    fontSize: 13,
    color: "#ff6b35",
    backgroundColor: "#fff3e0",
    padding: 8,
    borderRadius: 6,
    textAlign: "center",
    fontWeight: "500",
    borderWidth: 1,
    borderColor: "#ff6b35",
    borderStyle: "dashed",
  },
  saveButton: {
    backgroundColor: "#007AFF",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignSelf: "center",
    marginTop: 16,
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
});

function parseCustomDate(dateStr: any) {
  if (!dateStr) return null;

  // Si es un Timestamp de Firebase
  if (typeof dateStr === "object" && dateStr.seconds) {
    return new Date(dateStr.seconds * 1000);
  }

  // Si es un número (timestamp en ms)
  if (typeof dateStr === "number") {
    // Si es muy grande, probablemente es timestamp en ms
    if (dateStr > 1000000000000) return new Date(dateStr);
    // Si es menor, podría ser serial Excel (no se soporta aquí)
    return null;
  }

  // Forzar a string
  const str = String(dateStr).trim();

  // Intenta con segundos y AM/PM
  let regex =
    /^(\d{1,2})\/(\d{1,2})\/(\d{2,4})[ T](\d{1,2}):(\d{2})(?::(\d{2}))?\s?(AM|PM)?$/i;
  let match = str.match(regex);
  if (match) {
    let [, day, month, year, hour, minute, second = "0", ampm] = match;
    if (year.length === 2) year = "20" + year;
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
  const fallback = new Date(str);
  return isNaN(fallback.getTime()) ? null : fallback;
}

export default MoreDetail;
