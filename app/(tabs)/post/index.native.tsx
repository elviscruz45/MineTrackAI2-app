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

interface CSVRow {
  Codigo: string;
  NombreServicio: string;
  FechaInicio: string;
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
  // const [codes4, setCodes4] = useState<CSVRow[]>([]);
  // const [codes5, setCodes5] = useState<CSVRow[]>([]);
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

  const msProject = async () => {
    try {
      setIsLoading(true);
      // 1️⃣ Seleccionar archivo CSV
      const file: any = await DocumentPicker.getDocumentAsync({
        type: "text/comma-separated-values",
      });

      if (!file || !file.assets || file.assets.length === 0) {
        console.warn("No se seleccionó ningún archivo");
        setIsLoading(false);
        return;
      }
      let fileContent = "";

      if (Platform.OS === "web") {
        // Web: use FileReader
        const webFile = file.assets[0].file;
        fileContent = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (event) => resolve(event.target?.result as string);
          reader.onerror = (e) => reject(e);
          reader.readAsText(webFile);
        });
      } else {
        // Native: use FileSystem
        const fileUri = file.assets[0].uri;
        fileContent = await FileSystem.readAsStringAsync(fileUri, {
          encoding: FileSystem.EncodingType.UTF8,
        });
      }

      // 3️⃣ Convertir CSV a JSON
      const { data } = Papa.parse<CSVRow>(fileContent, { header: true });
      // 4️⃣ Filtrar códigos de 4 y 5 niveles
      const list4 = data?.filter((row) => row.Codigo?.split(".")?.length === 4);
      const list5 = data
        ?.filter((row) => row.Codigo?.split(".")?.length === 5)
        .map((row) => ({
          ...row,
          parentCode: row.Codigo?.split(".")?.slice(0, 4).join("."), // Relacionarlo con su código padre de 4 niveles
        }));
      //----------------------------------------------------------------------------------------------------------------------------

      //----------------------------------------------------------------------------------------------------------------------------
      for (const item of list4) {
        const {
          Codigo,
          NombreServicio,
          FechaInicio,
          FechaFin,
          SupervisorMina,
          SupervisorEECC,
          OrdenCompra,
          EmpresaMinera,
          TipoServicio,
          NumeroCotizacion,
          Moneda,
          Monto,
          NumeroSupervisorSeguridad,
          NumeroSupervisor,
          NumeroTecnicos,
          NumeroLider,
          NumeroSoldador,
          HorasTotales,
        } = item;

        const filteredData =
          list5?.filter((item: any) => item.parentCode === Codigo) ?? [];

        const filterNamesActivities = filteredData.map(
          (item: any) => item.NombreServicio
        );

        // Create a new data object with all required fields
        const newData = {
          ...formik.values, // Include current form values
          NombreServicio,
          NumeroAIT: OrdenCompra,
          // FechaInicio: parseToTimestamp(FechaInicio),
          // FechaFin: parseToTimestamp(FechaFin!!),
          EmpresaMinera: EmpresaMinera,
          Moneda: Moneda || "Soles",
          Monto: Monto || "0",
          SupervisorSeguridad: NumeroSupervisorSeguridad || "0",
          Supervisor: NumeroSupervisor || "0",
          Tecnicos: NumeroTecnicos || "0",
          Lider: NumeroLider || "0",
          Soldador: NumeroSoldador || "0",
          TipoServicio: TipoServicio,
          NumeroCotizacion: NumeroCotizacion,
          FechaInicio: FechaInicio,
          FechaFin: FechaFin,

          ResponsableEmpresaUsuario3: SupervisorMina,
          ResponsableEmpresaContratista3: SupervisorEECC,
          // Include all required fields from your formik onSubmit function
          emailPerfil: props.email || "Anonimo",
          nombrePerfil: props.firebase_user_name || "Anonimo",
          idServiciosAIT: `${Date.now()}-${Math.random()
            .toString(36)
            .substring(2, 9)}`,
          activities: filterNamesActivities,
          activitiesData: filteredData,
        };

        // setIdServiciosAIT(newData.idServiciosAIT)

        // // Directly submit to Firebase
        await setDoc(doc(db, "ServiciosAIT", newData.idServiciosAIT), newData);

        // Optional: Add a small delay
        await new Promise((resolve) => setTimeout(resolve, 200));
      }
      //----------------------------------------------------------------------------------------------------------------------------
      setIsLoading(false);
    } catch (error) {
      console.error("Error al procesar el CSV:", error);
    }
  };

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
        style={{ backgroundColor: "white" }}
      >
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

              // paddingHorizontal: 150,
            }}
          >
            <TouchableOpacity
              // style={styles.btnContainer2}
              onPress={() => pickImage(AIT?.TipoServicio)}
            >
              <Image
                source={require("../../../assets/pictures/AddImage.png")}
                style={styles.roundImageUpload}
              />
            </TouchableOpacity>
            <TouchableOpacity
              // style={styles.btnContainer3}
              onPress={() => camera(AIT?.TipoServicio)}
            >
              <Image
                source={require("../../../assets/pictures/TakePhoto2.png")}
                style={styles.roundImageUpload}
              />
            </TouchableOpacity>
            <TouchableOpacity
              // style={styles.btnContainer4}
              onPress={() => addAIT()}
            >
              <Image
                source={require("../../../assets/pictures/newService7.png")}
                style={styles.roundImageUpload}
              />
            </TouchableOpacity>
            {/* <TouchableOpacity
              // style={styles.btnContainer4}
              onPress={() => msProject()}
            >
              <Image
                source={require("../../../assets/pictures/projectlogo.png")}
                style={styles.roundImageUpload}
              />
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

export default Publish;
