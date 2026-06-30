import {
  View,
  Text,
  Platform,
  useWindowDimensions,
} from "react-native";
import { Button } from "@rneui/themed";
import React, { useState, useEffect, useMemo } from "react";
import { connect } from "react-redux";
import GeneralForms from "./components/GeneralForms/GeneralForms";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import initialValues from "./Information.data";
import { validationSchema } from "./Information.data";
import { saveActualPostFirebase } from "../../../redux/actions/post";
import { useFormik } from "formik";
import {
  createEvent,
  updateEvent as updateSupabaseEvent,
} from "@/lib/db/events";
import {
  updateServicioAit,
  addPdfToServicio,
} from "@/lib/db/serviciosAit";
import { findActivityByTitulo } from "@/lib/db/activities";
import TitleForms from "./components/TitleForms/TitleForms";
import { resetPostPerPageHome } from "../../../redux/actions/home";
import { saveTotalUsers } from "../../../redux/actions/post";
import { dateFormat, uploadPdf, uploadImage } from "./Information.calc";
import useUserData from "./Information.calc";
import Toast from "react-native-toast-message";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import OfflineFormsStatus from "@/components/OfflineFormsStatus/OfflineFormsStatus";
import { createInformationStyles } from "./Information.ui.styles";
import { getTagEquipoLabel } from "../../../utils/tagEquipoList";

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

