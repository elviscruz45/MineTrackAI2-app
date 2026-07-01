import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { connect } from "react-redux";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image as ImageExpo } from "expo-image";
import {
  getEquipmentDetailTimeline,
  getEquipmentManagementSummary,
  type EquipmentDetailEntry,
  type EquipmentManagementSummary,
} from "@/lib/db/equipmentTimeline";
import { getEquipmentTagByCode } from "@/lib/db/equipmentTags";
import { saveActualServiceAIT } from "@/redux/actions/post";
import {
  getTagAreaColor,
  getTagEquipoImage,
  getTagEquipoNombre,
  findTagEquipoByKey,
  buildStandaloneEquipmentContext,
} from "@/utils/tagEquipoList";
import type { EquipmentTagRow } from "@/lib/db/types";

type FilterKey = "all" | "parada" | "mantenimiento" | "planta" | "contratista";

const ESTADO_EQUIPO: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  operativo: { label: "Operativo", color: "#166534", bg: "#dcfce7" },
  limitado: { label: "Limitado", color: "#b45309", bg: "#fef3c7" },
  parado: { label: "Parado", color: "#b91c1c", bg: "#fee2e2" },
  en_mantenimiento: {
    label: "En mantenimiento",
    color: "#1d4ed8",
    bg: "#dbeafe",
  },
};

