import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import { MaterialIcon } from "@/components/MaterialIcon";
import styles from "./Item.styles";
import { connect } from "react-redux";
import { saveActualServiceAIT } from "../../../redux/actions/post";
import { EquipmentListUpper } from "../../../redux/actions/home";
import { areaLists } from "../../../utils/areaList";
import CircularProgress from "./Item.circularProgress";
import GanttHistorial from "./components/Gantt/Gantt";
import { LoadingSpinner } from "../../../components/LoadingSpinner";
import Toast from "react-native-toast-message";
import { useLocalSearchParams, useRouter } from "expo-router";
import { createEnhancedDocxReport } from "../../../utils/createDocxReport";
import { subscribeServicioAitById } from "@/lib/db/serviciosAit";
import {
  parseActivityDate,
  calculateAvanceFromActivities,
} from "../../../utils/calculateAvance";

const BRAND = "#2A3B76";
const PAGE_BG = "#f1f5f9";
const CARD_BG = "#ffffff";
const BORDER = "#e2e8f0";
const MUTED = "#64748b";

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

function formatDateForNav(dateInput: any): string {
  const parsed = parseActivityDate(dateInput);
  if (!parsed) return "";

  const day = String(parsed.getDate()).padStart(2, "0");
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const year = parsed.getFullYear();
  let hours = parsed.getHours();
  const minutes = String(parsed.getMinutes()).padStart(2, "0");
  const seconds = String(parsed.getSeconds()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12;
  return `${day}/${month}/${year} ${String(hours).padStart(2, "0")}:${minutes}:${seconds} ${ampm}`;
}

function getDateMs(dateInput: any): number {
  return parseActivityDate(dateInput)?.getTime() ?? 0;
}

function createItemStyles(windowWidth: number) {
  const isCompact = windowWidth < 640;
  const isDesktop = windowWidth >= 1024;
  const contentMaxWidth = Math.min(windowWidth, 960);
  const horizontalPad = isCompact ? 16 : 24;

  return StyleSheet.create({
    mainContainer: {
      flex: 1,
      backgroundColor: PAGE_BG,
    },
    scrollContent: {
      paddingVertical: isCompact ? 12 : 20,
      paddingBottom: 40,
    },
    page: {
      width: "100%",
      maxWidth: contentMaxWidth,
      alignSelf: "center",
      paddingHorizontal: horizontalPad,
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
    },
    heroLayout: {
      flexDirection: isCompact ? "column" : "row",
      alignItems: isCompact ? "center" : "flex-start",
      gap: isCompact ? 16 : 24,
    },
    progressWrap: {
      alignItems: "center",
      flexShrink: 0,
    },
    infoColumn: {
      flex: 1,
      minWidth: 0,
      width: isCompact ? "100%" : undefined,
    },
    serviceName: {
      fontSize: isCompact ? 20 : 26,
      fontWeight: "800",
      color: "#1e293b",
      letterSpacing: -0.3,
      marginBottom: 10,
      textAlign: isCompact ? "center" : "left",
    },
    badgeRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      marginBottom: 14,
      justifyContent: isCompact ? "center" : "flex-start",
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
    tagLink: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#e0f2fe",
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 8,
      marginBottom: 14,
      alignSelf: isCompact ? "center" : "flex-start",
      borderWidth: 1,
      borderColor: "#bae6fd",
    },
    tagLinkText: {
      color: "#0369a1",
      fontWeight: "600",
      fontSize: 13,
    },
    progressSection: {
      backgroundColor: "#f8fafc",
      borderRadius: 12,
      padding: 14,
      marginBottom: 14,
      borderWidth: 1,
      borderColor: BORDER,
    },
    progressHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 8,
    },
    progressLabel: {
      fontSize: 13,
      fontWeight: "600",
      color: MUTED,
    },
    progressBarTrack: {
      height: 8,
      backgroundColor: "#e2e8f0",
      borderRadius: 4,
      overflow: "hidden",
    },
    progressBarFill: {
      height: "100%",
      backgroundColor: BRAND,
      borderRadius: 4,
    },
    progressValue: {
      fontSize: 15,
      fontWeight: "800",
      color: BRAND,
    },
    metaGrid: {
      flexDirection: isDesktop ? "row" : "column",
      gap: 10,
      marginBottom: 14,
    },
    metaItem: {
      flex: isDesktop ? 1 : undefined,
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#f8fafc",
      borderRadius: 10,
      padding: 12,
      borderWidth: 1,
      borderColor: BORDER,
      gap: 8,
    },
    metaLabel: {
      fontSize: 12,
      color: MUTED,
      fontWeight: "500",
    },
    metaValue: {
      fontSize: 14,
      color: "#1e293b",
      fontWeight: "600",
      flex: 1,
    },
    datesRow: {
      flexDirection: isCompact ? "column" : "row",
      gap: 10,
    },
    dateCard: {
      flex: isCompact ? undefined : 1,
      backgroundColor: "#f8fafc",
      borderRadius: 12,
      padding: 12,
      borderWidth: 1,
      borderColor: BORDER,
      borderLeftWidth: 3,
    },
    dateCardStart: {
      borderLeftColor: "#22c55e",
    },
    dateCardEnd: {
      borderLeftColor: "#ef4444",
    },
    dateLabel: {
      fontSize: 11,
      fontWeight: "600",
      color: MUTED,
      textTransform: "uppercase",
      letterSpacing: 0.5,
      marginBottom: 4,
    },
    dateValue: {
      fontSize: 14,
      fontWeight: "600",
      color: "#1e293b",
    },
    actionsCard: {
      backgroundColor: CARD_BG,
      borderRadius: 16,
      padding: isCompact ? 16 : 20,
      borderWidth: 1,
      borderColor: BORDER,
      shadowColor: "#0f172a",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.04,
      shadowRadius: 8,
      elevation: 2,
    },
    sectionTitle: {
      fontSize: isCompact ? 15 : 17,
      fontWeight: "700",
      color: "#1e293b",
      marginBottom: 14,
      textAlign: isCompact ? "center" : "left",
    },
    actionsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
    },
    actionButton: {
      flex: isCompact ? undefined : 1,
      minWidth: isCompact ? "100%" : 140,
      backgroundColor: "#f8fafc",
      borderRadius: 12,
      paddingVertical: 16,
      paddingHorizontal: 12,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: BORDER,
      gap: 8,
    },
    actionButtonPrimary: {
      backgroundColor: "#eef2ff",
      borderColor: "#c7d2fe",
    },
    actionButtonLabel: {
      fontSize: 13,
      fontWeight: "600",
      color: "#334155",
      textAlign: "center",
    },
    actionButtonLabelPrimary: {
      color: BRAND,
    },
    historyCard: {
      backgroundColor: CARD_BG,
      borderRadius: 16,
      padding: isCompact ? 16 : 20,
      borderWidth: 1,
      borderColor: BORDER,
      shadowColor: "#0f172a",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.04,
      shadowRadius: 8,
      elevation: 2,
    },
    historyHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 16,
      justifyContent: isCompact ? "center" : "flex-start",
      gap: 8,
    },
    historyTitle: {
      fontSize: isCompact ? 17 : 19,
      fontWeight: "700",
      color: "#1e293b",
    },
    daysLeftChip: {
      alignSelf: isCompact ? "center" : "flex-start",
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: "#fef3c7",
      borderRadius: 20,
      paddingHorizontal: 12,
      paddingVertical: 6,
      marginBottom: 14,
    },
    daysLeftText: {
      fontSize: 12,
      fontWeight: "600",
      color: "#475569",
    },
  });
}

