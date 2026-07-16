import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import { Image as ImageExpo } from "expo-image";
import { Ionicon as Ionicons } from "@/components/icons/AppIcon";
import { MaterialIcon } from "@/components/MaterialIcon";
import { connect } from "react-redux";
import { EquipmentListUpper } from "../../../redux/actions/home";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useRouter, useLocalSearchParams } from "expo-router";
import BarChartTareo from "./moreDetail.Chart";
import ChangeDisplayFechaReal from "./components/FechaReal/ChangeDisplayFechaReal";
import { Modal } from "@/components/Modal/Modal";
import {
  updateServicioAit,
  createServicioAit,
  updateServicioActivities,
  subscribeServiceActivitiesByServicio,
} from "@/lib/db/serviciosAit";
import Toast from "react-native-toast-message";
import OfflineFormsStatus from "@/components/OfflineFormsStatus/OfflineFormsStatus";
import {
  buildGlobalSCurveWithProjection,
  calculateAvanceFromActivities,
  parseActivityDate,
} from "@/utils/calculateAvance";

const BRAND = "#2A3B76";
const PAGE_BG = "#f1f5f9";
const CARD_BG = "#ffffff";
const BORDER = "#e2e8f0";
const MUTED = "#64748b";

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
        if (operation.collection === "ServiciosAIT") {
          if (operation.type === "setDoc") {
            await createServicioAit(operation.data);
          } else {
            await updateServicioAit(operation.docId, operation.data);
          }
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

function formatDateDisplay(dateInput: any) {
  if (!dateInput) return "No definido";

  const parsed = parseActivityDate(dateInput);
  if (parsed) {
    return parsed.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  if (typeof dateInput === "string") return dateInput;
  return "No definido";
}

function createMoreDetailStyles(windowWidth: number) {
  const isCompact = windowWidth < 640;
  const isDesktop = windowWidth >= 1024;
  const contentMaxWidth = Math.min(windowWidth, 1100);
  const horizontalPad = isCompact ? 16 : 24;
  const diagramSize = isCompact
    ? Math.min(windowWidth - 64, 320)
    : Math.min(400, windowWidth * 0.35);

  return StyleSheet.create({
    mainContainer: {
      flex: 1,
      backgroundColor: PAGE_BG,
    },
    scrollContainer: {
      flexGrow: 1,
      paddingBottom: 100,
    },
    page: {
      width: "100%",
      maxWidth: contentMaxWidth,
      alignSelf: "center",
      paddingHorizontal: horizontalPad,
      paddingTop: isCompact ? 12 : 20,
      gap: isCompact ? 12 : 16,
    },
    heroCard: {
      backgroundColor: CARD_BG,
      borderRadius: 16,
      padding: isCompact ? 16 : 24,
      borderWidth: 1,
      borderColor: BORDER,
      shadowColor: "#0f172a",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.06,
      shadowRadius: 16,
      elevation: 3,
      alignItems: "center",
      position: "relative",
    },
    editButton: {
      position: "absolute",
      top: 16,
      right: 16,
      backgroundColor: BRAND,
      borderRadius: 12,
      width: 40,
      height: 40,
      justifyContent: "center",
      alignItems: "center",
      zIndex: 10,
      shadowColor: BRAND,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 4,
    },
    profileImage: {
      width: isCompact ? 88 : 108,
      height: isCompact ? 88 : 108,
      borderRadius: isCompact ? 44 : 54,
      borderWidth: 3,
      borderColor: "#c7d2fe",
      marginBottom: 12,
    },
    titleText: {
      fontSize: isCompact ? 20 : 26,
      fontWeight: "800",
      color: "#1e293b",
      textAlign: "center",
      letterSpacing: -0.3,
      marginBottom: 12,
      paddingHorizontal: 40,
    },
    badgeRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      justifyContent: "center",
      marginBottom: 14,
    },
    badge: {
      backgroundColor: "#eef2ff",
      borderRadius: 20,
      paddingHorizontal: 12,
      paddingVertical: 5,
      borderWidth: 1,
      borderColor: "#c7d2fe",
    },
    badgeText: {
      fontSize: 12,
      fontWeight: "600",
      color: BRAND,
    },
    kpiRow: {
      flexDirection: isCompact ? "column" : "row",
      gap: 10,
      width: "100%",
    },
    kpiCard: {
      flex: isCompact ? undefined : 1,
      backgroundColor: "#f8fafc",
      borderRadius: 12,
      padding: 12,
      borderWidth: 1,
      borderColor: BORDER,
      alignItems: "center",
    },
    kpiLabel: {
      fontSize: 11,
      fontWeight: "600",
      color: MUTED,
      textTransform: "uppercase",
      letterSpacing: 0.4,
      marginBottom: 4,
    },
    kpiValue: {
      fontSize: isCompact ? 16 : 18,
      fontWeight: "800",
      color: BRAND,
    },
    cardsGrid: {
      flexDirection: isDesktop ? "row" : "column",
      flexWrap: "wrap",
      gap: isCompact ? 12 : 16,
    },
    cardHalf: {
      flex: isDesktop ? 1 : undefined,
      minWidth: isDesktop ? 280 : undefined,
    },
    infoCard: {
      backgroundColor: CARD_BG,
      borderRadius: 14,
      padding: isCompact ? 14 : 18,
      borderWidth: 1,
      borderColor: BORDER,
      shadowColor: "#0f172a",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.04,
      shadowRadius: 8,
      elevation: 2,
    },
    cardHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: 14,
      paddingBottom: 10,
      borderBottomWidth: 1,
      borderBottomColor: BORDER,
    },
    infoCardTitle: {
      fontSize: isCompact ? 15 : 16,
      fontWeight: "700",
      color: BRAND,
      flex: 1,
    },
    infoRow: {
      flexDirection: isCompact ? "column" : "row",
      justifyContent: "space-between",
      alignItems: isCompact ? "flex-start" : "center",
      marginBottom: 10,
      gap: isCompact ? 2 : 8,
    },
    infoLabel: {
      fontSize: 13,
      fontWeight: "500",
      color: MUTED,
      flex: isCompact ? undefined : 0.45,
    },
    infoValue: {
      fontSize: 14,
      color: "#1e293b",
      fontWeight: "600",
      flex: isCompact ? undefined : 0.55,
      textAlign: isCompact ? "left" : "right",
    },
    hhTable: {
      borderWidth: 1,
      borderColor: BORDER,
      borderRadius: 10,
      overflow: "hidden",
    },
    hhTableHeader: {
      flexDirection: "row",
      backgroundColor: "#f1f5f9",
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderBottomWidth: 1,
      borderBottomColor: BORDER,
    },
    hhTableRow: {
      flexDirection: "row",
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderBottomWidth: 1,
      borderBottomColor: BORDER,
    },
    hhTableRowLast: {
      borderBottomWidth: 0,
    },
    hhColRole: {
      flex: 1.2,
      fontSize: 13,
      color: MUTED,
      fontWeight: "500",
    },
    hhColQty: {
      flex: 0.6,
      fontSize: 13,
      color: "#1e293b",
      fontWeight: "600",
      textAlign: "center",
    },
    hhColTotal: {
      flex: 0.8,
      fontSize: 13,
      color: BRAND,
      fontWeight: "700",
      textAlign: "right",
    },
    hhHeaderText: {
      fontSize: 11,
      fontWeight: "700",
      color: MUTED,
      textTransform: "uppercase",
      letterSpacing: 0.4,
    },
    chartContainer: {
      backgroundColor: CARD_BG,
      borderRadius: 14,
      padding: isCompact ? 14 : 20,
      borderWidth: 1,
      borderColor: BORDER,
      shadowColor: "#0f172a",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.04,
      shadowRadius: 8,
      elevation: 2,
    },
    chartTitle: {
      fontSize: isCompact ? 16 : 18,
      fontWeight: "700",
      color: "#1e293b",
      textAlign: "center",
    },
    chartSubtitle: {
      fontSize: 12,
      color: MUTED,
      textAlign: "center",
      marginTop: 6,
      marginBottom: 12,
      lineHeight: 18,
    },
    diagramContainer: {
      backgroundColor: CARD_BG,
      borderRadius: 14,
      padding: 16,
      borderWidth: 1,
      borderColor: BORDER,
      alignItems: "center",
    },
    diagramImage: {
      width: diagramSize,
      height: diagramSize,
      borderRadius: 10,
    },
    loadingText: {
      textAlign: "center",
      color: MUTED,
      fontStyle: "italic",
      padding: 24,
    },
    activityCard: {
      backgroundColor: "#f8fafc",
      borderRadius: 12,
      padding: 14,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: BORDER,
      borderLeftWidth: 3,
      borderLeftColor: BRAND,
    },
    activityHeader: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 10,
      marginBottom: 12,
    },
    activityCode: {
      backgroundColor: BRAND,
      color: "white",
      fontSize: 11,
      fontWeight: "700",
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
      overflow: "hidden",
    },
    activityTitle: {
      fontSize: 14,
      fontWeight: "600",
      color: "#1e293b",
      flex: 1,
      lineHeight: 20,
    },
    dateContainer: {
      flexDirection: isCompact ? "column" : "row",
      gap: 10,
    },
    dateColumn: {
      flex: 1,
      backgroundColor: CARD_BG,
      borderRadius: 10,
      padding: 10,
      borderWidth: 1,
      borderColor: BORDER,
    },
    dateColumnTitle: {
      fontSize: 11,
      fontWeight: "700",
      color: BRAND,
      textTransform: "uppercase",
      letterSpacing: 0.4,
      marginBottom: 10,
    },
    dateFieldLabel: {
      fontSize: 11,
      color: MUTED,
      marginBottom: 4,
    },
    dateValue: {
      fontSize: 13,
      color: "#1e293b",
      backgroundColor: "#f1f5f9",
      padding: 8,
      borderRadius: 8,
      marginBottom: 8,
    },
    dateValueReal: {
      fontSize: 13,
      color: "#0369a1",
      backgroundColor: "#e0f2fe",
      padding: 8,
      borderRadius: 8,
      fontWeight: "600",
      marginBottom: 8,
    },
    editableDate: {
      fontSize: 13,
      color: "#c2410c",
      backgroundColor: "#fff7ed",
      padding: 8,
      borderRadius: 8,
      fontWeight: "600",
      borderWidth: 1,
      borderColor: "#fdba74",
      borderStyle: "dashed",
      marginBottom: 8,
      textAlign: "center",
    },
    statusRow: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 10,
      paddingTop: 10,
      borderTopWidth: 1,
      borderTopColor: BORDER,
      gap: 8,
    },
    statusDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    statusText: {
      fontSize: 12,
      color: MUTED,
      fontWeight: "600",
    },
    responsableItem: {
      fontSize: 14,
      color: "#334155",
      paddingVertical: 4,
      paddingLeft: 8,
      borderLeftWidth: 2,
      borderLeftColor: "#c7d2fe",
      marginBottom: 4,
    },
    floatingButton: {
      position: "absolute",
      bottom: isCompact ? 20 : 28,
      right: isCompact ? 16 : 24,
      backgroundColor: BRAND,
      borderRadius: 14,
      paddingVertical: 14,
      paddingHorizontal: 20,
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      shadowColor: BRAND,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.35,
      shadowRadius: 10,
      elevation: 8,
    },
    floatingButtonDisabled: {
      backgroundColor: "#94a3b8",
    },
    floatingButtonLabel: {
      color: "white",
      fontSize: 14,
      fontWeight: "700",
    },
    progressBarTrack: {
      height: 6,
      backgroundColor: "#e2e8f0",
      borderRadius: 3,
      overflow: "hidden",
      width: "100%",
      marginTop: 4,
    },
    progressBarFill: {
      height: "100%",
      backgroundColor: BRAND,
      borderRadius: 3,
    },
  });
}