function formatDate(iso: string | null | undefined) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function EquipmentManagementRaw({
  saveActualServiceAIT,
}: {
  saveActualServiceAIT: (item: unknown) => void;
}) {
  const { tagCode } = useLocalSearchParams<{ tagCode: string }>();
  const router = useRouter();
  const code = String(tagCode || "");

  const [tag, setTag] = useState<EquipmentTagRow | null>(null);
  const [timeline, setTimeline] = useState<EquipmentDetailEntry[]>([]);
  const [summary, setSummary] = useState<EquipmentManagementSummary | null>(
    null,
  );
  const [filter, setFilter] = useState<FilterKey>("all");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const tagItem = findTagEquipoByKey(code);
  const area = tag?.area ?? tagItem?.area ?? "";
  const nombre =
    tag?.nombre ?? (tagItem ? getTagEquipoNombre(tagItem) : "Equipo");

  const loadData = useCallback(async () => {
    if (!code) return;
    const personnelFilter =
      filter === "planta" || filter === "contratista" ? filter : undefined;
    const sourceFilter =
      filter === "parada" || filter === "mantenimiento"
        ? filter
        : personnelFilter
          ? "mantenimiento"
          : undefined;

    const [tagRow, summaryData, timelineData] = await Promise.all([
      getEquipmentTagByCode(code),
      getEquipmentManagementSummary(code),
      getEquipmentDetailTimeline(code, {
        source: sourceFilter,
        personnelType: personnelFilter,
      }),
    ]);

    setTag(tagRow);
    setSummary(summaryData);
    setTimeline(timelineData);
  }, [code, filter]);

  useEffect(() => {
    setLoading(true);
    loadData()
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadData();
    } finally {
      setRefreshing(false);
    }
  };

  const estadoConfig = summary?.ultimoEstado
    ? (ESTADO_EQUIPO[summary.ultimoEstado] ?? {
        label: summary.ultimoEstado,
        color: "#475569",
        bg: "#f1f5f9",
      })
    : null;

  const filteredTimeline = timeline;

  const handleReportEvent = () => {
    const item = tagItem ?? {
      key: code,
      nombre,
      area,
      value: `${nombre} — ${code}`,
    };
    saveActualServiceAIT(buildStandaloneEquipmentContext(item));
    router.push({ pathname: "/post", params: { equipmentEvent: code } });
  };

  const handleNewMaintenance = () => {
    router.push({
      pathname: "/operations/new",
      params: { tagCode: code },
    });
  };

  const openEntry = (entry: EquipmentDetailEntry) => {
    if (entry.source === "parada") {
      router.push({
        pathname: "/operations/equipment/event/[eventId]",
        params: { eventId: entry.record_id, tagCode: code },
      });
    }
  };

  const sourceColor = (source: string) =>
    source === "parada" ? "#1565c0" : "#2e7d32";

  const kpiCards = summary
    ? [
        {
          label: "Intervenciones",
          value: summary.totalIntervenciones,
          accent: "#2A3B76",
        },
        {
          label: "Últimos 30 días",
          value: summary.actividad30d,
          accent: "#7c3aed",
        },
        { label: "Paradas", value: summary.totalParadas, accent: "#1565c0" },
        {
          label: "Mantenimiento",
          value: summary.totalMantenimiento,
          accent: "#2e7d32",
        },
        {
          label: "Horas acum.",
          value: summary.horasAcumuladas,
          accent: "#0f766e",
        },
        { label: "Preventivo", value: summary.preventivo, accent: "#059669" },
        { label: "Correctivo", value: summary.correctivo, accent: "#dc2626" },
        {
          label: "Días sin actividad",
          value: summary.diasDesdeUltima ?? "—",
          accent:
            summary.diasDesdeUltima != null && summary.diasDesdeUltima > 14
              ? "#dc2626"
              : "#64748b",
        },
      ]
    : [];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f1f5f9" }}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View
          style={{
            padding: 16,
            maxWidth: 960,
            alignSelf: "center",
            width: "100%",
          }}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ marginBottom: 12 }}
          >
            <Text style={{ color: "#2A3B76", fontWeight: "600" }}>
              ← Volver a equipos
            </Text>
          </TouchableOpacity>

          {/* Header */}
          <View
            style={{
              backgroundColor: "#fff",
              borderRadius: 16,
              padding: 16,
              marginBottom: 16,
              borderWidth: 1,
              borderColor: "#e2e8f0",
              flexDirection: "row",
              gap: 16,
            }}
          >
            <ImageExpo
              source={getTagEquipoImage(code)}
              style={{ width: 88, height: 88, borderRadius: 12 }}
              contentFit="cover"
            />
            <View style={{ flex: 1 }}>
              <Text
                style={{ fontSize: 22, fontWeight: "800", color: "#1e293b" }}
              >
                {code}
              </Text>
              <Text style={{ fontSize: 15, color: "#475569", marginTop: 4 }}>
                {nombre}
              </Text>
              {area ? (
                <View
                  style={{
                    alignSelf: "flex-start",
                    marginTop: 8,
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderRadius: 6,
                    backgroundColor: `${getTagAreaColor(area)}18`,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "700",
                      color: getTagAreaColor(area),
                    }}
                  >
                    {area}
                  </Text>
                </View>
              ) : null}
              {estadoConfig ? (
                <View
                  style={{
                    alignSelf: "flex-start",
                    marginTop: 8,
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderRadius: 6,
                    backgroundColor: estadoConfig.bg,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "700",
                      color: estadoConfig.color,
                    }}
                  >
                    Estado: {estadoConfig.label}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>

          {/* Acciones rápidas */}
          {/* <View style={{ flexDirection: "row", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
            <TouchableOpacity
              onPress={handleReportEvent}
              style={{
                flex: 1,
                minWidth: 140,
                backgroundColor: "#2A3B76",
                borderRadius: 10,
                padding: 14,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "700" }}>+ Reportar evento</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleNewMaintenance}
              style={{
                flex: 1,
                minWidth: 140,
                backgroundColor: "#fff",
                borderRadius: 10,
                padding: 14,
                alignItems: "center",
                borderWidth: 1,
                borderColor: "#2A3B76",
              }}
            >
              <Text style={{ color: "#2A3B76", fontWeight: "700" }}>+ Mantenimiento</Text>
            </TouchableOpacity>
          </View> */}

          {/* Resumen planificador */}
          {summary && (
            <View
              style={{
                backgroundColor: "#fff",
                borderRadius: 12,
                padding: 14,
                marginBottom: 16,
                borderWidth: 1,
                borderColor: "#e2e8f0",
              }}
            >
              <Text
                style={{
                  fontWeight: "700",
                  fontSize: 14,
                  color: "#1e293b",
                  marginBottom: 10,
                }}
              >
                Resumen para planificación
              </Text>
              <View style={{ gap: 6 }}>
                <Text style={{ fontSize: 13, color: "#475569" }}>
                  Última intervención: {formatDate(summary.ultimaFecha)}
                </Text>
                <Text style={{ fontSize: 13, color: "#475569" }}>
                  Última parada: {formatDate(summary.ultimaParada)}
                </Text>
                <Text style={{ fontSize: 13, color: "#475569" }}>
                  Último mantenimiento:{" "}
                  {formatDate(summary.ultimoMantenimiento)}
                </Text>
                <Text style={{ fontSize: 13, color: "#475569" }}>
                  Personal planta / contratista: {summary.planta} /{" "}
                  {summary.contratista}
                </Text>
              </View>
            </View>
          )}

          {/* KPIs */}
          {loading ? (
            <ActivityIndicator color="#2A3B76" style={{ marginVertical: 24 }} />
          ) : (
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: 8,
                marginBottom: 16,
              }}
            >
              {kpiCards.map((kpi) => (
                <View
                  key={kpi.label}
                  style={{
                    backgroundColor: "#fff",
                    borderRadius: 10,
                    padding: 12,
                    minWidth: 100,
                    flexGrow: 1,
                    borderWidth: 1,
                    borderColor: "#e2e8f0",
                    borderLeftWidth: 3,
                    borderLeftColor: kpi.accent,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 20,
                      fontWeight: "800",
                      color: kpi.accent,
                    }}
                  >
                    {kpi.value}
                  </Text>
                  <Text
                    style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}
                  >
                    {kpi.label}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Filtros */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginBottom: 16 }}
          >
            {(
              [
                ["all", "Todos"],
                ["parada", "Paradas"],
                ["mantenimiento", "Mantenimiento"],
                ["planta", "Planta"],
                ["contratista", "Contratista"],
              ] as const
            ).map(([key, label]) => (
              <TouchableOpacity
                key={key}
                onPress={() => setFilter(key)}
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  borderRadius: 20,
                  marginRight: 8,
                  backgroundColor: filter === key ? "#2A3B76" : "#fff",
                  borderWidth: 1,
                  borderColor: filter === key ? "#2A3B76" : "#e2e8f0",
                }}
              >
                <Text
                  style={{
                    color: filter === key ? "#fff" : "#334155",
                    fontSize: 12,
                    fontWeight: "600",
                  }}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text
            style={{
              fontWeight: "700",
              marginBottom: 12,
              fontSize: 16,
              color: "#1e293b",
            }}
          >
            Historial de intervenciones ({filteredTimeline.length})
          </Text>

          {filteredTimeline.length === 0 ? (
            <View
              style={{
                backgroundColor: "#fff",
                borderRadius: 12,
                padding: 32,
                alignItems: "center",
                borderWidth: 1,
                borderColor: "#e2e8f0",
              }}
            >
              <Text style={{ color: "#94a3b8", textAlign: "center" }}>
                Sin registros para este equipo con el filtro seleccionado.
              </Text>
              <TouchableOpacity
                onPress={handleReportEvent}
                style={{ marginTop: 16 }}
              >
                <Text style={{ color: "#2A3B76", fontWeight: "600" }}>
                  Reportar primer evento →
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            filteredTimeline.map((entry) => (
              <TouchableOpacity
                key={`${entry.source}-${entry.record_id}`}
                onPress={() => openEntry(entry)}
                disabled={entry.source !== "parada"}
                activeOpacity={entry.source === "parada" ? 0.7 : 1}
                style={{
                  flexDirection: "row",
                  marginBottom: 12,
                }}
              >
                <View
                  style={{
                    width: 4,
                    borderRadius: 2,
                    backgroundColor: sourceColor(entry.source),
                    marginRight: 12,
                  }}
                />
                <View
                  style={{
                    flex: 1,
                    backgroundColor: "#fff",
                    borderRadius: 12,
                    padding: 14,
                    borderWidth: 1,
                    borderColor: "#e2e8f0",
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      flexWrap: "wrap",
                      gap: 8,
                    }}
                  >
                    <View
                      style={{ flexDirection: "row", gap: 6, flexWrap: "wrap" }}
                    >
                      <View
                        style={{
                          backgroundColor: sourceColor(entry.source),
                          borderRadius: 4,
                          paddingHorizontal: 8,
                          paddingVertical: 3,
                        }}
                      >
                        <Text
                          style={{
                            color: "#fff",
                            fontSize: 10,
                            fontWeight: "700",
                          }}
                        >
                          {entry.source === "parada"
                            ? "EVENTO"
                            : "MANTENIMIENTO"}
                        </Text>
                      </View>
                      {entry.event_origin === "equipo_suelto" ? (
                        <View
                          style={{
                            backgroundColor: "#fef3c7",
                            borderRadius: 4,
                            paddingHorizontal: 8,
                            paddingVertical: 3,
                          }}
                        >
                          <Text
                            style={{
                              color: "#b45309",
                              fontSize: 10,
                              fontWeight: "700",
                            }}
                          >
                            EQUIPO SUELTO
                          </Text>
                        </View>
                      ) : null}
                      {entry.estado_equipo ? (
                        <View
                          style={{
                            backgroundColor:
                              ESTADO_EQUIPO[entry.estado_equipo]?.bg ??
                              "#f1f5f9",
                            borderRadius: 4,
                            paddingHorizontal: 8,
                            paddingVertical: 3,
                          }}
                        >
                          <Text
                            style={{
                              color:
                                ESTADO_EQUIPO[entry.estado_equipo]?.color ??
                                "#475569",
                              fontSize: 10,
                              fontWeight: "700",
                              textTransform: "uppercase",
                            }}
                          >
                            {entry.estado_equipo.replace(/_/g, " ")}
                          </Text>
                        </View>
                      ) : null}
                    </View>
                    <Text style={{ fontSize: 11, color: "#94a3b8" }}>
                      {formatDate(entry.fecha)}
                    </Text>
                  </View>

                  <Text
                    style={{
                      fontWeight: "700",
                      marginTop: 10,
                      fontSize: 15,
                      color: "#1e293b",
                    }}
                  >
                    {entry.titulo || entry.descripcion || "Sin título"}
                  </Text>

                  {entry.comentarios && entry.comentarios !== entry.titulo ? (
                    <Text
                      style={{ fontSize: 13, color: "#64748b", marginTop: 6 }}
                      numberOfLines={3}
                    >
                      {entry.comentarios}
                    </Text>
                  ) : null}

                  <View style={{ marginTop: 8, gap: 3 }}>
                    {entry.autor ? (
                      <Text style={{ fontSize: 12, color: "#64748b" }}>
                        Reportado por: {entry.autor}
                      </Text>
                    ) : null}
                    {entry.personnel_type ? (
                      <Text style={{ fontSize: 12, color: "#64748b" }}>
                        Personal: {entry.personnel_type}
                      </Text>
                    ) : null}
                    {entry.tipo_mantenimiento ? (
                      <Text style={{ fontSize: 12, color: "#64748b" }}>
                        Tipo: {entry.tipo_mantenimiento}
                      </Text>
                    ) : null}
                    {entry.numero_ot ? (
                      <Text style={{ fontSize: 12, color: "#64748b" }}>
                        OT: {entry.numero_ot}
                      </Text>
                    ) : null}
                    {entry.causa ? (
                      <Text style={{ fontSize: 12, color: "#64748b" }}>
                        Causa: {entry.causa}
                      </Text>
                    ) : null}
                    {entry.clasificacion_hse ? (
                      <Text
                        style={{
                          fontSize: 12,
                          color: "#b91c1c",
                          fontWeight: "600",
                        }}
                      >
                        HSE: {entry.clasificacion_hse}
                        {entry.horas_perdidas_hse
                          ? ` · ${entry.horas_perdidas_hse} h perdidas`
                          : ""}
                      </Text>
                    ) : null}
                    {entry.horas ? (
                      <Text style={{ fontSize: 12, color: "#64748b" }}>
                        Horas: {entry.horas}
                        {entry.parada_equipo_horas
                          ? ` · Parada equipo: ${entry.parada_equipo_horas} h`
                          : ""}
                      </Text>
                    ) : null}
                    {entry.aprobacion_estado ? (
                      <Text style={{ fontSize: 12, color: "#64748b" }}>
                        Aprobación: {entry.aprobacion_estado}
                      </Text>
                    ) : null}
                  </View>

                  {entry.foto_url ? (
                    <ImageExpo
                      source={{ uri: entry.foto_url }}
                      style={{
                        width: "100%",
                        height: 140,
                        borderRadius: 8,
                        marginTop: 10,
                      }}
                      contentFit="cover"
                    />
                  ) : null}

                  {entry.source === "parada" ? (
                    <Text
                      style={{
                        fontSize: 11,
                        color: "#2A3B76",
                        marginTop: 10,
                        fontWeight: "600",
                      }}
                    >
                      Ver detalle del evento →
                    </Text>
                  ) : null}
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const EquipmentManagement = connect(null, { saveActualServiceAIT })(
  EquipmentManagementRaw,
);

export default EquipmentManagement;
