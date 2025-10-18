import {
  View,
  Text,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from "react-native";
import { Avatar, Button } from "@rneui/themed";
import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import styles from "./Information.styles";
import GeneralForms from "./components/GeneralForms/GeneralForms";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import initialValues from "./Information.data";
import { validationSchema } from "./Information.data";
import { saveActualPostFirebase } from "../../../redux/actions/post";
import { useFormik } from "formik";
import { db } from "@/firebaseConfig";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  arrayUnion,
  FieldValue,
  setDoc,
} from "firebase/firestore";
import { areaLists } from "../../../utils/areaList";
import TitleForms from "./components/TitleForms/TitleForms";
import { resetPostPerPageHome } from "../../../redux/actions/home";
import { saveTotalUsers } from "../../../redux/actions/post";
import { dateFormat, uploadPdf, uploadImage } from "./Information.calc";
import useUserData from "./Information.calc";
import { Image as ImageExpo } from "expo-image";
import Toast from "react-native-toast-message";
import { usePushNotifications } from "@/usePushNotifications";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

let Network: typeof import("expo-network");
if (Platform.OS !== "web") {
  Network = require("expo-network");
}

// Workaround for expo-network on web
// See: https://github.com/expo/expo/issues/18658#issuecomment-1463137837

import OfflineFormsStatus from "@/components/OfflineFormsStatus/OfflineFormsStatus";

// Funciones específicas para manejo offline del formulario
const OFFLINE_FORMS_QUEUE_KEY = "offline_forms_queue";

interface OfflineFormOperation {
  id: string;
  type: "setDoc" | "updateDoc";
  collection: string;
  docId: string;
  data: any;
  timestamp: number;
  formType: "TitleForms" | "GeneralForms";
  // Agregar campos para imágenes pendientes
  pendingImages?: {
    mainImage?: string; // URI local de imagen principal
    additionalImages?: string[]; // URIs locales de imágenes adicionales
    pdfFile?: string; // URI local de archivo PDF
  };
  needsImageUpload?: boolean;
}

// Función para verificar conectividad usando expo-network
const checkOnlineStatus = async (): Promise<boolean> => {
  try {
    if (Platform.OS === "web") {
      // En PWA web, usar navigator.onLine
      return navigator.onLine;
    } else {
      // En mobile, usar expo-network
      const networkState = await Network.getNetworkStateAsync();
      return !!(networkState.isConnected && networkState.isInternetReachable);
    }
  } catch (error) {
    console.error("Error checking network status:", error);
    return false; // Asumir offline si hay error
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
      // Usar AsyncStorage para mobile (aunque se enfoca en PWA)
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

    console.log(`🔄 Procesando ${queue.length} formularios offline...`);

    const processed: string[] = [];
    const failed: OfflineFormOperation[] = [];

    for (const operation of queue) {
      try {
        // Si hay imágenes pendientes, subirlas primero
        if (operation.needsImageUpload && operation.pendingImages) {
          console.log(`📷 Subiendo imágenes pendientes para ${operation.id}`);

          // Subir imagen principal si es un URI local
          if (
            operation.pendingImages.mainImage &&
            operation.pendingImages.mainImage.startsWith("file://")
          ) {
            const snapshot = await uploadImage(
              operation.pendingImages.mainImage
            );
            const imagePath = snapshot.metadata.fullPath;
            const imageUrl = await getDownloadURL(ref(getStorage(), imagePath));

            // Actualizar los datos con la URL real
            if (
              operation.data.fotoPrincipal === operation.pendingImages.mainImage
            ) {
              operation.data.fotoPrincipal = imageUrl;
            }
          }

          // Subir imágenes adicionales si son URIs locales
          if (
            operation.pendingImages.additionalImages &&
            operation.pendingImages.additionalImages.length > 0
          ) {
            const uploadedImages = [];
            for (const localUri of operation.pendingImages.additionalImages) {
              if (localUri.startsWith("file://")) {
                const snapshot = await uploadImage(localUri);
                const imagePath = snapshot.metadata.fullPath;
                const imageUrl = await getDownloadURL(
                  ref(getStorage(), imagePath)
                );
                uploadedImages.push(imageUrl);
              } else {
                uploadedImages.push(localUri); // Ya es una URL
              }
            }
            operation.data.newImages = uploadedImages;
          }
        }

        if (operation.type === "setDoc") {
          await setDoc(
            doc(db, operation.collection, operation.docId),
            operation.data
          );
        } else if (operation.type === "updateDoc") {
          const docRef = doc(db, operation.collection, operation.docId);
          await updateDoc(docRef, operation.data);
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
        text1: "Formularios Sincronizados",
        text2: `${processed.length} formularios enviados al servidor`,
        position: "top",
        visibilityTime: 4000,
      });
    }
  } catch (error) {
    console.error("Error procesando cola de formularios:", error);
  }
};