function MoreDetailScreenNoRedux(props: any) {
  const { width: windowWidth } = useWindowDimensions();
  const ui = useMemo(() => createMoreDetailStyles(windowWidth), [windowWidth]);

  const [data, setData] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [renderComponent, setRenderComponent] = useState<any>("");
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

  const router = useRouter();
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
  const curvaSChartConfig = useMemo(() => {
    const listaActividades = data;

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
  }, [data, FechaInicioISO, FechaInicio, FechaFinISO, FechaFin]);

  useEffect(() => {
    if (!idServiciosAIT) {
      const listaActividades = JSON.parse(activitiesData || "[]");
      setData(listaActividades);
      return;
    }

    const listaFromParams = JSON.parse(activitiesData || "[]");
    if (listaFromParams.length > 0) {
      setData(listaFromParams);
    }

    const unsubscribe = subscribeServiceActivitiesByServicio(
      String(idServiciosAIT),
      (activities) => setData(activities),
      (error) => console.error("Error en realtime activities:", error)
    );

    return unsubscribe;
  }, [idServiciosAIT, activitiesData]);

  const photoServiceURLDecoded = photoServiceURL?.replace(/abcdefg/g, "%2F") ?? "";
  const avance = useMemo(
    () => calculateAvanceFromActivities(data, AvanceEjecucion),
    [data, AvanceEjecucion]
  );

  const formattedMonto = Monto
    ? new Intl.NumberFormat("es-PE", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(Number(Monto))
    : "—";

  const UsuarioMantenimiento = ResponsableEmpresaUsuario3?.split(",") ?? [];
  const ContratistaSupervisor = ResponsableEmpresaContratista3?.split(",") ?? [];

  const staffRoles = [
    { label: "Supervisor Mecánico", qty: Supervisor },
    { label: "Supervisor Seguridad", qty: SupervisorSeguridad },
    { label: "Líder Mecánico", qty: Lider },
    { label: "Mecánico", qty: Tecnicos },
    { label: "Soldador", qty: Soldador },
  ];

  const renderResponsables = (array: string[]) =>
    array?.filter(Boolean).map((item, i) => (
      <Text key={`${item}-${i}`} style={ui.responsableItem}>
        {item.trim()}
      </Text>
    ));

  const openDateModal = (codigo: string, tipo: "Inicio" | "Fin") => {
    setRenderComponent(
      <ChangeDisplayFechaReal
        onClose={onCloseOpenModal}
        setData={setData}
        data={data}
        codigo={codigo}
        tipo={tipo}
      />
    );
    onCloseOpenModal();
  };

  const renderActivityCard = (item: any, index: number) => {
    const InicioReal = item?.RealFechaInicio
      ? formatDateDisplay(item.RealFechaInicio)
      : "";
    const FinReal = item?.RealFechaFin
      ? formatDateDisplay(item.RealFechaFin)
      : "";

    const status =
      InicioReal && FinReal
        ? { color: "#22c55e", label: "Completado" }
        : InicioReal
        ? { color: "#f59e0b", label: "En progreso" }
        : { color: "#ef4444", label: "Pendiente" };

    return (
      <View key={`${item.Codigo}-${index}`} style={ui.activityCard}>
        <View style={ui.activityHeader}>
          <Text style={ui.activityCode}>{item.Codigo}</Text>
          <Text style={ui.activityTitle}>{item.NombreServicio}</Text>
        </View>

        <View style={ui.dateContainer}>
          <View style={ui.dateColumn}>
            <Text style={ui.dateColumnTitle}>Programadas</Text>
            <Text style={ui.dateFieldLabel}>Inicio</Text>
            <Text style={ui.dateValue}>
              {formatDateDisplay(item.FechaInicio)}
            </Text>
            <Text style={ui.dateFieldLabel}>Fin</Text>
            <Text style={ui.dateValue}>
              {formatDateDisplay(item.FechaFin)}
            </Text>
          </View>

          <View style={ui.dateColumn}>
            <Text style={ui.dateColumnTitle}>Reales</Text>
            <Text style={ui.dateFieldLabel}>Inicio</Text>
            <TouchableOpacity onPress={() => openDateModal(item.Codigo, "Inicio")}>
              <Text style={InicioReal ? ui.dateValueReal : ui.editableDate}>
                {InicioReal || "Tap para agregar"}
              </Text>
            </TouchableOpacity>
            <Text style={ui.dateFieldLabel}>Fin</Text>
            <TouchableOpacity onPress={() => openDateModal(item.Codigo, "Fin")}>
              <Text style={FinReal ? ui.dateValueReal : ui.editableDate}>
                {FinReal || "Tap para agregar"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={ui.statusRow}>
          <View style={[ui.statusDot, { backgroundColor: status.color }]} />
          <Text style={ui.statusText}>{status.label}</Text>
        </View>
      </View>
    );
  };

  const SectionCard = ({
    icon,
    title,
    children,
    style,
  }: {
    icon: string;
    title: string;
    children: React.ReactNode;
    style?: object;
  }) => (
    <View style={[ui.infoCard, style]}>
      <View style={ui.cardHeader}>
        <MaterialIcon name={icon} size={20} color={BRAND} />
        <Text style={ui.infoCardTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );

  const InfoRow = ({ label, value }: { label: string; value: any }) => (
    <View style={ui.infoRow}>
      <Text style={ui.infoLabel}>{label}</Text>
      <Text style={ui.infoValue}>{value ?? "—"}</Text>
    </View>
  );

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
        await updateServicioActivities(String(idServiciosAIT), data);
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
    <View style={ui.mainContainer}>
      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        contentContainerStyle={ui.scrollContainer}
        showsVerticalScrollIndicator={false}
        bounces
      >
        <View style={ui.page}>
          <OfflineFormsStatus onForceSync={handleForceSync} />

          {/* Hero */}
          <View style={ui.heroCard}>
            {(props.email === emailPerfil ||
              props.profile?.userType === "SuperUsuario") && (
              <TouchableOpacity
                style={ui.editButton}
                onPress={() => goToEditAITScreen()}
              >
                <Ionicons name="pencil" size={18} color="white" />
              </TouchableOpacity>
            )}

            {photoServiceURLDecoded ? (
              <ImageExpo
                source={{ uri: photoServiceURLDecoded }}
                style={ui.profileImage}
                cachePolicy="memory-disk"
              />
            ) : null}

            <Text style={ui.titleText}>{NombreServicio}</Text>

            <View style={ui.badgeRow}>
              {TipoServicio ? (
                <View style={ui.badge}>
                  <Text style={ui.badgeText}>{TipoServicio}</Text>
                </View>
              ) : null}
              {EmpresaMinera ? (
                <View style={ui.badge}>
                  <Text style={ui.badgeText}>{EmpresaMinera}</Text>
                </View>
              ) : null}
              {NumeroAIT ? (
                <View style={ui.badge}>
                  <Text style={ui.badgeText}>OC {NumeroAIT}</Text>
                </View>
              ) : null}
            </View>

            <View style={ui.kpiRow}>
              <View style={ui.kpiCard}>
                <Text style={ui.kpiLabel}>Avance</Text>
                <Text style={ui.kpiValue}>{avance}%</Text>
                <View style={ui.progressBarTrack}>
                  <View
                    style={[
                      ui.progressBarFill,
                      { width: `${Math.min(avance, 100)}%` },
                    ]}
                  />
                </View>
              </View>
              <View style={ui.kpiCard}>
                <Text style={ui.kpiLabel}>Monto ({Moneda || "—"})</Text>
                <Text style={ui.kpiValue}>{formattedMonto}</Text>
              </View>
              <View style={ui.kpiCard}>
                <Text style={ui.kpiLabel}>Horas planificadas</Text>
                <Text style={ui.kpiValue}>
                  {HorasTotales ? Number(HorasTotales).toFixed(0) : "—"}
                </Text>
              </View>
            </View>
          </View>

          {/* Info cards grid */}
          <View style={ui.cardsGrid}>
            <SectionCard icon="business" title="Información general" style={ui.cardHalf}>
              <InfoRow label="Empresa minera" value={EmpresaMinera} />
              <InfoRow label="Orden de servicio" value={NumeroAIT} />
              <InfoRow label="Tipo de servicio" value={TipoServicio} />
              <InfoRow label="Área" value={AreaServicio} />
              <InfoRow label="Cotización" value={NumeroCotizacion} />
            </SectionCard>

            <SectionCard icon="schedule" title="Cronograma" style={ui.cardHalf}>
              <InfoRow
                label="Inicio planeado"
                value={formatDateDisplay(FechaInicioISO || FechaInicio)}
              />
              <InfoRow
                label="Fin planeado"
                value={formatDateDisplay(FechaFinISO || FechaFin)}
              />
            </SectionCard>
          </View>

          <View style={ui.cardsGrid}>
            <SectionCard icon="people" title="Personal cotizado" style={ui.cardHalf}>
              {staffRoles.map((role) => (
                <InfoRow key={role.label} label={role.label} value={role.qty} />
              ))}
            </SectionCard>

            <SectionCard icon="access-time" title="Horas hombre cotizadas" style={ui.cardHalf}>
              <View style={ui.hhTable}>
                <View style={ui.hhTableHeader}>
                  <Text style={[ui.hhColRole, ui.hhHeaderText]}>Rol</Text>
                  <Text style={[ui.hhColQty, ui.hhHeaderText]}>Cant.</Text>
                  <Text style={[ui.hhColTotal, ui.hhHeaderText]}>Total HH</Text>
                </View>
                {staffRoles.map((role, i) => (
                  <View
                    key={role.label}
                    style={[
                      ui.hhTableRow,
                      i === staffRoles.length - 1 && ui.hhTableRowLast,
                    ]}
                  >
                    <Text style={ui.hhColRole}>{role.label}</Text>
                    <Text style={ui.hhColQty}>{role.qty ?? 0}</Text>
                    <Text style={ui.hhColTotal}>
                      {(Number(role.qty) * Number(HorasTotales)).toFixed(0)}
                    </Text>
                  </View>
                ))}
              </View>
            </SectionCard>
          </View>

          {/* Diagrams */}
          {TipoServicio === "Molino de Bolas" && (
            <View style={ui.diagramContainer}>
              <Text style={ui.chartTitle}>Diagrama — Molino de bolas</Text>
              <TouchableOpacity onPress={() => graphScreen()}>
                <ImageExpo
                  source={require("../../../assets/screens/mol2.jpg")}
                  style={ui.diagramImage}
                  cachePolicy="memory-disk"
                />
              </TouchableOpacity>
            </View>
          )}

          {TipoServicio === "Molino SAG" && (
            <View style={ui.diagramContainer}>
              <Text style={ui.chartTitle}>Diagrama — Molino SAG</Text>
              <ImageExpo
                source={require("../../../assets/screens/sag.png")}
                style={ui.diagramImage}
                cachePolicy="memory-disk"
              />
            </View>
          )}

          {TipoServicio === "Chancadora Primaria" && (
            <View style={ui.diagramContainer}>
              <Text style={ui.chartTitle}>Diagrama — Chancadora primaria</Text>
              <ImageExpo
                source={require("../../../assets/screens/dumpPocket.png")}
                style={ui.diagramImage}
                cachePolicy="memory-disk"
              />
            </View>
          )}

          {/* Curva S */}
          <View style={ui.chartContainer}>
            <Text style={ui.chartTitle}>Curva S</Text>
            <Text style={ui.chartSubtitle}>
              Avance programado vs. real — proyección de fin estimado
              {curvaSChartConfig?.fechaProyeccionFin
                ? ` · Fin proyectado: ${curvaSChartConfig.fechaProyeccionFin.toLocaleDateString("es-ES")}`
                : ""}
            </Text>
            {ZingChartComponent && curvaSChartConfig ? (
              <ZingChartComponent data={curvaSChartConfig} />
            ) : (
              <Text style={ui.loadingText}>Cargando gráfico…</Text>
            )}
          </View>

          {/* Activities */}
          <SectionCard icon="assignment" title="Reporte de actividades">
            {data?.length ? (
              data.map(renderActivityCard)
            ) : (
              <Text style={ui.loadingText}>No hay actividades registradas</Text>
            )}
          </SectionCard>

          {/* HR Chart */}
          {events && tareo ? (
            <View style={ui.chartContainer}>
              <View style={ui.cardHeader}>
                <MaterialIcon name="bar-chart" size={20} color={BRAND} />
                <Text style={ui.infoCardTitle}>Recursos humanos</Text>
              </View>
              <BarChartTareo data={JSON.parse(tareo)} />
            </View>
          ) : null}

          {/* Responsables */}
          <SectionCard icon="supervisor-account" title="Responsables">
            <Text style={[ui.infoLabel, { marginBottom: 8 }]}>
              Mantenimiento minera
            </Text>
            {renderResponsables(UsuarioMantenimiento)}
            <Text style={[ui.infoLabel, { marginTop: 12, marginBottom: 8 }]}>
              Supervisores contratista
            </Text>
            {renderResponsables(ContratistaSupervisor)}
          </SectionCard>
        </View>

        <Modal show={showModal} close={onCloseOpenModal}>
          {renderComponent}
        </Modal>
      </KeyboardAwareScrollView>

      <TouchableOpacity
        style={[ui.floatingButton, updateing && ui.floatingButtonDisabled]}
        onPress={() => updateDates()}
        disabled={updateing}
      >
        <MaterialIcon name="save" size={20} color="white" />
        <Text style={ui.floatingButtonLabel}>
          {updateing ? "Guardando…" : "Guardar fechas"}
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

export default MoreDetail;
