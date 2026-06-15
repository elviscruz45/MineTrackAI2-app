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
import { MaterialIcon } from "@/components/MaterialIcon";
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
  setDoc,
} from "firebase/firestore";
import { db } from "@/firebaseConfig";
import Toast from "react-native-toast-message";
import OfflineFormsStatus from "@/components/OfflineFormsStatus/OfflineFormsStatus";
// import {
//   LineChart,
//   BarChart,
//   PieChart,
//   ProgressChart,
//   ContributionGraph,
//   StackedBarChart,
// } from "react-native-chart-kit";
import * as Progress from "react-native-progress";
import {
  buildGlobalSCurveWithProjection,
  parseActivityDate,
} from "@/utils/calculateAvance";

// Funciones específicas para manejo offline
const OFFLINE_FORMS_QUEUE_KEY = "offline_forms_queue";

interface OfflineFormOperation {
  id: string;
  type: "setDoc" | "updateDoc";
  collection: string;
  docId: string;
  data: any;
  timestamp: number;
  formType: "ActivitiesUpdate" | "GeneralUpdate";
}

// Función para verificar conectividad - Solo para web/PWA
const checkOnlineStatus = async (): Promise<boolean> => {
  try {
    if (Platform.OS === "web") {
      // En PWA web, usar navigator.onLine
      return navigator.onLine;
    } else {
      // En mobile, importar dinámicamente expo-network
      try {
        const Network = require("expo-network");
        const networkState = await Network.getNetworkStateAsync();
        return !!(networkState.isConnected && networkState.isInternetReachable);
      } catch (error) {
        // Si expo-network falla, asumir online en mobile
        console.warn("expo-network not available, assuming online");
        return true;
      }
    }
  } catch (error) {
    console.error("Error checking network status:", error);
    // En caso de error, asumir online para no bloquear la app
    return true;
  }
};

// Función para guardar operación en localStorage (PWA) o AsyncStorage (mobile)
const saveToOfflineQueue = async (
  operation: OfflineFormOperation
): Promise<void> => {
  try {
    let existingQueue: OfflineFormOperation[] = [];

    if (Platform.OS === "web") {
      // Usar localStorage para PWA
      const stored = localStorage.getItem(OFFLINE_FORMS_QUEUE_KEY);
      existingQueue = stored ? JSON.parse(stored) : [];
    } else {
      // Usar AsyncStorage para mobile
      const AsyncStorage =
        require("@react-native-async-storage/async-storage").default;
      const stored = await AsyncStorage.getItem(OFFLINE_FORMS_QUEUE_KEY);
      existingQueue = stored ? JSON.parse(stored) : [];
    }

    existingQueue.push(operation);

    if (Platform.OS === "web") {
      localStorage.setItem(
        OFFLINE_FORMS_QUEUE_KEY,
        JSON.stringify(existingQueue)
      );
    } else {
      const AsyncStorage =
        require("@react-native-async-storage/async-storage").default;
      await AsyncStorage.setItem(
        OFFLINE_FORMS_QUEUE_KEY,
        JSON.stringify(existingQueue)
      );
    }

    console.log(
      `📱 Operación ${operation.formType} guardada offline:`,
      operation.id
    );
  } catch (error) {
    console.error("Error guardando en cola offline:", error);
  }
};

