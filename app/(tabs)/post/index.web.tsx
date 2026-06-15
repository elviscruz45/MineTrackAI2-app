import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  Platform,
  Dimensions,
  Modal,
} from "react-native";
import { Icon, SearchBar } from "@rneui/themed";
import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { saveActualServiceAIT } from "../../../redux/actions/post";
import styles from "./index.styles";
import { screen } from "../../../utils";
import * as ImagePicker from "expo-image-picker";
import { savePhotoUri } from "../../../redux/actions/post";
import * as ImageManipulator from "expo-image-manipulator";
import { areaLists } from "../../../utils/areaList";
import { saveActualAITServicesFirebaseGlobalState } from "../../../redux/actions/post";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Image as ImageExpo } from "expo-image";
import Toast from "react-native-toast-message";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
import { useLocalSearchParams } from "expo-router";
import { useRouter } from "expo-router";
import * as DocumentPicker from "expo-document-picker";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import * as FileSystem from "expo-file-system";
import Papa from "papaparse";
import { useFormik } from "formik";
import { saveTotalActivities } from "../../../redux/actions/post";
import { initialValues, validationSchema } from "./index.data";
import {
  addDoc,
  collection,
  query,
  doc,
  updateDoc,
  where,
  orderBy,
  getDocs,
  setDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/firebaseConfig";
import * as XLSX from "xlsx";
import { sortByCodigo } from "../../../utils/sortByCodigo";
import { getTagEquipoLabel } from "../../../utils/tagEquipoList";

const windowWidth = Dimensions.get("window").width;

// Función para calcular el número de columnas basado en el ancho de pantalla
const getNumColumns = () => {
  if (windowWidth >= 1400) return 4;
  if (windowWidth >= 1024) return 3;
  if (windowWidth >= 768) return 2;
  return 1;
};

const numColumns = getNumColumns();

interface CSVRow {
  Codigo: string;
  NombreServicio: string;
  FechaInicio?: string;
  FechaFin?: string;
  OrdenCompra?: string;
  SupervisorMina?: string;
  SupervisorEECC?: string;
  parentCode?: string;
  EmpresaMinera?: string;
  TipoServicio?: string;
  NumeroCotizacion?: string;
  Moneda?: string;
  Monto?: string;
  NumeroSupervisorSeguridad?: string;
  NumeroSupervisor?: string;
  NumeroTecnicos?: string;
  NumeroLider?: string;
  NumeroSoldador?: string;
  HorasTotales?: any;
}

function PublishRaw(props: any) {
  const [equipment, setEquipment] = useState<any>(null);
  const [AIT, setAIT] = useState<any>(null);
  const [searchText, setSearchText] = useState("");
  const [posts, setPosts] = useState<any>([]);
  const [searchResults, setSearchResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [flatlistData, setFlatlistData] = useState(false);
  const [idServiciosAIT, setIdServiciosAIT] = useState("");
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);

  const router = useRouter();

  // const emptyimage = require("../../../assets/pictures/appTeseoLogol.png");
  const emptyimage = require("../../../assets/login/logoPandora_1024.jpg");

  //Data about the company belong this event
  function capitalizeFirstLetter(str: string) {
    return str?.charAt(0).toUpperCase() + str?.slice(1);
  }

  const regex = /@(.+?)\./i;
  const companyName =
    capitalizeFirstLetter(props.email?.match(regex)?.[1]) || "Anonimo";

  // Fix the date parsing by replacing comma with space
  const parseToTimestamp = (dateStr: string) => {
    if (!dateStr) return null;
    // Replace comma with space for proper date parsing
    const fixedDateStr = dateStr.replace(",", " ");
    const parsedDate = new Date(fixedDateStr);

    // Check if date is valid
    if (isNaN(parsedDate.getTime())) {
      console.warn(`Invalid date: ${dateStr}`);
      return null;
    }

    // Return a Firestore timestamp
    return Timestamp.fromDate(parsedDate);
  };

  //retrieving serviceAIT list data from firebase
  useEffect(() => {
    let servicesList = props.servicesData;
    if (Array.isArray(servicesList)) {
      const servicesListSorted = sortByCodigo(servicesList);
      setPosts(servicesListSorted);
    }
  }, [props.servicesData]);

  //This is used to retrieve the servicies AIT we are looking for

  useEffect(() => {
    if (searchText === "") {
      setSearchResults(posts);
    } else {
      const result = posts?.filter((item: any) => {
        const re = new RegExp(searchText, "ig");
        return (
          re.test(item.Codigo) ||
          re.test(item.NumeroAIT) ||
          re.test(item.NombreServicio) ||
          re.test(item.companyName) ||
          re.test(item.EmpresaMinera)
        );
      });
      setSearchResults(result);
    }
  }, [searchText, posts]);

  //method to retrieve the picture required in the event post (pick Imagen, take a photo)
  const pickImage = async (AITServiceNumber: any) => {
    if (!equipment) {
      Toast.show({
        type: "error",
        text1: "Escoge un servicio para continuar",
        visibilityTime: 2000,
        autoHide: true,
        topOffset: 30,
        bottomOffset: 40,
      });
      return;
    }
    if (!equipment) return;

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images", "videos"],
      allowsEditing: true,
      aspect: [4, 4],
      quality: 1,
    });
    if (result.canceled) {
      Toast.show({
        type: "error",
        text1: "No se ha seleccionado ninguna imagen",
        visibilityTime: 2000,
        autoHide: true,
        topOffset: 30,
        bottomOffset: 40,
      });
    } else {
      const resizedPhoto = await ImageManipulator.manipulateAsync(
        result.assets[0].uri,
        [{ resize: { width: 800 } }],
        { compress: 0.4, format: SaveFormat.JPEG, base64: true }
      );
      props.savePhotoUri(resizedPhoto.uri);
      // navigation.navigate(screen.post.form);
      router.push({
        pathname: "/post/Information",
        // params: { item: item },
      });
      setEquipment(null);
    }
  };
  // go to another screen to take a photo before put data to the form
  const camera = (AITServiceNumber: any) => {
    if (!equipment) {
      Toast.show({
        type: "error",
        text1: "Escoge un servicio para continuar",
        visibilityTime: 2000,
        autoHide: true,
        topOffset: 30,
        bottomOffset: 40,
      });
      return;
    }
    if (!equipment) return;
    // navigation.navigate(screen.post.camera);
    router.push({
      pathname: "/post/Camera",
      // params: { Item: item },
    });
    setEquipment(null);
    setAIT(null);
  };

  //Addin a new Service asigned called AIT

  const addAIT = () => {
    // navigation.navigate(screen.post.aitform);
    router.push({
      pathname: "/post/AIT",
      // params: { Item: item },
    });
    setEquipment(null);
    setAIT(null);
  };

  const formik = useFormik({
    initialValues: initialValues(),
    validationSchema: validationSchema(),
    validateOnChange: false,
    onSubmit: async (formValue) => {},
  });

  const selectAsset = (AIT: any) => {
    const area = AIT.AreaServicio;
    const indexareaList = areaLists.findIndex((item) => item.value === area);
    const imageSource =
      areaLists[indexareaList]?.image ||
      // require("../../../assets/equipmentplant/ImageIcons/confipetrolLogos.png");
      require("../../../assets/equipmentplant/poderosa.png");
    const imageUpdated = AIT.photoServiceURL;
    if (imageUpdated) {
      setEquipment({ uri: imageUpdated });
    } else {
      setEquipment(imageSource);
    }
    setAIT(AIT);
    props.saveActualServiceAIT(AIT);
    setShowActionModal(true);
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <SafeAreaView
      style={[{ flex: 1, backgroundColor: "#f5f5f5" }, styles.AndroidSafeArea]}
    >
      <KeyboardAwareScrollView
        showsVerticalScrollIndicator={false}
        style={{ backgroundColor: "#f5f5f5", marginTop: 10 }}
      >
        <View style={styles.searchContainer}>
          <SearchBar
            placeholder="Buscar por referencia o Servicio"
            value={searchText}
            onChangeText={(text) => setSearchText(text)}
            lightTheme={true}
            containerStyle={styles.searchBarContainer}
            inputContainerStyle={styles.searchBarInput}
            inputStyle={styles.searchBarText}
            round
          />
        </View>

        {props.firebase_user_name && (
          <View style={styles.equipments2}>
            <View>
              <ImageExpo
                source={equipment ?? emptyimage}
                style={styles.roundImage}
                cachePolicy={"memory-disk"}
              />
              <View>
                <Text style={styles.name2}>
                  {equipment ? AIT?.NombreServicio : "Escoge El Servicio"}
                </Text>
              </View>
            </View>
          </View>
        )}
        {props.firebase_user_name && (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              // backgroundColor: "white",
              justifyContent: "space-between",
              paddingHorizontal: 20,
              marginTop: 10,
              marginBottom: 10,
            }}
          >
            <TouchableOpacity
              onPress={() => pickImage(AIT?.TipoServicio)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Image
                source={require("../../../assets/pictures/AddImage.png")}
                style={styles.roundImageUpload}
              />
              <Text
                style={{
                  fontSize: 10,
                  marginTop: 2,
                  textAlign: "center",
                  color: "#555",
                }}
              >
                Galería
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => camera(AIT?.TipoServicio)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Image
                source={require("../../../assets/pictures/TakePhoto2.png")}
                style={styles.roundImageUpload}
              />
              <Text
                style={{
                  fontSize: 10,
                  marginTop: 2,
                  textAlign: "center",
                  color: "#555",
                }}
              >
                Cámara
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => addAIT()}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Image
                source={require("../../../assets/pictures/newService7.png")}
                style={styles.roundImageUpload}
              />
              <Text
                style={{
                  fontSize: 10,
                  marginTop: 2,
                  textAlign: "center",
                  color: "#555",
                }}
              >
                Nuevo Servicio
              </Text>
            </TouchableOpacity>
            {/* <TouchableOpacity
              onPress={() => msProject()}
              style={{
                // style={styles.btnContainer4}
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Image
                source={require("../../../assets/pictures/projectlogo.png")}
                style={styles.roundImageUpload}
              />
              <Text
                style={{
                  fontSize: 10,
                  marginTop: 2,
                  textAlign: "center",
                  color: "#2A3B76",
                }}
              >
                Proyecto Global
              </Text>
            </TouchableOpacity> */}
          </View>
        )}

        {/* ===== MODAL ACCIÓN: Cámara o Carrete ===== */}
        <Modal
          visible={showActionModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowActionModal(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => setShowActionModal(false)}
            style={{
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.55)",
              justifyContent: "flex-end",
            }}
          >
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => {}}
              style={{
                backgroundColor: "#ffffff",
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
                paddingHorizontal: 24,
                paddingTop: 16,
                paddingBottom: 36,
              }}
            >
              {/* Handle bar */}
              <View
                style={{
                  width: 40,
                  height: 4,
                  backgroundColor: "#dde1e8",
                  borderRadius: 2,
                  alignSelf: "center",
                  marginBottom: 18,
                }}
              />

              {/* Servicio info */}
              <View style={{ alignItems: "center", marginBottom: 20 }}>
                <ImageExpo
                  source={equipment ?? emptyimage}
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 32,
                    borderWidth: 2,
                    borderColor: "#e9ecef",
                  }}
                  cachePolicy={"memory-disk"}
                />
                <Text
                  numberOfLines={1}
                  style={{
                    fontWeight: "700",
                    fontSize: 16,
                    color: "#2A3B76",
                    marginTop: 10,
                    maxWidth: 280,
                    textAlign: "center",
                  }}
                >
                  {AIT?.NombreServicio}
                </Text>
                {AIT?.Codigo ? (
                  <View
                    style={{
                      backgroundColor: "#2A3B76",
                      borderRadius: 4,
                      paddingHorizontal: 8,
                      paddingVertical: 2,
                      marginTop: 8,
                    }}
                  >
                    <Text style={{ color: "#ffffff", fontSize: 11, fontWeight: "700" }}>
                      {AIT.Codigo}
                    </Text>
                  </View>
                ) : AIT?.NumeroAIT ? (
                  <Text
                    style={{ color: "#94a3b8", fontSize: 12, marginTop: 2 }}
                  >
                    OC: {AIT.NumeroAIT}
                  </Text>
                ) : null}
              </View>

              <Text
                style={{
                  textAlign: "center",
                  color: "#64748b",
                  fontSize: 13,
                  marginBottom: 18,
                }}
              >
                ¿Cómo quieres adjuntar la foto?
              </Text>

              {/* Opción: Carrete */}
              <TouchableOpacity
                onPress={() => {
                  setShowActionModal(false);
                  pickImage(AIT?.TipoServicio);
                }}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: "#f0f4f8",
                  borderRadius: 14,
                  padding: 16,
                  marginBottom: 12,
                }}
                activeOpacity={0.75}
              >
                <View
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    backgroundColor: "#e3eeff",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Image
                    source={require("../../../assets/pictures/AddImage.png")}
                    style={{ width: 30, height: 30 }}
                  />
                </View>
                <View style={{ marginLeft: 14, flex: 1 }}>
                  <Text
                    style={{
                      fontWeight: "600",
                      fontSize: 15,
                      color: "#1e293b",
                    }}
                  >
                    Carrete / Galería
                  </Text>
                  <Text style={{ color: "#94a3b8", fontSize: 12, marginTop: 2 }}>
                    Buscar foto en tu dispositivo
                  </Text>
                </View>
                <Text style={{ color: "#c0cad8", fontSize: 20 }}>›</Text>
              </TouchableOpacity>

              {/* Opción: Cámara */}
              <TouchableOpacity
                onPress={() => {
                  setShowActionModal(false);
                  camera(AIT?.TipoServicio);
                }}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: "#f0f4f8",
                  borderRadius: 14,
                  padding: 16,
                  marginBottom: 20,
                }}
                activeOpacity={0.75}
              >
                <View
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    backgroundColor: "#e0f7e9",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Image
                    source={require("../../../assets/pictures/TakePhoto2.png")}
                    style={{ width: 30, height: 30 }}
                  />
                </View>
                <View style={{ marginLeft: 14, flex: 1 }}>
                  <Text
                    style={{
                      fontWeight: "600",
                      fontSize: 15,
                      color: "#1e293b",
                    }}
                  >
                    Cámara
                  </Text>
                  <Text style={{ color: "#94a3b8", fontSize: 12, marginTop: 2 }}>
                    Tomar una nueva foto
                  </Text>
                </View>
                <Text style={{ color: "#c0cad8", fontSize: 20 }}>›</Text>
              </TouchableOpacity>

              {/* Cancelar */}
              <TouchableOpacity
                onPress={() => setShowActionModal(false)}
                style={{ alignItems: "center", paddingVertical: 8 }}
                activeOpacity={0.6}
              >
                <Text style={{ color: "#94a3b8", fontSize: 14 }}>Cancelar</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>

        <FlatList
          data={searchResults}
          key={numColumns}
          numColumns={numColumns}
          columnWrapperStyle={numColumns > 1 ? styles.columnWrapper : undefined}
          // scrollEnabled={true}
          contentContainerStyle={styles.listContent}
          renderItem={({ item, index }) => {
            const area = item.AreaServicio;
            const indexareaList = areaLists.findIndex(
              (item) => item.value === area
            );
            const imageSource =
              areaLists[indexareaList]?.image ||
              require("../../../assets/equipmentplant/poderosa.png");

            return (
              <TouchableOpacity
                onPress={() => selectAsset(item)}
                style={styles.cardContainer}
                activeOpacity={0.7}
              >
                <View style={styles.card}>
                  <View style={styles.cardImageContainer}>
                    {item.photoServiceURL ? (
                      <ImageExpo
                        source={{ uri: item.photoServiceURL }}
                        style={styles.cardImage}
                        cachePolicy={"memory-disk"}
                      />
                    ) : (
                      <ImageExpo
                        source={
                          imageSource ||
                          require("../../../assets/equipmentplant/poderosa.png")
                        }
                        style={styles.cardImage}
                        cachePolicy={"memory-disk"}
                      />
                    )}
                  </View>

                  <View style={styles.cardContent}>
                    <View style={styles.cardHeader}>
                      {item.Codigo ? (
                        <View style={styles.codeBadge}>
                          <Text style={styles.codeBadgeText}>{item.Codigo}</Text>
                        </View>
                      ) : null}
                      {item.TipoServicio ? (
                        <Text style={styles.tipoChip} numberOfLines={1}>
                          {item.TipoServicio}
                        </Text>
                      ) : null}
                    </View>

                    <Text style={styles.cardTitle} numberOfLines={2}>
                      {item.NombreServicio}
                    </Text>

                    <View style={styles.cardInfo}>
                      {getTagEquipoLabel(item.TagEquipo) ? (
                        <View style={styles.tagBadge}>
                          <Text style={styles.tagBadgeText} numberOfLines={1}>
                            {getTagEquipoLabel(item.TagEquipo)}
                          </Text>
                        </View>
                      ) : null}

                      {item.EmpresaMinera ? (
                        <Text style={styles.infoText} numberOfLines={1}>
                          <Text style={styles.infoLabel}>Minera: </Text>
                          <Text style={styles.infoValue}>{item.EmpresaMinera}</Text>
                        </Text>
                      ) : null}

                      {item.NumeroAIT ? (
                        <Text style={styles.infoText} numberOfLines={1}>
                          <Text style={styles.infoLabel}>OC: </Text>
                          <Text style={styles.infoValue}>{item.NumeroAIT}</Text>
                        </Text>
                      ) : null}
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
          keyExtractor={(item, index) => `${index}-${item.fechaPostFormato}`}
        />
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}

const mapStateToProps = (reducers: any) => {
  return {
    firebase_user_name: reducers.profile.firebase_user_name,
    user_photo: reducers.profile.user_photo,
    email: reducers.profile.email,
    servicesData: reducers.home.servicesData,
    totalActivies: reducers.post.totalActivities,
  };
};

const Publish = connect(mapStateToProps, {
  saveActualServiceAIT,
  savePhotoUri,
  saveActualAITServicesFirebaseGlobalState,
  saveTotalActivities,
})(PublishRaw);

// Intenta parsear fechas en múltiples formatos y seriales de Excel
function parseAnyDate(value: any) {
  if (!value) return null;

  // 1. Si es número (serial Excel)
  if (typeof value === "number") {
    const date = XLSX.SSF.parse_date_code(value);
    if (date) {
      return new Date(date.y, date.m - 1, date.d, date.H, date.M, date.S);
    }
  }

  // 2. Si es string, prueba varios formatos
  if (typeof value === "string") {
    // Normaliza separador
    let str = value.replace(",", " ").replace("  ", " ").trim();

    // Intenta con Date.parse (soporta ISO y algunos formatos comunes)
    let d = new Date(str);
    if (!isNaN(d.getTime())) return d;

    // Intenta con regex para DD/MM/YYYY HH:mm(:ss)? (AM/PM)?
    const regex =
      /^(\d{1,2})\/(\d{1,2})\/(\d{2,4})[ T](\d{1,2}):(\d{2})(?::(\d{2}))?\s?(AM|PM)?$/i;
    const match = str.match(regex);
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
  }

  // Si nada funcionó, retorna null
  return null;
}

export default Publish;