// Función para manejar subida de imágenes con fallback offline
const handleImageUploadWithOffline = async (
  imageUri: string
): Promise<string> => {
  const isOnline = await checkOnlineStatus();

  if (isOnline) {
    try {
      const snapshot = await uploadImage(imageUri);
      const imagePath = snapshot.metadata.fullPath;
      const imageUrl = await getDownloadURL(ref(getStorage(), imagePath));
      console.log("✅ Imagen subida online:", imageUrl);
      return imageUrl;
    } catch (error) {
      console.error(
        "❌ Error subiendo imagen online, usando URI local:",
        error
      );
      return imageUri; // Fallback a URI local
    }
  } else {
    console.log("📱 Offline: usando URI local para imagen");
    return imageUri; // Usar URI local cuando esté offline
  }
};

// Función para manejar subida de PDFs con fallback offline
const handlePdfUploadWithOffline = async (
  pdfFile: any,
  filename: string,
  date: string
): Promise<string> => {
  const isOnline = await checkOnlineStatus();

  if (isOnline) {
    try {
      const snapshotPDF = await uploadPdf(pdfFile, filename, date);
      const imagePathPDF = snapshotPDF?.metadata.fullPath;
      const pdfUrl = await getDownloadURL(ref(getStorage(), imagePathPDF));
      console.log("✅ PDF subido online:", pdfUrl);
      return pdfUrl;
    } catch (error) {
      console.error(
        "❌ Error subiendo PDF online, guardando referencia local:",
        error
      );
      return `local_pdf_${filename}_${Date.now()}`; // Referencia local
    }
  } else {
    console.log("📱 Offline: guardando referencia local para PDF");
    return `local_pdf_${filename}_${Date.now()}`; // Referencia local cuando esté offline
  }
};

// Función principal para manejar operaciones Firebase con offline
const handleFirebaseOperationWithOffline = async (
  operation: () => Promise<void>,
  operationData: Omit<OfflineFormOperation, "timestamp">,
  pendingImages?: {
    mainImage?: string;
    additionalImages?: string[];
    pdfFile?: string;
  }
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
        pendingImages,
        needsImageUpload: !!pendingImages,
      });
      return false;
    }
  } else {
    // Sin conexión, guardar offline directamente
    console.log(`📱 Sin conexión, guardando ${operationData.formType} offline`);
    await saveToOfflineQueue({
      ...operationData,
      timestamp: Date.now(),
      pendingImages,
      needsImageUpload: !!pendingImages,
    });
    return false;
  }
};