// Función para procesar cola offline cuando hay conexión
const processOfflineFormsQueue = async (): Promise<void> => {
  try {
    let queue: OfflineFormOperation[] = [];

    if (Platform.OS === "web") {
      const stored = localStorage.getItem(OFFLINE_FORMS_QUEUE_KEY);
      queue = stored ? JSON.parse(stored) : [];
    } else {
      const AsyncStorage =
        require("@react-native-async-storage/async-storage").default;
      const stored = await AsyncStorage.getItem(OFFLINE_FORMS_QUEUE_KEY);
      queue = stored ? JSON.parse(stored) : [];
    }

    if (queue.length === 0) return;

    console.log(`🔄 Procesando ${queue.length} operaciones offline...`);

    const processed: string[] = [];
    const failed: OfflineFormOperation[] = [];

    for (const operation of queue) {
      try {
        if (operation.type === "setDoc") {
          await setDoc(
            doc(db, operation.collection, operation.docId),
            operation.data
          );
        } else if (operation.type === "updateDoc") {
          const docRef = doc(db, operation.collection, operation.docId);
          await updateDoc(docRef, operation.data);
        }

        processed.push(operation.id);
        console.log(`✅ ${operation.formType} procesado:`, operation.id);
      } catch (error) {
        console.error(`❌ Error procesando ${operation.formType}:`, error);
        failed.push(operation);
      }
    }

    // Actualizar cola solo con operaciones fallidas
    if (Platform.OS === "web") {
      if (failed.length > 0) {
        localStorage.setItem(OFFLINE_FORMS_QUEUE_KEY, JSON.stringify(failed));
      } else {
        localStorage.removeItem(OFFLINE_FORMS_QUEUE_KEY);
      }
    } else {
      const AsyncStorage =
        require("@react-native-async-storage/async-storage").default;
      if (failed.length > 0) {
        await AsyncStorage.setItem(
          OFFLINE_FORMS_QUEUE_KEY,
          JSON.stringify(failed)
        );
      } else {
        await AsyncStorage.removeItem(OFFLINE_FORMS_QUEUE_KEY);
      }
    }

    if (processed.length > 0) {
      Toast.show({
        type: "success",
        text1: "Datos Sincronizados",
        text2: `${processed.length} operaciones enviadas al servidor`,
        position: "top",
        visibilityTime: 4000,
      });
    }
  } catch (error) {
    console.error("Error procesando cola de operaciones:", error);
  }
};

