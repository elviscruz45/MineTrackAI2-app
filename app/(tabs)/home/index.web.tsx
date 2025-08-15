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
  Timestamp,
  setDoc,
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
import ProjectFilterModal from "./components/ProjectFilterModal";
import ProjectUploadModal from "./components/ProjectUploadModal";
import * as FileSystem from "expo-file-system";
import Papa from "papaparse";
import { useFormik } from "formik";
import { initialValues, validationSchema } from "./index.data";

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

const windowWidth = Dimensions.get("window").width;
const numColumns = windowWidth > 1000 ? 3 : 1; // 2 columns for Mac/large screens, 1 for mobile
// Mock data for projects
const AVAILABLE_PROJECTS = [
  "CHANCADO PRIMARIO",
  "CHANCADO SECUNDARIO",
  "MOLIENDA",
  "FLOTACIÓN",
  "ESPESADORES",
  "FILTRADO",
  "CHANCADO TERCIARIO",
  "SISTEMA DE FAJAS",
  "ALMACENAMIENTO DE CONCENTRADO",
  "PLANTA DE CAL",
  "SISTEMA DE BOMBEO",
];

function HomeScreenRaw(props: any) {
  const router = useRouter();
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [companyName, setCompanyName] = useState("");
  const [selectedProject, setSelectedProject] = useState(AVAILABLE_PROJECTS[0]);
  const [selectedCompany, setSelectedCompany] = useState("Antapaccay");
  const [selectedType, setSelectedType] = useState("Parada de Planta");
  const [selectedDate, setSelectedDate] = useState("14/07/2025");
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [idproyecto, setIdProyecto] = useState("");

  console.log("idproyectoidproyectoidproyecto", idproyecto);

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
          where("projectId", "==", idproyecto),

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

      idproyecto && fetchData();

      return () => {
        if (unsubscribe) {
          unsubscribe();
        }
      };
    }
  }, [props.email, idproyecto]);

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

  const formik = useFormik({
    initialValues: initialValues(),
    validationSchema: validationSchema(),
    validateOnChange: false,
    onSubmit: async (formValue) => {},
  });

  const handleProjectFileUpload = async (
    projectName: string,
    projectType: string,
    fileAsset: any,
    newProjectDocID: any
  ) => {
    console.log("55555 sabe que su plata es lo mismo y el profe");
    try {
      setIsLoading(true);
      console.log("66666 sabe que su plata es lo mismo y el profe");

      // Get file content
      let fileContent = "";

      if (Platform.OS === "web") {
        // Web: use FileReader
        const webFile = fileAsset.file;
        fileContent = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (event) => resolve(event.target?.result as string);
          reader.onerror = (e) => reject(e);
          reader.readAsText(webFile);
        });

        console.log("77777 sabe que su plata es lo mismo y el profe");
      } else {
        // Native: use FileSystem
        const fileUri = fileAsset.uri;
        fileContent = await FileSystem.readAsStringAsync(fileUri, {
          encoding: FileSystem.EncodingType.UTF8,
        });
      }
      console.log("88888 sabe que su plata es lo mismo y el profe");

      // 2️⃣ Parse CSV and filter activities
      const { data } = Papa.parse<CSVRow>(fileContent, { header: true });
      const list4 = data?.filter((row) => row.Codigo?.split(".")?.length === 4);
      const list5 = data
        ?.filter((row) => row.Codigo?.split(".")?.length === 5)
        .map((row) => ({
          ...row,
          parentCode: row.Codigo?.split(".")?.slice(0, 4).join("."), // Relacionarlo con su código padre de 4 niveles
        }));
      console.log("0000000 sabe que su plata es lo mismo y el profe");
      // 3️⃣ Upload only new activities, referencing the new project

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

        console.log("se esta guardando", item);

        const filteredData =
          list5?.filter((item: any) => item.parentCode === Codigo) ?? [];

        const filterNamesActivities = filteredData.map(
          (item: any) => item.NombreServicio
        );

        // Create a new data object with all required fields
        const newData = {
          ...formik.values, // Include current form values
          NombreServicio: NombreServicio || projectName,
          NumeroAIT: OrdenCompra || `PROJ-${Date.now().toString().slice(-6)}`,
          EmpresaMinera: EmpresaMinera,
          Moneda: Moneda || "Soles",
          Monto: Monto || "0",
          SupervisorSeguridad: NumeroSupervisorSeguridad || "0",
          Supervisor: NumeroSupervisor || "0",
          Tecnicos: NumeroTecnicos || "0",
          Lider: NumeroLider || "0",
          Soldador: NumeroSoldador || "0",
          TipoServicio: TipoServicio || projectType,
          NumeroCotizacion: NumeroCotizacion,
          FechaInicio: FechaInicio,
          FechaFin: FechaFin,
          ResponsableEmpresaUsuario3: SupervisorMina,
          ResponsableEmpresaContratista3: SupervisorEECC,
          // Global project properties
          isGlobalProject: true,
          projectName: projectName,
          projectType: projectType,
          projectId: newProjectDocID, // Reference to the global project
          // Include all required fields from your formik onSubmit function
          emailPerfil: props.email || "Anonimo",
          nombrePerfil: props.firebase_user_name || "Anonimo",
          idServiciosAIT: `${Date.now()}-${Math.random()
            .toString(36)
            .substring(2, 9)}`,
          activities: filterNamesActivities,
          activitiesData: filteredData,
          createdAt: Timestamp.now(),
        };

        // Directly submit to Firebase
        await setDoc(doc(db, "ServiciosAIT", newData.idServiciosAIT), newData);

        // Optional: Add a small delay
        await new Promise((resolve) => setTimeout(resolve, 200));
      }

      Toast.show({
        type: "success",
        text1: "Proyecto global creado exitosamente",
        visibilityTime: 3000,
      });

      setIsLoading(false);
    } catch (error) {
      console.error("Error al procesar el archivo:", error);
      Toast.show({
        type: "error",
        text1: "Error al procesar el archivo",
        text2: error instanceof Error ? error.message : "Error desconocido",
      });
      setIsLoading(false);
    }
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

  // Format the project title in the desired format
  const getFormattedProjectTitle = () => {
    return `${selectedCompany} - ${selectedType} - Chancado Primario - ${selectedDate}`;
  };

  const handleProjectChange = (project: string) => {
    setSelectedProject(project);
    // Here you would typically fetch or filter data based on the selected project
    console.log(`Selected project: ${project}`);
  };
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

  const msProject = () => {
    console.log("111111 msProject");
    // Open the project upload modal instead of directly handling file upload
    setShowNewProjectModal(true);
  };
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

  // if (isLoading) {
  //   return <LoadingSpinner />;
  // }
  if (
    // posts?.length === 0 ||
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
        {/* <View style={{ alignItems: "center", marginTop: 24, marginBottom: 24 }}>
          <HeaderScreen idproyecto={idproyecto} />
        </View> */}
        <div
          style={{
            backgroundColor: "white",
            padding: "12px 24px",
            borderBottom: "1px solid #eaeaeaff",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0px",
            }}
          >
            {/* <h3
              style={{
                margin: 0,
                fontSize: 16,
                color: "#2A3B76",
                fontWeight: 500,
              }}
            >
              PROYECTO:
            </h3> */}
            <h3
              style={{
                ...styles.company,
                margin: 0,
                fontSize: 18,
                color: "black",
                // fontWeight: 600,
                textAlign: "center",
              }}
            >
              {`${getFormattedProjectTitle()}`}
            </h3>
          </div>
          <button
            onClick={() => msProject()}
            style={{
              backgroundColor: "green",
              color: "white",
              border: "none",
              borderRadius: 4,
              padding: "8px 16px",
              fontSize: 14,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
              boxShadow: "0 2px 4px rgba(42, 59, 118, 0.2)",
            }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ marginRight: 6 }}
            >
              <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2" />
              <path
                d="M12 8V16M8 12H16"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Crear Nuevo Proyecto
          </button>
          <button
            onClick={() => setShowProjectModal(true)}
            style={{
              backgroundColor: "#2A3B76",
              color: "white",
              border: "none",
              borderRadius: 4,
              padding: "8px 16px",
              fontSize: 14,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
              boxShadow: "0 2px 4px rgba(42, 59, 118, 0.2)",
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Cambiar Proyecto
          </button>

          {/* Project Filter Modal */}
          {showProjectModal && (
            <ProjectFilterModal
              isOpen={showProjectModal}
              setIdProyecto={setIdProyecto}
              onClose={() => setShowProjectModal(false)}
              onSelectProject={(project, company, type, date) => {
                handleProjectChange(project);
                if (company) setSelectedCompany(company);
                if (type) setSelectedType(type);
                if (date) setSelectedDate(date);
              }}
              availableProjects={AVAILABLE_PROJECTS}
              currentProject={selectedProject}
            />
          )}
        </div>
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
          {/* <TouchableOpacity
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
          </TouchableOpacity> */}
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
            height: "100%",
          },
        ]}
      >
        <div
          style={{
            backgroundColor: "white",
            padding: "12px 24px",
            borderBottom: "1px solid #eaeaeaff",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0px",
            }}
          >
            {/* <h3
              style={{
                margin: 0,
                fontSize: 16,
                color: "#2A3B76",
                fontWeight: 500,
              }}
            >
              PROYECTO:
            </h3> */}
            <h3
              style={{
                ...styles.company,
                margin: 0,
                fontSize: 18,
                color: "black",
                // fontWeight: 600,
                textAlign: "center",
              }}
            >
              {`${getFormattedProjectTitle()}`}
            </h3>
          </div>
          <button
            onClick={() => msProject()}
            style={{
              backgroundColor: "green",
              color: "white",
              border: "none",
              borderRadius: 4,
              padding: "8px 16px",
              fontSize: 14,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
              boxShadow: "0 2px 4px rgba(42, 59, 118, 0.2)",
            }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ marginRight: 6 }}
            >
              <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2" />
              <path
                d="M12 8V16M8 12H16"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Crear Nuevo Proyecto
          </button>
          <button
            onClick={() => setShowProjectModal(true)}
            style={{
              backgroundColor: "#2A3B76",
              color: "white",
              border: "none",
              borderRadius: 4,
              padding: "8px 16px",
              fontSize: 14,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
              boxShadow: "0 2px 4px rgba(42, 59, 118, 0.2)",
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Cambiar Proyecto
          </button>

          {/* Project Filter Modal */}
          {showProjectModal && (
            <ProjectFilterModal
              isOpen={showProjectModal}
              setIdProyecto={setIdProyecto}
              onClose={() => setShowProjectModal(false)}
              onSelectProject={(project, company, type, date) => {
                handleProjectChange(project);
                if (company) setSelectedCompany(company);
                if (type) setSelectedType(type);
                if (date) setSelectedDate(date);
              }}
              availableProjects={AVAILABLE_PROJECTS}
              currentProject={selectedProject}
            />
          )}
        </div>
        <View style={{ marginTop: 0, marginBottom: 0 }}>
          <HeaderScreen idproyecto={idproyecto} />
        </View>
        <ProjectUploadModal
          isVisible={showNewProjectModal}
          onClose={() => setShowNewProjectModal(false)}
          onUploadFile={handleProjectFileUpload}
        />
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