// Función para verificar conectividad - Solo para web/PWA
const checkOnlineStatus = async (): Promise<boolean> => {
  try {
    if (Platform.OS === "web") {
      // En PWA web, usar navigator.onLine
      return navigator.onLine;
    } else {
      // En mobile, importar dinámicamente expo-network
      try {
        const Network = require("expo-network");
        const networkState = await Network.getNetworkStateAsync();
        return !!(networkState.isConnected && networkState.isInternetReachable);
      } catch (error) {
        // Si expo-network falla, asumir online en mobile
        console.warn("expo-network not available, assuming online");
        return true;
      }
    }
  } catch (error) {
    console.error("Error checking network status:", error);
    // En caso de error, asumir online para no bloquear la app
    return true;
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
            const imageUrl = await uploadImage(
              operation.pendingImages.mainImage
            );
            if (
              operation.data.fotoPrincipal === operation.pendingImages.mainImage
            ) {
              operation.data.fotoPrincipal = imageUrl;
            }
          }

          if (
            operation.pendingImages.additionalImages &&
            operation.pendingImages.additionalImages.length > 0
          ) {
            const uploadedImages = [];
            for (const localUri of operation.pendingImages.additionalImages) {
              if (localUri.startsWith("file://")) {
                const imageUrl = await uploadImage(localUri);
                uploadedImages.push(imageUrl);
              } else {
                uploadedImages.push(localUri);
              }
            }
            operation.data.newImages = uploadedImages;
          }
        }

        if (operation.type === "setDoc" && operation.collection === "events") {
          await createEvent(operation.data);
        } else if (
          operation.type === "updateDoc" &&
          operation.collection === "ServiciosAIT"
        ) {
          const servicioId = operation.docId;
          const data = operation.data;
          const servicioUpdates: Record<string, unknown> = {
            LastEventPosted: data.LastEventPosted,
            AvanceEjecucion: data.AvanceEjecucion,
            AvanceAdministrativoTexto: data.AvanceAdministrativoTexto,
            MontoModificado: data.MontoModificado,
            NuevaFechaEstimada: data.NuevaFechaEstimada,
            HHModificado: data.HHModificado,
            fechaFinEjecucion: data.fechaFinEjecucion,
          };
          if (data.aprobacion) {
            servicioUpdates.aprobacion = Array.isArray(data.aprobacion)
              ? data.aprobacion
              : [data.aprobacion];
          }
          await updateServicioAit(servicioId, servicioUpdates);
          if (data.pdfFile && Array.isArray(data.pdfFile) && data.pdfFile[0]) {
            await addPdfToServicio(servicioId, data.pdfFile[0]);
          }
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

  console.log("como estas que tal te va.... ");

  if (isOnline) {
    try {
      const imageUrl = await uploadImage(imageUri);
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
      const pdfUrl = await uploadPdf(pdfFile, filename, date);
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
  const { width: windowWidth } = useWindowDimensions();
  const styles = useMemo(
    () => createInformationStyles(windowWidth),
    [windowWidth],
  );
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
        const isStandalone = Boolean(
          props.actualServiceAIT?.isStandaloneEquipmentEvent,
        );
        newData.fechaPostFormato = dateFormat();

        if (isStandalone) {
          const tagEquipo = String(props.actualServiceAIT?.TagEquipo || "").trim();
          newData.AITidServicios = "";
          newData.AITNombreServicio = props.actualServiceAIT?.NombreServicio ?? "";
          newData.AITEmpresaMinera = "";
          newData.AITAreaServicio = props.actualServiceAIT?.AreaServicio ?? "";
          newData.AITphotoServiceURL = "";
          newData.AITNumero = "";
          newData.AITcompanyName = "";
          newData.projectId = "";
          (newData as Record<string, unknown>).tag_equipo = tagEquipo;
          (newData as Record<string, unknown>).TagEquipo = tagEquipo;
          (newData as Record<string, unknown>).event_origin = "equipo_suelto";
          newData.unicoID = `equipo-${tagEquipo}-${Date.now()}`;
        } else {
          //data of the service AIT information
          newData.AITidServicios = props.actualServiceAIT?.idServiciosAIT;
          newData.AITNombreServicio = props.actualServiceAIT?.NombreServicio;
          newData.AITEmpresaMinera = props.actualServiceAIT?.EmpresaMinera;
          newData.AITAreaServicio = props.actualServiceAIT?.AreaServicio;
          newData.AITphotoServiceURL = props.actualServiceAIT?.photoServiceURL;
          newData.AITNumero = props.actualServiceAIT?.NumeroAIT;
          newData.AITcompanyName = props.actualServiceAIT?.companyName;
          newData.projectId = props.actualServiceAIT?.projectId;
          (newData as Record<string, unknown>).tag_equipo =
            props.actualServiceAIT?.TagEquipo ?? "";
          (newData as Record<string, unknown>).TagEquipo =
            props.actualServiceAIT?.TagEquipo ?? "";
          (newData as Record<string, unknown>).event_origin = "parada";
          newData.unicoID =
            newData.AITidServicios + "-" + newData.AITNombreServicio;
        }

        const servicioId = props.actualServiceAIT?.idServiciosAIT;
        if (!isStandalone && servicioId && newData.titulo) {
          const matched = await findActivityByTitulo(
            servicioId,
            newData.titulo
          );
          if (matched) {
            (newData as Record<string, unknown>).activity_id = matched.id;
            (newData as Record<string, unknown>).activity_codigo =
              matched.codigo ?? "";
            (newData as Record<string, unknown>).activityCodigo =
              matched.codigo ?? "";
            if (matched.tag_equipo) {
              (newData as Record<string, unknown>).tag_equipo =
                matched.tag_equipo;
              (newData as Record<string, unknown>).TagEquipo =
                matched.tag_equipo;
            }
          }
        }
        console.log("bbbbbb");

        //push notification
        // newData.pushNotification = expoPushToken?.data || "no token";

        //sum of total HH
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

        console.log("111111111");

        const uniqueID = `${Date.now()}-${Math.random()
          .toString(36)
          .substring(2, 9)}`;
        newData.idDocFirestoreDB = uniqueID;
        console.log("22222222");

        //nuevo approach - con manejo offline
        // Use setDoc to create or update a document
        const setDocOperation = async () => {
          await createEvent(newData);
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

        const updateDataLasEventPost: Record<string, unknown> = {
          LastEventPosted: newData.createdAt,
          AvanceEjecucion: newData.porcentajeAvance,
          AvanceAdministrativoTexto: newData.etapa,
          MontoModificado: "",
          NuevaFechaEstimada: "",
          HHModificado: "",
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
          updateDataLasEventPost.aprobacion = [newData.aprobacion];
        }
        let pdfFileToAdd: Record<string, unknown> | null = null;
        if (imageUrlPDF) {
          pdfFileToAdd = {
            FilenameTitle: newData.FilenameTitle,
            pdfPrincipal: imageUrlPDF,
            tipoFile: newData.tipoFile,
            email: props.email,
            fecha: new Date(),
            fechaPostFormato: dateFormat(),
            pdfFile: newData.pdfFile,
          };
        }

        const updateDocOperation = async () => {
          if (!props.actualServiceAIT?.idServiciosAIT) return;
          await updateServicioAit(
            props.actualServiceAIT.idServiciosAIT,
            updateDataLasEventPost
          );
          if (pdfFileToAdd) {
            await addPdfToServicio(
              props.actualServiceAIT.idServiciosAIT,
              pdfFileToAdd
            );
          }
        };

        const isOnlineUpdateDoc = props.actualServiceAIT?.idServiciosAIT
          ? await handleFirebaseOperationWithOffline(
              updateDocOperation,
              {
                id: `updateDoc-ServiciosAIT-${
                  props.actualServiceAIT.idServiciosAIT
                }-${Date.now()}`,
                type: "updateDoc",
                collection: "ServiciosAIT",
                docId: props.actualServiceAIT.idServiciosAIT,
                data: updateDataLasEventPost,
                formType: "GeneralForms",
              }
            )
          : true;

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
  const isStandalone = Boolean(
    props.actualServiceAIT?.isStandaloneEquipmentEvent,
  );
  const serviceName =
    props.actualServiceAIT?.NombreServicio || "Detalle del evento";
  const tagLabel = getTagEquipoLabel(props.actualServiceAIT?.TagEquipo);

  return (
    <SafeAreaView style={styles.scroll} edges={["left", "right", "bottom"]}>
      <KeyboardAwareScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid
        extraScrollHeight={Platform.OS === "ios" ? 80 : 40}
      >
        <View style={styles.offlineWrap}>
          <OfflineFormsStatus onForceSync={handleForceSync} />
        </View>

        <View style={styles.page}>
          <View style={styles.heroCard}>
            <Text style={styles.heroEyebrow}>
              {isStandalone ? "Evento por equipo" : "Servicio vinculado"}
            </Text>
            <Text style={styles.heroTitle}>{serviceName}</Text>

            <View style={styles.heroMetaRow}>
              {isStandalone && props.actualServiceAIT?.TagEquipo ? (
                <View style={styles.heroBadge}>
                  <Text style={styles.heroBadgeText}>
                    {props.actualServiceAIT.TagEquipo}
                  </Text>
                </View>
              ) : null}
              {!isStandalone && props.actualServiceAIT?.Codigo ? (
                <View style={styles.heroBadge}>
                  <Text style={styles.heroBadgeText}>
                    {props.actualServiceAIT.Codigo}
                  </Text>
                </View>
              ) : null}
              {!isStandalone && props.actualServiceAIT?.TipoServicio ? (
                <Text style={styles.heroMetaText}>
                  Tipo: {props.actualServiceAIT.TipoServicio}
                </Text>
              ) : null}
              {tagLabel && !isStandalone ? (
                <Text style={styles.heroMetaText}>Equipo: {tagLabel}</Text>
              ) : null}
              {props.actualServiceAIT?.EmpresaMinera ? (
                <Text style={styles.heroMetaText}>
                  Minera: {props.actualServiceAIT.EmpresaMinera}
                </Text>
              ) : null}
            </View>
          </View>

          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Detalle del evento</Text>
              <Text style={styles.sectionHint}>Campos obligatorios *</Text>
            </View>
            <TitleForms
              formik={formik}
              id={props.actualServiceAIT?.NumeroAIT}
              idServiciosAIT={props.actualServiceAIT?.idServiciosAIT}
            />
          </View>

          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Información adicional</Text>
              <Text style={styles.sectionHint}>Opcional según tipo</Text>
            </View>
            <GeneralForms formik={formik} setMoreImages={setMoreImages} />
          </View>

          <View style={styles.submitWrap}>
            <Button
              title="Agregar evento"
              buttonStyle={styles.submitBtn}
              titleStyle={styles.submitBtnTitle}
              onPress={() => formik.handleSubmit()}
              loading={isFormSubmitting}
              disabled={isFormSubmitting}
            />
            <Text style={styles.submitHint}>
              El evento se guardará localmente si no hay conexión y se
              sincronizará automáticamente.
            </Text>
          </View>

          {Platform.OS === "ios" ? <View style={styles.iosSpacer} /> : null}
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
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