// Función principal para manejar operaciones Firebase con offline
const handleFirebaseOperationWithOffline = async (
  operation: () => Promise<void>,
  operationData: Omit<OfflineFormOperation, "timestamp">
): Promise<boolean> => {
  const isOnline = await checkOnlineStatus();

  if (isOnline) {
    try {
      // Intentar operación online
      await operation();
      console.log(`🌐 ${operationData.formType} enviado online`);
      return true;
    } catch (error) {
      console.error(`❌ Error en operación online, guardando offline:`, error);
      // Si falla online, guardar offline
      await saveToOfflineQueue({
        ...operationData,
        timestamp: Date.now(),
      });
      return false;
    }
  } else {
    // Sin conexión, guardar offline directamente
    console.log(`📱 Sin conexión, guardando ${operationData.formType} offline`);
    await saveToOfflineQueue({
      ...operationData,
      timestamp: Date.now(),
    });
    return false;
  }
};

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

  // Hook para verificar y procesar cola offline al cargar componente
  useEffect(() => {
    const checkAndProcessQueue = async () => {
      const isOnline = await checkOnlineStatus();
      if (isOnline) {
        await processOfflineFormsQueue();
      }
    };

    checkAndProcessQueue();

    // Verificar cada 30 segundos si hay conexión para procesar cola
    const interval = setInterval(checkAndProcessQueue, 30000);

    return () => clearInterval(interval);
  }, []);

  console.log("ELVIS DATA", data);

  // Hook para escuchar eventos de reconexión en web
  useEffect(() => {
    if (Platform.OS === "web") {
      const handleOnline = async () => {
        console.log("🌐 Reconectado a internet - procesando cola...");
        await processOfflineFormsQueue();
      };

      window.addEventListener("online", handleOnline);

      return () => {
        window.removeEventListener("online", handleOnline);
      };
    }
  }, []);

  // Función para forzar sincronización manual
  const handleForceSync = async () => {
    const isOnline = await checkOnlineStatus();
    if (isOnline) {
      await processOfflineFormsQueue();
    } else {
      Toast.show({
        type: "warning",
        text1: "Sin Conexión",
        text2: "No se puede sincronizar sin conexión a internet",
        position: "top",
      });
    }
  };

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

  // Función para generar configuración de ZingChart basada en Curva S
  const generateCurvaSChartConfig = () => {
    const listaActividades = JSON.parse(activitiesData || "[]");

    let fechaInicioProyecto: Date | null = parseActivityDate(
      FechaInicioISO || FechaInicio
    );
    let fechaFinProyecto: Date | null = parseActivityDate(
      FechaFinISO || FechaFin
    );

    listaActividades.forEach((actividad: any) => {
      const inicioAct = parseActivityDate(actividad.FechaInicio);
      const finAct = parseActivityDate(actividad.FechaFin);

      if (inicioAct) {
        if (!fechaInicioProyecto || inicioAct < fechaInicioProyecto) {
          fechaInicioProyecto = inicioAct;
        }
      }

      if (finAct) {
        if (!fechaFinProyecto || finAct > fechaFinProyecto) {
          fechaFinProyecto = finAct;
        }
      }
    });

    if (!fechaInicioProyecto || !fechaFinProyecto) {
      return null;
    }

    const totalHorasPlanificadas =
      (fechaFinProyecto.getTime() - fechaInicioProyecto.getTime()) / 3600000;

    const {
      planned: axe_y1,
      real: axe_y2,
      projected: axe_y3,
      fechasEjeX,
      fechaProyeccionFin,
    } = buildGlobalSCurveWithProjection(
      listaActividades,
      fechaInicioProyecto,
      totalHorasPlanificadas
    );

    return {
      type: "line",
      backgroundColor: "white",
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
          maxChars: 16,
        },
        maxItems: 10,
        itemsOverlap: true,
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
      crosshairX: {
        lineColor: "#555",
        plotLabel: {
          padding: "10px",
          backgroundColor: "white",
          borderRadius: "5px",
          fontWeight: "bold",
          fontSize: 12,
          shadow: false,
          borderColor: "#eee",
          borderWidth: "1px",
          headerText: "",
          headerFontColor: "#2A3B76",
          headerFontWeight: "bold",
          headerFontSize: 11,
        },
        scaleLabel: {
          text: "%l",
          backgroundColor: "#2A3B76",
          fontColor: "white",
          borderRadius: "5px",
          padding: "4px 8px",
          fontSize: 11,
        },
      },
      crosshairY: {
        lineColor: "#555",
        plotLabel: {
          padding: "10px",
          backgroundColor: "white",
          borderRadius: "5px",
          fontWeight: "bold",
          fontSize: 12,
          shadow: false,
          borderColor: "#eee",
          borderWidth: "1px",
        },
        scaleLabel: {
          backgroundColor: "#666",
          borderRadius: "5px",
        },
      },
      tooltip: {
        visible: true,
      },
      plot: {
        aspect: "spline",
        tooltip: {
          visible: false,
          text: "%l<br>%t: %v%",
          backgroundColor: "rgba(0,0,0,0.8)",
          fontColor: "white",
          fontSize: 12,
          padding: 8,
          borderRadius: 4,
        },
        marker: {
          visible: true,
          size: 4,
          alpha: 1,
        },
        hoverState: {
          visible: true,
        },
      },
      series: [
        {
          text: "PROGRAMADO",
          values: axe_y1,
          lineColor: "#2196F3",
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
          aspect: "line",
          lineColor: "#F44336",
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
        {
          text: "PROYECTADO",
          values: axe_y3,
          lineColor: "#FF9800",
          lineWidth: 2,
          lineStyle: "dashed",
          marker: {
            visible: false,
          },
          legendMarker: {
            backgroundColor: "#FF9800",
          },
        },
      ],
      plotarea: {
        backgroundColor: "white",
        margin: "60px 60px 80px 80px",
      },
      fechaProyeccionFin,
    };
  };

  const curvaSChartConfig = generateCurvaSChartConfig();

  //retrieving serviceAIT list data from firebase
  useEffect(() => {
    const listaActividades = JSON.parse(activitiesData || "[]");

    console.log("listaActividades", listaActividades);

    setData(listaActividades);
  }, []);

  const userType = props.profile?.userType;
  ///the algoritm to retrieve the image source to render the icon
  const indexareaList = areaLists.findIndex((item) => item.value === area);
  const imageSource =
    areaLists[indexareaList]?.image ||
    require("../../../assets/equipmentplant/ImageIcons/confipetrolLogos.png");

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

  const activitiesList = () => {
    console.log("pppppppppp-----", data);

    console.log("pppppppppp", data);

    console.log("ELVIS", data);

    return (
      <FlatList
        data={data}
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
        scrollEnabled={true}
        showsVerticalScrollIndicator={false}
      />
    );
  };

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
    try {
      setUpdating(true); // Mostrar loading

      // Verificar conectividad antes de proceder
      const isOnline = await checkOnlineStatus();
      console.log("🌐 Estado de conexión:", isOnline ? "Online" : "Offline");

      const updatedData = {
        activitiesData: data,
      };

      // Operación updateDoc con manejo offline
      const updateDocOperation = async () => {
        const Ref = doc(db, "ServiciosAIT", idServiciosAIT);
        await updateDoc(Ref, updatedData);
      };

      const isOnlineOperation = await handleFirebaseOperationWithOffline(
        updateDocOperation,
        {
          id: `updateDoc-ServiciosAIT-activities-${idServiciosAIT}-${Date.now()}`,
          type: "updateDoc",
          collection: "ServiciosAIT",
          docId: idServiciosAIT,
          data: updatedData,
          formType: "ActivitiesUpdate",
        }
      );

      router.back();

      // Mostrar mensaje apropiado según el estado de conectividad
      if (isOnlineOperation) {
        Toast.show({
          type: "success",
          position: "bottom",
          text1: "Se ha guardado correctamente",
          text2: "Datos sincronizados con el servidor",
        });
      } else {
        Toast.show({
          type: "info",
          position: "bottom",
          text1: "Datos guardados offline",
          text2: "Se sincronizarán automáticamente cuando tengas conexión",
        });
      }
    } catch (error) {
      console.error("Error al actualizar fechas:", error);
      Toast.show({
        type: "error",
        position: "bottom",
        text1: "Error al guardar",
        text2: "Intenta nuevamente",
      });
    } finally {
      setUpdating(false); // Ocultar loading
    }
  };

  return (
    <View style={modernStyles.mainContainer}>
      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        contentContainerStyle={modernStyles.scrollContainer}
        showsVerticalScrollIndicator={true}
        bounces={true}
      >
        {/* Indicador de estado offline */}
        <OfflineFormsStatus onForceSync={handleForceSync} />

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
              <MaterialIcon
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
              <MaterialIcon
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
              <MaterialIcon
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
              <MaterialIcon
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
            <Text style={modernStyles.chartSubtitle}>
              Avance programado vs. real — proyección de fin estimado
              {curvaSChartConfig?.fechaProyeccionFin
                ? ` · Fin proyectado: ${curvaSChartConfig.fechaProyeccionFin.toLocaleDateString("es-ES")}`
                : ""}
            </Text>
            {ZingChartComponent && curvaSChartConfig ? (
              <ZingChartComponent data={curvaSChartConfig} />
            ) : (
              <Text style={modernStyles.loadingText}>Cargando gráfico...</Text>
            )}
          </View>

          <View style={modernStyles.infoCard}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <MaterialIcon
                name="assignment"
                size={20}
                color="#007AFF"
                style={modernStyles.iconStyle}
              />
              <Text style={modernStyles.infoCardTitle}>
                REPORTE DE ACTIVIDADES
              </Text>
            </View>

            <ScrollView
            // style={modernStyles.activitiesScrollContainer}
            // contentContainerStyle={modernStyles.activitiesScrollContent}
            // showsVerticalScrollIndicator={true}
            // nestedScrollEnabled={true}
            // bounces={true}
            >
              {activitiesList()}
            </ScrollView>
          </View>

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
                <MaterialIcon
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
              <MaterialIcon
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

      {/* Floating save button */}
      <TouchableOpacity
        style={[
          modernStyles.floatingButton,
          updateing && { backgroundColor: "#999" },
        ]}
        onPress={() => updateDates()}
        disabled={updateing}
      >
        <Text style={modernStyles.floatingButtonText}>
          {updateing ? "⏳" : "💾"}
        </Text>
        <Text style={modernStyles.floatingButtonLabel}>
          {updateing ? "Guardando..." : "Guardar fechas"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const mapStateToProps = (reducers: any) => {
  return {
    email: reducers.profile.email,
    profile: reducers.profile.profile,
    // servicesData: reducers.home.servicesData,
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
  chartSubtitle: {
    fontSize: 12,
    color: "#6c757d",
    textAlign: "center",
    marginTop: -8,
    marginBottom: 12,
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
  activitiesScrollContainer: {
    maxHeight: isMobile ? windowHeight * 0.4 : windowHeight * 0.6, // 40% de altura en móvil, 60% en tablet
    borderRadius: 8,
    backgroundColor: "#f8f9fa",
    marginBottom: 16,
  },
  activitiesScrollContent: {
    paddingVertical: 8,
    paddingHorizontal: 4,
    flexGrow: 1,
  },
  floatingButton: {
    position: "absolute",
    bottom: 28,
    right: 20,
    backgroundColor: "#007AFF",
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  floatingButtonText: {
    fontSize: 18,
  },
  floatingButtonLabel: {
    color: "white",
    fontSize: 14,
    fontWeight: "700",
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
  const fallback = new Date(str);
  return isNaN(fallback.getTime()) ? null : fallback;
}

export default MoreDetail;
