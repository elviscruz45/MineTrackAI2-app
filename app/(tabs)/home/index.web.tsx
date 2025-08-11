import React, { useEffect, useState, useCallback } from "react";
import {
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Linking,
  ScrollView,
  Platform,
  Dimensions,
  TextInput,
} from "react-native";
import { connect } from "react-redux";
import {
  collection,
  onSnapshot,
  query,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  limit,
  where,
  orderBy,
} from "firebase/firestore";
import { useRouter } from "expo-router";
import { saveTotalEventServiceAITList } from "../../../redux/actions/home";
import { resetPostPerPageHome } from "../../../redux/actions/home";
import { saveApprovalListnew } from "../../../redux/actions/search";
import { updateAITServicesDATA } from "../../../redux/actions/home";
import { db } from "@/firebaseConfig";
import { mineraCorreosList } from "@/utils/MineraList";
import { areaLists } from "@/utils/areaList";
import Toast from "react-native-toast-message";
import { LoadingSpinner } from "../../../components/LoadingSpinner";
import HeaderScreen from "./components/HeaderScreen/HeaderScreen";
import styles from "./_styles/index.styles";
import { Image as ImageExpo } from "expo-image";
import { Icon } from "@rneui/themed";
import { SafeAreaView } from "react-native-safe-area-context";
const windowWidth = Dimensions.get("window").width;
const numColumns = windowWidth > 1000 ? 3 : 1; // 2 columns for Mac/large screens, 1 for mobile
function HomeScreenRaw(props: any) {
  // let expoPushToken: any;
  // let notification: any;

  const router = useRouter();
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [companyName, setCompanyName] = useState("");
  // const navigation = useNavigation();
  //Data about the company belong this event
  function capitalizeFirstLetter(str: string) {
    return str?.charAt(0).toUpperCase() + str?.slice(1);
  }
  const regex = /@(.+?)\./i;
  // this useEffect is used to retrive all data from firebase
  useEffect(() => {
    let unsubscribe: any;

    if (props.email) {
      const companyName =
        capitalizeFirstLetter(props.email?.match(regex)?.[1]) || "Anonimo";
      const companyNameLowercase = companyName?.toLowerCase();

      async function fetchData() {
        let queryRef;

        queryRef = query(
          collection(db, "events"),
          limit(20),
          // where("visibilidad", "==", "Todos"),
          // where(
          //   "AITEmpresaMinera",
          //   "==",
          //   mineraCorreosList[companyNameLowercase]
          // ),
          orderBy("createdAt", "desc")
        );

        unsubscribe = onSnapshot(queryRef, async (ItemFirebase) => {
          const lista: any = [];
          ItemFirebase.forEach((doc) => {
            lista.push(doc.data());
          });
          //order the list by date
          lista.sort((a: any, b: any) => {
            return b.createdAt - a.createdAt;
          });

          setPosts(lista);
          setCompanyName(companyName);
          props.saveTotalEventServiceAITList(lista);
        });
        setIsLoading(false);
      }

      fetchData();

      return () => {
        if (unsubscribe) {
          unsubscribe();
        }
      };
    }
  }, [props.email]);

  useEffect(() => {
    let unsubscribe: any;
    if (props.email) {
      function fetchData() {
        let queryRef = query(
          collection(db, "approvals"),
          orderBy("date", "desc"),
          where("ApprovalRequestSentTo", "array-contains", props.email),
          limit(20)
        );
        unsubscribe = onSnapshot(queryRef, (ItemFirebase) => {
          const lista: any = [];
          ItemFirebase.forEach((doc) => {
            lista.push(doc.data());
          });
          props.saveApprovalListnew(lista);
        });
      }
      fetchData();
      return () => {
        if (unsubscribe) {
          unsubscribe();
        }
      };
    }
  }, [props.email]);

  const loadMorePosts = () => {
    props.resetPostPerPageHome(props.postPerPage);
  };

  //---This is used to get the attached file in the post that contain an attached file---
  const uploadFile = useCallback(async (uri: any) => {
    try {
      const supported = await Linking.canOpenURL(uri);
      if (supported) {
        await Linking.openURL(uri);
      } else {
        Toast.show({
          type: "error",
          position: "top",
          text1: "Unable to open PDF document",
        });
      }
    } catch (error) {
      Toast.show({
        type: "error",
        position: "top",
        text1: "Error opening PDF document",
      });
    }
  }, []);

  //---activate like/unlike Post using useCallback--------
  const likePost = useCallback(
    async (item: any) => {
      const postRef = doc(db, "events", item.idDocFirestoreDB);

      if (item.likes?.includes(props.email)) {
        await updateDoc(postRef, {
          likes: arrayRemove(props.email),
        });
      } else {
        await updateDoc(postRef, {
          likes: arrayUnion(props.email),
        });
      }
    },
    [props.email]
  );

  //--To goes to comment screen using callBack-----
  const commentPost = useCallback((data: any) => {
    router.push({
      pathname: "/home/comment",
      params: {
        idDocFirestoreDB: data.idDocFirestoreDB,
        AITidServicios: data.AITidServicios,
        fechaPostFormato: data.fechaPostFormato,
        pdfPrincipal: data.pdfPrincipal.replace(/%2F/g, "abcdefg"),
        visibilidad: data.visibilidad,
        fotoPrincipal: data.fotoPrincipal.replace(/%2F/g, "abcdefg"),
        AITNombreServicio: data.AITNombreServicio,
        emailPerfil: data.emailPerfil,
        titulo: data.titulo,
        comentarios: data.comentarios,
        totalHH: data.totalHH,
        supervisores: data.supervisores,
        HSE: data.HSE,
        liderTecnico: data.liderTecnico,
        soldador: data.soldador,
        tecnico: data.tecnico,
        ayudante: data.ayudante,
      },
    });
  }, []);

  // goToServiceInfo
  const goToServiceInfo = (data: any) => {
    router.push({
      pathname: "/search",
      params: {
        Item: data.AITidServicios,
      },
    });

    setTimeout(() => {
      router.push({
        pathname: "/search/Item",
        params: {
          Item: data.AITidServicios,
        },
      });
    }, 100); // Adjust the delay as needed
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }
  if (
    posts?.length === 0 ||
    !props.email ||
    !props.user_photo ||
    !companyName
  ) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#f8f9fa",
        }}
      >
        <View style={{ alignItems: "center", marginTop: 24, marginBottom: 24 }}>
          <HeaderScreen />
        </View>
        <View
          style={{
            // flex: 1,
            backgroundColor: "#f8f9fa",
            justifyContent: "center",
            alignItems: "center",
            padding: 20,
          }}
        >
          <ImageExpo
            source={require("../../../assets/logoPandora.jpg")}
            style={{
              width: 150,
              height: 150,
              marginBottom: 40,
            }}
            cachePolicy={"memory-disk"}
          />
          <Text
            style={{
              fontSize: windowWidth > 800 ? 60 : 40,
              fontWeight: "700",
              color: "#2A3B76",
              marginBottom: 20,
              textAlign: "center",
            }}
          >
            Bienvenido a MineTrackAI
          </Text>
          <Text
            style={{
              fontSize: windowWidth > 800 ? 22 : 18,
              color: "#555",
              marginBottom: 40,
              textAlign: "center",
              maxWidth: 600,
              lineHeight: 28,
            }}
          >
            La plataforma integral para monitoreo y mantenimiento de plantas
            mineras. Conectando equipos, optimizando recursos y mejorando la
            eficiencia.
          </Text>

          {/* Feature highlights */}
          <View
            style={{
              flexDirection: windowWidth > 800 ? "row" : "column",
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
              maxWidth: 900,
              marginBottom: 60,
            }}
          >
            {[
              {
                icon: "bar-chart",
                title: "Análisis en tiempo real",
                description: "Monitoreo continuo de datos operativos",
              },
              {
                icon: "settings",
                title: "Mantenimiento preventivo",
                description: "Anticipe problemas antes de que ocurran",
              },
              {
                icon: "smartphone",
                title: "Acceso móvil y web",
                description: "Controle sus operaciones desde cualquier lugar",
              },
            ].map((feature, index) => (
              <View
                key={index}
                style={{
                  backgroundColor: "white",
                  borderRadius: 12,
                  padding: 24,
                  margin: 10,
                  width: windowWidth > 800 ? "30%" : "80%",
                  alignItems: "center",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.08,
                  shadowRadius: 4,
                  elevation: 3,
                }}
              >
                <View
                  style={{
                    backgroundColor: "#E6F2FF",
                    width: 60,
                    height: 60,
                    borderRadius: 30,
                    justifyContent: "center",
                    alignItems: "center",
                    marginBottom: 16,
                  }}
                >
                  <Icon
                    name={feature.icon}
                    type="feather"
                    size={28}
                    color="#2A3B76"
                  />
                </View>
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "600",
                    color: "#2A3B76",
                    marginBottom: 8,
                    textAlign: "center",
                  }}
                >
                  {feature.title}
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    color: "#666",
                    textAlign: "center",
                    lineHeight: 20,
                  }}
                >
                  {feature.description}
                </Text>
              </View>
            ))}
          </View>

          {/* CTA Button */}
          <TouchableOpacity
            style={{
              backgroundColor: "#2A3B76",
              paddingVertical: 16,
              paddingHorizontal: 32,
              borderRadius: 8,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
            }}
          >
            <Text
              style={{
                color: "white",
                fontSize: 18,
                fontWeight: "600",
              }}
            >
              Empezar ahora
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  } else {
    return (
      <SafeAreaView
        style={[
          {
            flex: 1,
            backgroundColor: "#f8f9fa",
            height: "100%",
          },
        ]}
      >
        <View style={{ marginTop: 24, marginBottom: 24 }}>
          <HeaderScreen />
        </View>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
        >
          <View
            style={{
              paddingHorizontal:
                windowWidth > 1200 ? "10%" : windowWidth > 800 ? "5%" : "2%",
              paddingTop: 20,
              backgroundColor: "#f8f9fa",
              flex: 1,
            }}
          >
            {/* Dashboard Header with Search and Quick Actions */}
            <View
              style={{
                backgroundColor: "#fff",
                borderRadius: 12,
                padding: 20,
                marginBottom: 24,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 6,
                elevation: 2,
              }}
            >
              <View
                style={{
                  flexDirection: windowWidth > 800 ? "row" : "column",
                  justifyContent: "space-between",
                  alignItems: windowWidth > 800 ? "center" : "flex-start",
                  marginBottom: 16,
                }}
              >
                <View>
                  <Text
                    style={{
                      fontSize: 24,
                      fontWeight: "700",
                      color: "#2A3B76",
                      marginBottom: 4,
                    }}
                  >
                    Dashboard de Operaciones
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      color: "#666",
                    }}
                  >
                    {new Date().toLocaleDateString("es-ES", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </Text>
                </View>

                {/* Search Bar */}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: "#f5f5f5",
                    borderRadius: 8,
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    marginTop: windowWidth > 800 ? 0 : 16,
                    width: windowWidth > 800 ? 300 : "100%",
                  }}
                >
                  <Icon
                    name="search"
                    type="feather"
                    size={18}
                    color="#666"
                    style={{ marginRight: 8 }}
                  />
                  <TextInput
                    placeholder="Buscar eventos o servicios..."
                    placeholderTextColor="#999"
                    style={{
                      flex: 1,
                      fontSize: 14,
                      color: "#333",
                      padding: 0,
                      height: 24,
                    }}
                  />
                </View>
              </View>

              {/* Quick Action Buttons */}
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  marginTop: 8,
                }}
              >
                {[
                  {
                    label: "Crear informe",
                    icon: "file-plus",
                    color: "#4CAF50",
                  },
                  {
                    label: "Añadir evento",
                    icon: "plus-circle",
                    color: "#2196F3",
                  },
                  { label: "Mantenimientos", icon: "tool", color: "#FF9800" },
                  {
                    label: "Estadísticas",
                    icon: "bar-chart-2",
                    color: "#9C27B0",
                  },
                ].map((action, index) => (
                  <TouchableOpacity
                    key={index}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      backgroundColor: "#f8f9fa",
                      borderRadius: 8,
                      paddingVertical: 10,
                      paddingHorizontal: 16,
                      marginRight: 12,
                      marginBottom: windowWidth > 800 ? 0 : 12,
                      borderWidth: 1,
                      borderColor: "#e0e0e0",
                    }}
                  >
                    <Icon
                      name={action.icon}
                      type="feather"
                      size={16}
                      color={action.color}
                      style={{ marginRight: 8 }}
                    />
                    <Text
                      style={{ color: "#444", fontSize: 14, fontWeight: "500" }}
                    >
                      {action.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 20,
                paddingBottom: 15,
                borderBottomWidth: 1,
                borderBottomColor: "#e0e0e0",
              }}
            >
              <Text
                style={{
                  fontSize: 28,
                  fontWeight: "700",
                  color: "#2A3B76",
                }}
              >
                Actividad Reciente
              </Text>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Icon
                  name="filter-list"
                  type="material"
                  color="#2A3B76"
                  size={24}
                  style={{ marginRight: 8 }}
                />
                <Text style={{ color: "#2A3B76", fontWeight: "600" }}>
                  Filtrar
                </Text>
              </View>
            </View>

            {/* Summary Stats Section */}
            <View
              style={{
                flexDirection: windowWidth > 800 ? "row" : "column",
                justifyContent: "space-between",
                marginBottom: 24,
              }}
            >
              {[
                {
                  title: "Eventos Totales",
                  value: posts.length,
                  icon: "calendar",
                  color: "#4CAF50",
                  change: "+12%",
                },
                {
                  title: "Mantenimientos",
                  value: 36,
                  icon: "tool",
                  color: "#2196F3",
                  change: "+5%",
                },
                {
                  title: "Tiempo Promedio",
                  value: "4.5h",
                  icon: "clock",
                  color: "#FF9800",
                  change: "-8%",
                },
                {
                  title: "Eficiencia",
                  value: "92%",
                  icon: "trending-up",
                  color: "#9C27B0",
                  change: "+3%",
                },
              ].map((stat, index) => (
                <View
                  key={index}
                  style={{
                    backgroundColor: "#fff",
                    borderRadius: 12,
                    padding: 16,
                    width: windowWidth > 800 ? "24%" : "100%",
                    marginBottom: windowWidth > 800 ? 0 : 12,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.05,
                    shadowRadius: 3,
                    elevation: 2,
                    borderWidth: 1,
                    borderColor: "#f0f0f0",
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: 12,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 16,
                        color: "#666",
                        fontWeight: "500",
                      }}
                    >
                      {stat.title}
                    </Text>
                    <View
                      style={{
                        backgroundColor: `${stat.color}20`,
                        width: 40,
                        height: 40,
                        borderRadius: 8,
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <Icon
                        name={stat.icon}
                        type="feather"
                        size={20}
                        color={stat.color}
                      />
                    </View>
                  </View>

                  <Text
                    style={{
                      fontSize: 24,
                      fontWeight: "700",
                      color: "#333",
                      marginBottom: 8,
                    }}
                  >
                    {stat.value}
                  </Text>

                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    <Icon
                      name={
                        stat.change.includes("+")
                          ? "trending-up"
                          : "trending-down"
                      }
                      type="feather"
                      size={16}
                      color={stat.change.includes("+") ? "#4CAF50" : "#F44336"}
                      style={{ marginRight: 4 }}
                    />
                    <Text
                      style={{
                        fontSize: 14,
                        color: stat.change.includes("+")
                          ? "#4CAF50"
                          : "#F44336",
                      }}
                    >
                      {stat.change} este mes
                    </Text>
                  </View>
                </View>
              ))}
            </View>

            <FlatList
              data={posts}
              numColumns={numColumns}
              scrollEnabled={true}
              showsVerticalScrollIndicator={false}
              style={{ flex: 1 }}
              contentContainerStyle={{
                paddingBottom: 50,
              }}
              columnWrapperStyle={
                windowWidth > 1000
                  ? {
                      justifyContent: "space-between",
                      marginBottom: 15,
                    }
                  : undefined
              }
              renderItem={({ item }: { item: any }) => {
                //the algoritm to retrieve the image source to render the icon
                const area = item?.AITAreaServicio;
                const indexareaList = areaLists.findIndex(
                  (item) => item.value === area
                );
                const imageSource =
                  areaLists[indexareaList]?.image ??
                  require("../../../assets/equipmentplant/ImageIcons/fhIcon1.jpeg");
                return (
                  <View
                    style={{
                      backgroundColor: "#fff",
                      borderRadius: 12,
                      overflow: "hidden",
                      marginBottom: 20,
                      width:
                        windowWidth > 1000
                          ? (windowWidth * 0.8) / 3 - 20
                          : "100%",
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.08,
                      shadowRadius: 4,
                      elevation: 1,
                      borderWidth: 1,
                      borderColor: "#f0f0f0",
                    }}
                  >
                    {/* Company Badge */}
                    <View
                      style={{
                        position: "absolute",
                        left: 12,
                        top: 12,
                        zIndex: 10,
                        backgroundColor: "#2A3B76",
                        borderRadius: 20,
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        flexDirection: "row",
                        alignItems: "center",
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: 0.2,
                        shadowRadius: 2,
                      }}
                    >
                      <View
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: 12,
                          backgroundColor: "#fff",
                          justifyContent: "center",
                          alignItems: "center",
                          marginRight: 6,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 14,
                            fontWeight: "bold",
                            color: "#2A3B76",
                          }}
                        >
                          FH
                        </Text>
                      </View>
                      <Text
                        style={{
                          color: "#fff",
                          fontSize: 12,
                          fontWeight: "600",
                        }}
                      >
                        {item.AITEmpresaMinera?.substring(0, 8)}
                      </Text>
                    </View>

                    {/* Card Image */}
                    <TouchableOpacity onPress={() => commentPost(item)}>
                      <ImageExpo
                        source={{ uri: item.fotoPrincipal }}
                        style={{
                          width: "100%",
                          height: 190,
                          resizeMode: "cover",
                        }}
                        cachePolicy={"memory-disk"}
                      />
                    </TouchableOpacity>

                    {/* Card Content */}
                    <View style={{ padding: 16 }}>
                      <TouchableOpacity
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          marginBottom: 12,
                        }}
                        onPress={() => goToServiceInfo(item)}
                      >
                        <ImageExpo
                          source={
                            item.AITphotoServiceURL
                              ? { uri: item.AITphotoServiceURL }
                              : imageSource
                          }
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: 14,
                            marginRight: 8,
                          }}
                          cachePolicy={"memory-disk"}
                        />
                        <Text
                          style={{
                            fontSize: 14,
                            fontWeight: "600",
                            color: "#2A3B76",
                          }}
                          numberOfLines={1}
                        >
                          {item.AITNombreServicio}
                        </Text>
                      </TouchableOpacity>

                      <Text
                        style={{
                          fontSize: 17,
                          fontWeight: "700",
                          color: "#333",
                          marginBottom: 8,
                          lineHeight: 22,
                        }}
                        numberOfLines={2}
                      >
                        {item.titulo}
                      </Text>

                      <Text
                        style={{
                          fontSize: 14,
                          color: "#555",
                          lineHeight: 20,
                          marginBottom: 12,
                        }}
                        selectable={true}
                        numberOfLines={2}
                      >
                        {item.comentarios}
                      </Text>

                      {/* Card Footer */}
                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginTop: 8,
                          borderTopWidth: 1,
                          borderTopColor: "#f0f0f0",
                          paddingTop: 12,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 13,
                            color: "#888",
                          }}
                        >
                          {item.fechaPostFormato}
                        </Text>
                        <ImageExpo
                          source={require("../../../assets/assetpics/userIcon.png")}
                          // source={{ uri: item.fotoUsuarioPerfil }}
                          style={styles.roundImage}
                          cachePolicy={"memory-disk"}
                        />
                        <Text
                          style={{
                            fontSize: 13,
                            color: "#888",
                          }}
                        >
                          {item.nombrePerfil}
                        </Text>
                        <TouchableOpacity
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            backgroundColor: "#2A3B76",
                            paddingVertical: 6,
                            paddingHorizontal: 10,
                            borderRadius: 6,
                          }}
                          onPress={() => commentPost(item)}
                        >
                          <Icon
                            name="arrow-forward"
                            type="material"
                            size={14}
                            color="#fff"
                          />
                          <Text
                            style={{
                              marginLeft: 4,
                              color: "#fff",
                              fontSize: 13,
                              fontWeight: "500",
                            }}
                          >
                            Ver detalles
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                );
              }}
              keyExtractor={(item, index) =>
                `${index}-${item.fechaPostFormato}`
              }
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }
}

const mapStateToProps = (reducers: any) => {
  return {
    email: reducers.profile.email,
    user_photo: reducers.profile.user_photo,
    // postPerPage: reducers.home.postPerPage,
  };
};

const HomeScreen = connect(mapStateToProps, {
  saveTotalEventServiceAITList,
  resetPostPerPageHome,
  saveApprovalListnew,
  updateAITServicesDATA,
})(HomeScreenRaw);

export default HomeScreen;
