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
        }}
      >
        <HeaderScreen />

        <View
          style={{
            flex: 1,
            backgroundColor: "white",
            // justifyContent: "center",
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
      </View>
    );
  } else {
    return (
      <SafeAreaView
        style={[
          {
            flex: 1,
            backgroundColor: "white",
            // alignSelf: windowWidth > 1000 ? "center" : "stretch",
          },
        ]}
      >
        <FlatList
          data={posts}
          numColumns={numColumns}
          ListHeaderComponent={<HeaderScreen />}
          scrollEnabled={true}
          showsVerticalScrollIndicator={false}
          style={{ backgroundColor: "white" }}
          renderItem={({ item }: { item: any }) => {
            //the algoritm to retrieve the image source to render the icon
            const area = item?.AITAreaServicio;
            const indexareaList = areaLists.findIndex(
              (item) => item.value === area
            );
            const imageSource =
              areaLists[indexareaList]?.image ??
              require("../../../assets/equipmentplant/ImageIcons/confipetrolLogos.png");
            return (
              <View
                style={{
                  // margin: 2,
                  // borderBottomWidth: 5,
                  borderColor: "gray",
                  paddingVertical: 10,
                  borderWidth: 1,
                  borderRadius: 20,
                  marginBottom: 10,
                  marginTop: 10,
                  marginHorizontal: windowWidth > 1000 ? 53 : 2,
                  // alignSelf: "center",
                  // marginHorizontal:
                  //   windowWidth > 1000
                  //     ? "22%"
                  //     : windowWidth > 800
                  //     ? "13%"
                  //     : "2%",
                }}
              >
                <Text> </Text>
                <View style={[styles.row, styles.center]}>
                  <View style={[styles.row, styles.center]}>
                    <TouchableOpacity
                      style={[styles.row, styles.center]}
                      onPress={() => goToServiceInfo(item)}
                    >
                      <ImageExpo
                        source={
                          item.AITphotoServiceURL
                            ? { uri: item.AITphotoServiceURL }
                            : imageSource
                        }
                        style={styles.roundImage}
                        cachePolicy={"memory-disk"}
                      />
                      <Text style={styles.NombreServicio}>
                        {item.AITNombreServicio}
                      </Text>
                    </TouchableOpacity>

                    <ImageExpo
                      source={require("../../../assets/assetpics/userIcon.png")}
                      // source={{ uri: item.fotoUsuarioPerfil }}
                      style={styles.roundImage}
                      cachePolicy={"memory-disk"}
                    />
                    <Text style={styles.NombrePerfilCorto}>
                      {item.nombrePerfil}
                    </Text>
                  </View>
                </View>
                <Text> </Text>
                <View style={[styles.row, styles.center]}>
                  <Text style={{ marginLeft: 5, color: "#5B5B5B" }}>
                    {"Empresa:  "}
                    {item.AITEmpresaMinera}
                  </Text>
                </View>
                {/* 
                <View style={[styles.row, styles.center]}>
                  <Text style={{ marginLeft: 5, color: "#5B5B5B" }}>
                    {"Visibilidad:  "}
                    {item.visibilidad}
                  </Text>
                </View> */}
                <Text style={{ marginLeft: 5, color: "#5B5B5B" }}>
                  {"Fecha:  "}
                  {item.fechaPostFormato}
                </Text>
                <Text> </Text>
                <View style={styles.equipments}>
                  <TouchableOpacity onPress={() => commentPost(item)}>
                    <ImageExpo
                      source={{ uri: item.fotoPrincipal }}
                      style={styles.postPhoto}
                      cachePolicy={"memory-disk"}
                    />
                  </TouchableOpacity>

                  <View>
                    <Text style={styles.textAreaTitle}>
                      {/* {"Evento: "} */}
                      {item.titulo}
                    </Text>
                    <Text> </Text>
                    <Text style={styles.textAreaComment} selectable={true}>
                      {item.comentarios}
                    </Text>
                  </View>
                </View>
                <View style={styles.rowlikes}></View>
              </View>
            );
          }}
          keyExtractor={(item, index) => `${index}-${item.fechaPostFormato}`} // Provide a unique key for each item
          // onEndReached={() => {
          // }}
          // onEndReached={() => loadMorePosts()}
          // onEndReachedThreshold={0.1}
        />
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