function ItemScreenNotRedux(props: any) {
  const router = useRouter();
  const { width: windowWidth } = useWindowDimensions();
  const ui = useMemo(() => createItemStyles(windowWidth), [windowWidth]);

  const [loadingReport, setLoadingReport] = useState(false);
  const { Item }: any = useLocalSearchParams();
  const [post, setPost] = useState<any[] | null>(null);
  const [serviceInfo, setServiceInfo] = useState<any>();

  const area = serviceInfo?.AreaServicio;
  const indexareaList = areaLists?.findIndex((item) => item.value === area);
  const imageSource =
    areaLists[indexareaList]?.image ||
    require("../../../assets/equipmentplant/poderosa.png");

  const formattedAmount = serviceInfo?.Monto
    ? new Intl.NumberFormat("es-PE", {
        style: "decimal",
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(Number(serviceInfo.Monto))
    : "—";

  const avance = useMemo(
    () =>
      calculateAvanceFromActivities(
        serviceInfo?.activitiesData,
        serviceInfo?.AvanceEjecucion
      ),
    [serviceInfo?.activitiesData, serviceInfo?.AvanceEjecucion]
  );

  const daysLeft = useMemo(() => {
    const endDate = parseActivityDate(serviceInfo?.FechaFin);
    if (!endDate) return null;
    const hoursLeft = (endDate.getTime() - Date.now()) / 3600000;
    return Math.round(hoursLeft);
  }, [serviceInfo?.FechaFin]);

  useEffect(() => {
    if (!Item) return;

    const applyService = (service: any) => {
      if (!service) return;

      const lista: any[] = [];
      service?.events?.forEach((event: any) => {
        lista.push({
          ...event,
          time: "01 Ene",
          title: event.titulo,
          description: event.comentarios,
          lineColor: "skyblue",
          icon: require("../../../assets/pictures/empresa.png"),
          imageUrl: event.fotoUsuarioPerfil,
          idDocAITFirestoreDB: Item,
        });
      });

      setPost(lista);
      setServiceInfo(service);
      props.saveActualServiceAIT(service);
    };

    const fromRedux = props.servicesData?.find(
      (item: any) => item.idServiciosAIT === Item
    );
    if (fromRedux) {
      applyService(fromRedux);
    }

    const unsubscribe = subscribeServicioAitById(
      String(Item),
      (service) => applyService(service),
      (error) => console.error("Error en realtime Item:", error)
    );

    return unsubscribe;
  }, [Item]);

  const Detalles = (data: any) => {
    const tareosEvents = data?.events?.map((item: any) => ({
      supervisores: item.supervisores,
      soldador: item.soldador,
      liderTecnico: item.liderTecnico,
      ayudante: item.ayudante,
      HSE: item.HSE,
      tecnico: item.tecnico,
    }));

    const fechaInicioDate = parseActivityDate(data?.FechaInicio);
    const fechaFinDate = parseActivityDate(data?.FechaFin);
    const FechaInicio = formatDateForNav(data?.FechaInicio);
    const FechaFin = formatDateForNav(data?.FechaFin);

    let HorasTotales = 0;
    if (fechaInicioDate && fechaFinDate) {
      HorasTotales =
        (fechaFinDate.getTime() - fechaInicioDate.getTime()) / 3600000;
    }

    const AvanceEventos = data?.events?.map((item: any) => {
      const FechaAvanceDate = parseActivityDate(item.createdAt);
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
        FechaFin,
        FechaInicio,
        FechaFinISO: getDateMs(data?.FechaFin),
        FechaInicioISO: getDateMs(data?.FechaInicio),
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
        HorasTotales,
        AvanceEventos: JSON.stringify(AvanceEventos),
      },
    });
  };

  const comentPost = (data: any) => {
    router.push({
      pathname: "/search/CommentSearch",
      params: {
        idDocFirestoreDB: data.idDocFirestoreDB,
        AITidServicios: data.idDocAITFirestoreDB,
      },
    });
  };

  const goToDocs = (item: any) => {
    router.push({
      pathname: "/search/file",
      params: { NombreServicio: item.NombreServicio },
    });
  };

  const createReport = async (postData: any, info: any) => {
    setLoadingReport(true);
    try {
      const blob = await createEnhancedDocxReport(postData, info);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Reporte_${info.NombreServicio}.docx`;
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

  if (!serviceInfo || !post || loadingReport) {
    return <LoadingSpinner />;
  }

  const daysLeftLabel =
    daysLeft === null
      ? null
      : daysLeft > 0
      ? `${daysLeft} h restantes`
      : daysLeft === 0
      ? "Finaliza hoy"
      : `Vencido hace ${Math.abs(daysLeft)} h`;

  return (
    <View style={ui.mainContainer}>
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={ui.scrollContent}
      >
        <View style={ui.page}>
          {/* Hero */}
          <View style={ui.heroCard}>
            <View style={ui.heroLayout}>
              <View style={ui.progressWrap}>
                <CircularProgress
                  imageSourceDefault={imageSource}
                  imageStyle={styles.roundImage}
                  avance={avance}
                  idait={serviceInfo.idServiciosAIT}
                  image={serviceInfo.photoServiceURL}
                  titulo={serviceInfo.NombreServicio}
                  emailProfile={props.email}
                  emailPost={serviceInfo.emailPerfil}
                />
              </View>

              <View style={ui.infoColumn}>
                <Text style={ui.serviceName}>{serviceInfo.NombreServicio}</Text>

                <View style={ui.badgeRow}>
                  {serviceInfo.Codigo ? (
                    <View style={ui.badge}>
                      <Text style={ui.badgeText}>{serviceInfo.Codigo}</Text>
                    </View>
                  ) : null}
                  {serviceInfo.TipoServicio ? (
                    <View style={ui.badge}>
                      <Text style={ui.badgeText}>{serviceInfo.TipoServicio}</Text>
                    </View>
                  ) : null}
                  {serviceInfo.EmpresaMinera ? (
                    <View style={ui.badge}>
                      <Text style={ui.badgeText}>{serviceInfo.EmpresaMinera}</Text>
                    </View>
                  ) : null}
                </View>

                {daysLeftLabel ? (
                  <View style={ui.daysLeftChip}>
                    <MaterialIcon name="schedule" size={14} color="#92400e" />
                    <Text style={ui.daysLeftText}>{daysLeftLabel}</Text>
                  </View>
                ) : null}

                {serviceInfo?.TagEquipo ? (
                  <TouchableOpacity
                    onPress={() =>
                      router.push({
                        pathname: "/operations/equipment/[tagCode]",
                        params: { tagCode: serviceInfo.TagEquipo },
                      })
                    }
                    style={ui.tagLink}
                  >
                    <MaterialIcon
                      name="history"
                      size={16}
                      color="#0369a1"
                      style={{ marginRight: 6 }}
                    />
                    <Text style={ui.tagLinkText}>
                      Historial del equipo · {serviceInfo.TagEquipo}
                    </Text>
                  </TouchableOpacity>
                ) : null}

                <View style={ui.progressSection}>
                  <View style={ui.progressHeader}>
                    <Text style={ui.progressLabel}>Avance de ejecución</Text>
                    <Text style={ui.progressValue}>{avance}%</Text>
                  </View>
                  <View style={ui.progressBarTrack}>
                    <View
                      style={[
                        ui.progressBarFill,
                        { width: `${Math.min(avance, 100)}%` },
                      ]}
                    />
                  </View>
                </View>

                <View style={ui.metaGrid}>
                  <View style={ui.metaItem}>
                    <MaterialIcon name="confirmation-number" size={18} color={BRAND} />
                    <View style={{ flex: 1 }}>
                      <Text style={ui.metaLabel}>N° Servicio</Text>
                      <Text style={ui.metaValue}>{serviceInfo.NumeroAIT || "—"}</Text>
                    </View>
                  </View>
                  <View style={ui.metaItem}>
                    <MaterialIcon name="payments" size={18} color={BRAND} />
                    <View style={{ flex: 1 }}>
                      <Text style={ui.metaLabel}>
                        Monto ({serviceInfo.Moneda || "—"})
                      </Text>
                      <Text style={ui.metaValue}>{formattedAmount}</Text>
                    </View>
                  </View>
                  {serviceInfo.HorasHombre ? (
                    <View style={ui.metaItem}>
                      <MaterialIcon name="engineering" size={18} color={BRAND} />
                      <View style={{ flex: 1 }}>
                        <Text style={ui.metaLabel}>Horas hombre</Text>
                        <Text style={ui.metaValue}>{serviceInfo.HorasHombre}</Text>
                      </View>
                    </View>
                  ) : null}
                </View>

                <View style={ui.datesRow}>
                  <View style={[ui.dateCard, ui.dateCardStart]}>
                    <Text style={ui.dateLabel}>Inicio programado</Text>
                    <Text style={ui.dateValue}>
                      {formatDateDisplay(serviceInfo?.FechaInicio)}
                    </Text>
                  </View>
                  <View style={[ui.dateCard, ui.dateCardEnd]}>
                    <Text style={ui.dateLabel}>Fin programado</Text>
                    <Text style={ui.dateValue}>
                      {formatDateDisplay(serviceInfo?.FechaFin)}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Actions */}
          <View style={ui.actionsCard}>
            <Text style={ui.sectionTitle}>Acciones rápidas</Text>
            <View style={ui.actionsGrid}>
              <TouchableOpacity
                style={[ui.actionButton, ui.actionButtonPrimary]}
                onPress={() => Detalles(serviceInfo)}
              >
                <MaterialIcon name="info" size={24} color={BRAND} />
                <Text style={[ui.actionButtonLabel, ui.actionButtonLabelPrimary]}>
                  Más información
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={ui.actionButton}
                onPress={() => goToDocs(serviceInfo)}
              >
                <MaterialIcon name="folder" size={24} color="#475569" />
                <Text style={ui.actionButtonLabel}>Documentos</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={ui.actionButton}
                onPress={() => createReport(post, serviceInfo)}
              >
                <MaterialIcon name="description" size={24} color="#475569" />
                <Text style={ui.actionButtonLabel}>Generar reporte</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* History */}
          <View style={ui.historyCard}>
            <View style={ui.historyHeader}>
              <MaterialIcon name="history" size={22} color={BRAND} />
              <Text style={ui.historyTitle}>Historial de eventos</Text>
            </View>
            <GanttHistorial datas={post} comentPost={comentPost} />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const mapStateToProps = (reducers: any) => ({
  servicesData: reducers.home.servicesData,
  email: reducers.profile.email,
});

const Item = connect(mapStateToProps, {
  saveActualServiceAIT,
  EquipmentListUpper,
})(ItemScreenNotRedux);

export default Item;
