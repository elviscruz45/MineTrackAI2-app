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

function InformationRaw(props: any) {
  const [moreImages, setMoreImages] = useState([]);
  // const { expoPushToken, notification } = usePushNotifications();

  //fetching data from firebase to retrieve all users
  useUserData(props.email, props.saveTotalUsers, props.getTotalUsers);

  // retrieving data from formik forms ,data from ./InfomartionScreen.data.js
  const formik = useFormik({
    initialValues: initialValues(),
    validationSchema: validationSchema(),
    validateOnChange: false,
    onSubmit: async (formValue) => {
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

        // upload the photo or an pickimage to firebase Storage
        const snapshot = await uploadImage(props.savePhotoUri);

        const imagePath = snapshot.metadata.fullPath;
        const imageUrl = await getDownloadURL(ref(getStorage(), imagePath));

        //upload more Images to firebase Storage
        newData.newImages = [];

        for (let i = 0; i < moreImages.length; i++) {
          const moreSnapshot = await uploadImage(moreImages[i]);
          const moreImagePath = moreSnapshot.metadata.fullPath;
          const moreImageUrl = await getDownloadURL(
            ref(getStorage(), moreImagePath)
          );
          newData.newImages.push(moreImageUrl);
        }

        //manage the file updated to ask for aprovals
        let imageUrlPDF;
        if (newData.pdfFile) {
          const snapshotPDF = await uploadPdf(
            newData.pdfFile,
            newData.FilenameTitle,
            newData.fechaPostFormato
          );
          const imagePathPDF = snapshotPDF?.metadata.fullPath;
          imageUrlPDF = await getDownloadURL(ref(getStorage(), imagePathPDF));
        }
        newData.pdfFile = "";

        //--------Uploading docs to a new collection called "aprovals" to manage doc aprovals
        if (
          newData.aprobacion &&
          (newData.etapa === "Solicitud Aprobacion Doc" ||
            newData.etapa === "Envio Cotizacion" ||
            newData.etapa === "Solicitud Ampliacion Servicio" ||
            newData.etapa === "Envio EDP")
        ) {
          const regex = /(?<=\()[^)]*(?=\))/g;
          const matches = newData.aprobacion.match(regex);
          const docData = {
            solicitud: newData.etapa,
            email: newData.emailPerfil,
            solicitudComentario: newData.comentarios,
            etapa: newData.etapa,
            NombreServicio: props.actualServiceAIT?.NombreServicio,
            NumeroServicio: props.actualServiceAIT?.NumeroAIT,
            IdAITService: props.actualServiceAIT?.idServiciosAIT,
            fileName: newData.FilenameTitle,
            pdfFile: imageUrlPDF ?? "",
            tipoFile: newData.tipoFile,
            ApprovalRequestedBy: props.email,
            ApprovalRequestSentTo: matches,
            ApprovalPerformed: [],
            RejectionPerformed: [],
            date: new Date(),
            fechaPostFormato: newData.fechaPostFormato,
            AreaServicio: props.actualServiceAIT?.AreaServicio,
            photoServiceURL: props.actualServiceAIT?.photoServiceURL,
            status: "Pendiente",
            idTimeApproval: new Date().getTime(),
            companyName: props.actualServiceAIT.companyName,
            idApproval: "",
          };
          const docRef = await addDoc(collection(db, "approvals"), docData);
          docData.idApproval = docRef.id;
          const RefFirebase = doc(db, "approvals", docData.idApproval);
          await updateDoc(RefFirebase, docData);
        }
        newData.pdfPrincipal = imageUrlPDF || "";
        //preparing data to upload to  firestore Database
        newData.fotoPrincipal = imageUrl;
        newData.createdAt = new Date();
        newData.likes = [];
        newData.comentariosUsuarios = [];

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

        const uniqueID = `${Date.now()}-${Math.random()
          .toString(36)
          .substring(2, 9)}`;
        newData.idDocFirestoreDB = uniqueID;

        //nuevo approach
        // Use setDoc to create or update a document
        await setDoc(doc(db, "events", uniqueID), newData);

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

        await updateDoc(RefFirebaseLasEventPostd, updateDataLasEventPost);
        router.back();

        setTimeout(() => {
          router.back();
        }, 100); // Adjust the delay as needed

        Toast.show({
          type: "success",
          position: "bottom",
          text1: "El evento se ha subido correctamente",
        });
      } catch (error) {
        Toast.show({
          type: "error",
          position: "bottom",
          text1: "Error al tratar de subir estos datos",
        });
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
        loading={formik.isSubmitting}
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
