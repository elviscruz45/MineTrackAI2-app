import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  Platform,
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
      servicesList.sort((a, b) => {
        return b.createdAt - a.createdAt;
      });
      setPosts(servicesList);
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
      require("../../../assets/equipmentplant/ImageIcons/fhIcon1.jpeg");
    const imageUpdated = AIT.photoServiceURL;
    if (imageUpdated) {
      setEquipment({ uri: imageUpdated });
    } else {
      setEquipment(imageSource);
    }
    setAIT(AIT);
    props.saveActualServiceAIT(AIT);
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <SafeAreaView
      style={[{ flex: 1, backgroundColor: "white" }, styles.AndroidSafeArea]}
    >
      <KeyboardAwareScrollView
        showsVerticalScrollIndicator={false}
        style={{ backgroundColor: "white", marginTop: 10 }}
      >
        <Text></Text>
        <Text></Text>
        <SearchBar
          placeholder="Buscar por referencia o Servicio"
          value={searchText}
          onChangeText={(text) => setSearchText(text)}
          lightTheme={true}
          inputContainerStyle={{ backgroundColor: "white" }}
        />

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
                {/* <Text style={styles.info}>
                {equipment ? `Serv:${AIT?.NumeroAIT}` : "de la lista"}
              </Text> */}
              </View>
            </View>
          </View>
        )}
        <Text> </Text>
        {props.firebase_user_name && (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "white",
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
        <Text> </Text>

        <FlatList
          data={searchResults}
          scrollEnabled={true}
          renderItem={({ item, index }) => {
            const area = item.AreaServicio;
            const indexareaList = areaLists.findIndex(
              (item) => item.value === area
            );
            const imageSource =
              areaLists[indexareaList]?.image ||
              require("../../../assets/equipmentplant/ImageIcons/fhIcon1.jpeg");

            return (
              <TouchableOpacity
                onPress={() => selectAsset(item)}
                style={{ backgroundColor: "white" }} // Add backgroundColor here
              >
                <View style={styles.equipments}>
                  {item.photoServiceURL ? (
                    <ImageExpo
                      source={{ uri: item.photoServiceURL }}
                      style={styles.image}
                      cachePolicy={"memory-disk"}
                    />
                  ) : (
                    <ImageExpo
                      source={
                        imageSource ||
                        require("../../../assets/equipmentplant/ImageIcons/fhIcon1.jpeg")
                      }
                      style={styles.image}
                      cachePolicy={"memory-disk"}
                    />
                  )}

                  <View>
                    <Text style={styles.name}>{item.NombreServicio}</Text>
                    <Text style={styles.info}>
                      {"Codigo Servicio: "}
                      {item.NumeroAIT}
                    </Text>
                    <Text style={styles.info}>
                      {"Tipo: "}
                      {item.TipoServicio}
                    </Text>
                    <Text style={styles.info}>
                      {"Empresa Minera: "}
                      {item.EmpresaMinera}
                    </Text>
                    {/* {companyName !== item.companyName && (
                      <Text style={styles.info}>
                        {"Empresa: "}
                        {item.companyName}
                      </Text>
                    )} */}
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
          keyExtractor={(item, index) => `${index}-${item.fechaPostFormato}`} // Provide a unique key for each item
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