function InformationRaw(props: any) {
  const [moreImages, setMoreImages] = useState([]);
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);
  // const { expoPushToken, notification } = usePushNotifications();

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

  // Hook para escuchar eventos de reconexión en web
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

  //fetching data from firebase to retrieve all users
  useUserData(props.email, props.saveTotalUsers, props.getTotalUsers);

  // retrieving data from formik forms ,data from ./InfomartionScreen.data.js
  const formik = useFormik({
    initialValues: initialValues(),
    validationSchema: validationSchema(),
    validateOnChange: false,
    onSubmit: async (formValue) => {
      setIsFormSubmitting(true); // Iniciar loading manual
      console.log("aaaaa");

      try {
        const newData = formValue;
        newData.fechaPostFormato = dateFormat();
        //data of the service AIT information
        newData.AITidServicios = props.actualServiceAIT?.idServiciosAIT;
        newData.AITNombreServicio = props.actualServiceAIT?.NombreServicio;
        newData.AITEmpresaMinera = props.actualServiceAIT?.EmpresaMinera;
        newData.AITAreaServicio = props.actualServiceAIT?.AreaServicio;
        newData.AITphotoServiceURL = props.actualServiceAIT?.photoServiceURL;
        newData.AITNumero = props.actualServiceAIT?.NumeroAIT;
        newData.AITcompanyName = props.actualServiceAIT?.companyName;
        newData.projectId = props.actualServiceAIT?.projectId;
        console.log("bbbbbb");

        //push notification
        // newData.pushNotification = expoPushToken?.data || "no token";

        //sum of total HH
        newData.unicoID =
          newData.AITidServicios + "-" + newData.AITNombreServicio;

        newData.totalHH =
          parseInt(newData.supervisores) +
          parseInt(newData.HSE) +
          parseInt(newData.liderTecnico) +
          parseInt(newData.soldador) +
          parseInt(newData.tecnico) +
          parseInt(newData.ayudante);

        // send profile information
        newData.emailPerfil = props.email || "Anonimo";
        newData.nombrePerfil = props.firebase_user_name || "Anonimo";
        newData.fotoUsuarioPerfil = props.user_photo;
        console.log("ccccc");

        // Verificar conectividad antes de procesar imágenes
        const isOnline = await checkOnlineStatus();
        console.log("🌐 Estado de conexión:", isOnline ? "Online" : "Offline");

        // Manejar imagen principal con fallback offline
        const imageUrl = await handleImageUploadWithOffline(props.savePhotoUri);

        // Manejar imágenes adicionales con fallback offline
        newData.newImages = [];
        for (let i = 0; i < moreImages.length; i++) {
          const moreImageUrl = await handleImageUploadWithOffline(
            moreImages[i]
          );
          newData.newImages.push(moreImageUrl);
        }

        console.log("dddddddd");

        //manage the file updated to ask for aprovals
        let imageUrlPDF = "";
        if (newData.pdfFile) {
          imageUrlPDF = await handlePdfUploadWithOffline(
            newData.pdfFile,
            newData.FilenameTitle,
            newData.fechaPostFormato
          );
        }
        newData.pdfFile = "";

        newData.pdfPrincipal = imageUrlPDF;
        //preparing data to upload to  firestore Database
        newData.fotoPrincipal = imageUrl;
        newData.createdAt = new Date();
        newData.likes = [];
        newData.comentariosUsuarios = [];
        console.log("eeeeeee");

        //-------- a default newData porcentajeAvance-------
        if (
          newData.etapa === "Envio Solicitud Servicio" ||
          newData.etapa === "Envio Cotizacion" ||
          newData.etapa === "Aprobacion Cotizacion" ||
          newData.etapa === "Inicio Servicio"
        ) {
          newData.porcentajeAvance = "0";
        }

        if (
          newData.etapa === "Envio EDP" ||
          newData.etapa === "Aprobacion EDP" ||
          newData.etapa === "Registro de Pago" ||
          newData.etapa === "Fin servicio"
        ) {
          newData.porcentajeAvance = "100";
        }

        console.log("111111111");

        const uniqueID = `${Date.now()}-${Math.random()
          .toString(36)
          .substring(2, 9)}`;
        newData.idDocFirestoreDB = uniqueID;
        console.log("22222222");

        //nuevo approach - con manejo offline
        // Use setDoc to create or update a document
        const setDocOperation = async () => {
          await setDoc(doc(db, "events", uniqueID), newData);
        };
        console.log("3333333");

        const isOnlineSetDoc = await handleFirebaseOperationWithOffline(
          setDocOperation,
          {
            id: `setDoc-events-${uniqueID}`,
            type: "setDoc",
            collection: "events",
            docId: uniqueID,
            data: newData,
            formType: "TitleForms",
          },
          {
            mainImage: props.savePhotoUri,
            additionalImages: moreImages,
            pdfFile: imageUrlPDF.startsWith("local_pdf_")
              ? newData.FilenameTitle
              : undefined,
          }
        );
        console.log("44444444");

        //Modifying the Service State ServiciosAIT considering the LasEventPost events
        const RefFirebaseLasEventPostd = doc(
          db,
          "ServiciosAIT",
          props.actualServiceAIT?.idServiciosAIT
        );
        const eventSchema = {
          idDocFirestoreDB: newData.idDocFirestoreDB ?? "",
          idDocAITFirestoreDB: props.actualServiceAIT?.idServiciosAIT ?? "",
          fotoPrincipal: newData.fotoPrincipal ?? "",
          fotoUsuarioPerfil: newData.fotoUsuarioPerfil ?? "",
          AITNombreServicio: newData.AITNombreServicio ?? "",
          titulo: newData.titulo ?? "",
          comentarios: newData.comentarios ?? "",
          porcentajeAvance: newData.porcentajeAvance ?? "",
          AITNumero: newData.AITNumero ?? "",
          etapa: newData.etapa ?? "",
          pdfPrincipal: newData?.pdfPrincipal ?? "",
          fechaPostFormato: newData.fechaPostFormato ?? "",
          createdAt: newData.createdAt ?? "",
          emailPerfil: newData.emailPerfil ?? "",
          imageUrl: newData.imageUrl ?? "",
          nombrePerfil: newData.nombrePerfil ?? "",
          visibilidad: newData.visibilidad ?? "",
          newImages: newData.newImages ?? [],
          //tareo
          supervisores: newData.supervisores ?? 0,
          HSE: newData.HSE ?? 0,
          liderTecnico: newData.liderTecnico ?? 0,
          soldador: newData.soldador ?? 0,
          tecnico: newData.tecnico ?? 0,
          ayudante: newData.ayudante ?? 0,
          unicoID: newData.unicoID ?? "",
          totalHH: newData.totalHH ?? 0,
        };

        const updateDataLasEventPost: {
          LastEventPosted: Date;
          AvanceEjecucion: string;
          AvanceAdministrativoTexto: string;
          MontoModificado: string;
          NuevaFechaEstimada: string;
          HHModificado: string;
          aprobacion: FieldValue | string[];
          pdfFile: FieldValue | any[];
          events: FieldValue;
          fechaFinEjecucion: Date | null;
        } = {
          LastEventPosted: newData.createdAt,
          AvanceEjecucion: newData.porcentajeAvance,
          AvanceAdministrativoTexto: newData.etapa,
          MontoModificado: "",
          NuevaFechaEstimada: "",
          HHModificado: "",
          aprobacion: [],
          pdfFile: [],
          events: arrayUnion(eventSchema),
          fechaFinEjecucion:
            newData.porcentajeAvance === "100" &&
            newData.etapa === "Avance Ejecucion"
              ? new Date()
              : null,
        };
        if (newData?.MontoModificado) {
          updateDataLasEventPost.MontoModificado = newData.MontoModificado;
        }
        if (newData?.NuevaFechaEstimada) {
          updateDataLasEventPost.NuevaFechaEstimada =
            newData.NuevaFechaEstimada;
        }
        if (newData?.HHModificado) {
          updateDataLasEventPost.HHModificado = newData.HHModificado;
        }

        if (newData?.aprobacion) {
          updateDataLasEventPost.aprobacion = arrayUnion(newData.aprobacion);
        }
        if (imageUrlPDF) {
          const file = {
            FilenameTitle: newData.FilenameTitle,
            pdfPrincipal: imageUrlPDF,
            tipoFile: newData.tipoFile,
            email: props.email,
            fecha: new Date(),
            fechaPostFormato: dateFormat(),
            pdfFile: newData.pdfFile,
          };
          updateDataLasEventPost.pdfFile = arrayUnion(file);
        }

        // Operación updateDoc con manejo offline
        const updateDocOperation = async () => {
          await updateDoc(RefFirebaseLasEventPostd, updateDataLasEventPost);
        };

        const isOnlineUpdateDoc = await handleFirebaseOperationWithOffline(
          updateDocOperation,
          {
            id: `updateDoc-ServiciosAIT-${
              props.actualServiceAIT?.idServiciosAIT
            }-${Date.now()}`,
            type: "updateDoc",
            collection: "ServiciosAIT",
            docId: props.actualServiceAIT?.idServiciosAIT,
            data: updateDataLasEventPost,
            formType: "GeneralForms",
          }
        );

        // router.back();

        setTimeout(() => {
          router.back();
        }, 100); // Adjust the delay as needed

        // Mostrar mensaje apropiado según el estado de conectividad
        if (isOnlineSetDoc && isOnlineUpdateDoc) {
          Toast.show({
            type: "success",
            position: "bottom",
            text1: "Formulario enviado exitosamente",
            text2: "Datos sincronizados con el servidor",
          });
        } else {
          Toast.show({
            type: "info",
            position: "bottom",
            text1: "Formulario guardado offline",
            text2: "Se enviará automáticamente cuando tengas conexión",
          });
        }
      } catch (error) {
        console.error("Error al enviar formulario:", error);
        Toast.show({
          type: "error",
          position: "bottom",
          text1: "Error al tratar de subir estos datos",
        });
      } finally {
        setIsFormSubmitting(false); // Terminar loading manual
      }
    },
  });

  //algorith to retrieve image source that
  const area = props.actualServiceAIT?.AreaServicio;
  const indexareaList = areaLists.findIndex((item) => item.value === area);
  const imageSource =
    areaLists[indexareaList]?.image ||
    require("../../../assets/equipmentplant/ImageIcons/fhIcon1.jpeg");

  return (
    // <SafeAreaView style={{ flex: 1, backgroundColor: "red" }}>
    <KeyboardAwareScrollView
      style={{
        backgroundColor: "white",
        // marginHorizontal: "0%",
        // extraScrollHeight:{100}
        // flexGrow: 1,
        // justifyContent: "space-between",
      }} // Add backgroundColor here
    >
      {/* Indicador de estado offline para formularios */}
      <OfflineFormsStatus onForceSync={handleForceSync} />

      <View style={styles.equipments}>
        <Text> </Text>
        <Text style={styles.name}>
          {props.actualServiceAIT?.NombreServicio || "Titulo del Evento"}
        </Text>
        {/* <Text style={styles.info}>
            {"Area: "}
            {props.actualServiceAIT?.AreaServicio}
          </Text> */}
        <Text style={styles.info}>
          {"Tipo Servicio:  "} {props.actualServiceAIT?.TipoServicio}
        </Text>
        <Text> </Text>
      </View>

      <TitleForms
        formik={formik}
        id={props.actualServiceAIT?.NumeroAIT}
        idServiciosAIT={props.actualServiceAIT?.idServiciosAIT}
      />
      <GeneralForms formik={formik} setMoreImages={setMoreImages} />
      <Button
        title="Agregar Evento"
        buttonStyle={styles.addInformation}
        onPress={() => formik.handleSubmit()}
        loading={isFormSubmitting}
      />
      {Platform.OS === "ios" && <View style={{ marginTop: 80 }}></View>}
    </KeyboardAwareScrollView>
    // </SafeAreaView>
  );
}

const mapStateToProps = (reducers: any) => {
  return {
    firebase_user_name: reducers.profile.firebase_user_name,
    user_photo: reducers.profile.user_photo,
    email: reducers.profile.email,
    profile: reducers.profile.profile,
    uid: reducers.profile.uid,
    actualServiceAIT: reducers.post.actualServiceAIT,
    savePhotoUri: reducers.post.savePhotoUri,
    getTotalUsers: reducers.post.saveTotalUsers,
  };
};

const Information = connect(mapStateToProps, {
  saveActualPostFirebase,
  resetPostPerPageHome,
  saveTotalUsers,
})(InformationRaw);

export default Information;
