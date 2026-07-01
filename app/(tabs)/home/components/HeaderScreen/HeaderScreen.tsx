import { View, Text, FlatList, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { subscribeServiciosAitByProject } from "@/lib/db/serviciosAit";
import { areaLists } from "@/utils/areaList";
import { Image as ImageExpo } from "expo-image";
import { saveActualAITServicesFirebaseGlobalState } from "@/redux/actions/post";
import { updateAITServicesDATA } from "@/redux/actions/home";
import { saveApprovalListnew } from "@/redux/actions/search";
import { useRouter } from "expo-router";
import { sortByCodigo } from "@/utils/sortByCodigo";
import { calculateAvanceFromActivities } from "@/utils/calculateAvance";
import { getTagEquipoLabel } from "@/utils/tagEquipoList";
import { isRutaCritica } from "@/utils/isRutaCritica";

function HeaderScreenNoRedux(props: any) {
  const router = useRouter();

  const [data, setData] = useState<any[] | undefined>();

  console.log("header screen data ", data);
  //Data about the company belong this event
  function capitalizeFirstLetter(str: string) {
    return str?.charAt(0).toUpperCase() + str?.slice(1);
  }
  // const regex = /@(.+?)\./i;
  useEffect(() => {
    if (props.email && props.idproyecto) {
      const unsubscribe = subscribeServiciosAitByProject(
        props.idproyecto,
        (lista) => {
          const listaOrdenada = sortByCodigo(lista);
          setData(listaOrdenada);
          props.updateAITServicesDATA(listaOrdenada);
        }
      );
      return unsubscribe;
    }
  }, [props.email, props.idproyecto, props.refreshGantt]);

  const selectAsset = async (item: any) => {
    await router.push({
      pathname: "/search",
      params: { Item: item },
    });
    setTimeout(() => {
      router.push({
        pathname: "/search/Item",
        params: { Item: item },
      });
    }, 50);
  };

  const getProgressColor = (avance: number) => {
    if (avance >= 80) return "#22c55e";
    if (avance >= 40) return "#f59e0b";
    return "#ef4444";
  };

  return (
    <FlatList
      style={{
        backgroundColor: "white",
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#f0f0f0",
      }}
      contentContainerStyle={{ paddingHorizontal: 12, gap: 8 }}
      horizontal
      showsHorizontalScrollIndicator={false}
      data={data}
      renderItem={({ item, index }) => {
        const area = item.AreaServicio;
        const indexareaList = areaLists.findIndex((a) => a.value === area);
        const imageSource =
          areaLists[indexareaList]?.image ||
          require("../../../../../assets/equipmentplant/poderosa.png");
        const avance = calculateAvanceFromActivities(
          item.activitiesData,
          item.AvanceEjecucion
        );
        
        const progressColor = getProgressColor(avance);
        const name = (item.NombreServicio || "").trimStart();
        const esRutaCriticaItem = isRutaCritica(item.esRutaCritica);
        const tagEquipo = getTagEquipoLabel(item.TagEquipo);

        return (
          <TouchableOpacity
            onPress={() => selectAsset(item.idServiciosAIT)}
            onLongPress={() => {
              const code = String(item.TagEquipo || "").trim();
              if (code) {
                router.push({
                  pathname: "/operations/equipment/[tagCode]",
                  params: { tagCode: code },
                });
              }
            }}
            activeOpacity={0.75}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: esRutaCriticaItem ? "#fff5f5" : "#ffffff",
                borderRadius: 12,
                borderWidth: 1,
                borderColor: esRutaCriticaItem ? "#ffcdd2" : "#e8eaf0",
                borderLeftWidth: esRutaCriticaItem ? 3 : 1,
                borderLeftColor: esRutaCriticaItem ? "#c62828" : "#e8eaf0",
                paddingHorizontal: 10,
                paddingVertical: 8,
                width: 170,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.07,
                shadowRadius: 4,
                elevation: 2,
              }}
            >
              {/* Avatar */}
              <ImageExpo
                source={item.photoServiceURL ? { uri: item.photoServiceURL } : imageSource}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  borderWidth: 2,
                  borderColor: progressColor,
                  flexShrink: 0,
                }}
                cachePolicy="memory-disk"
              />

              {/* Text + progress */}
              <View style={{ flex: 1, marginLeft: 8, overflow: "hidden" }}>
                {/* Sequential index badge */}
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 2 }}>
                  <View
                    style={{
                      backgroundColor: "#2A3B76",
                      borderRadius: 4,
                      paddingHorizontal: 4,
                      paddingVertical: 1,
                      marginRight: 4,
                    }}
                  >
                    <Text style={{ color: "white", fontSize: 9, fontWeight: "700" }}>
                      {item.Codigo}
                    </Text>
                  </View>
                  <Text
                    style={{
                      fontSize: 9,
                      color: progressColor,
                      fontWeight: "700",
                    }}
                  >
                    {avance}%
                  </Text>
                  <View
                    style={{
                      backgroundColor: esRutaCriticaItem ? "#c62828" : "#e2e8f0",
                      borderRadius: 3,
                      paddingHorizontal: 4,
                      paddingVertical: 1,
                      marginLeft: 4,
                    }}
                  >
                    <Text
                      style={{
                        color: esRutaCriticaItem ? "#ffffff" : "#64748b",
                        fontSize: 7,
                        fontWeight: "700",
                      }}
                      numberOfLines={1}
                    >
                      {esRutaCriticaItem ? "Crítica" : "Estándar"}
                    </Text>
                  </View>
                </View>

                {/* Service name — 2 lines */}
                <Text
                  numberOfLines={2}
                  style={{
                    fontSize: 11,
                    fontWeight: "600",
                    color: "#1e293b",
                    lineHeight: 14,
                    marginBottom: tagEquipo ? 3 : 6,
                  }}
                >
                  {name}
                </Text>

                {tagEquipo ? (
                  <View
                    style={{
                      alignSelf: "flex-start",
                      backgroundColor: "#e3f2fd",
                      borderRadius: 4,
                      paddingHorizontal: 5,
                      paddingVertical: 1,
                      marginBottom: 6,
                    }}
                  >
                    <Text
                      numberOfLines={1}
                      style={{
                        fontSize: 8,
                        fontWeight: "700",
                        color: "#1565c0",
                      }}
                    >
                      {tagEquipo}
                    </Text>
                  </View>
                ) : null}

                {/* Progress bar */}
                <View
                  style={{
                    height: 4,
                    backgroundColor: "#f1f5f9",
                    borderRadius: 2,
                    overflow: "hidden",
                  }}
                >
                  <View
                    style={{
                      height: 4,
                      width: `${avance}%`,
                      backgroundColor: progressColor,
                      borderRadius: 2,
                    }}
                  />
                </View>
              </View>
            </View>
          </TouchableOpacity>
        );
      }}
      keyExtractor={(item) => item.idServiciosAIT || item.Codigo}
    />
  );
}

const mapStateToProps = (reducers: any) => {
  return {
    email: reducers.profile.email,
    refreshGantt: reducers.home.refreshGanttRealTime,
  };
};

const HeaderScreen = connect(mapStateToProps, {
  // EquipmentListUpper,
  saveActualAITServicesFirebaseGlobalState,
  updateAITServicesDATA,
  saveApprovalListnew,
})(HeaderScreenNoRedux);

export default HeaderScreen;
