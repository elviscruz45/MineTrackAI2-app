import { View, Text } from "react-native";
import React, { useState } from "react";
import styles from "./AddForms.styles";
import { Input, Button } from "@rneui/themed";
import * as DocumentPicker from "expo-document-picker";
import { Modal } from "@/components/Modal/Modal";
import ChangeDisplayFileTipo from "@/app/(tabs)/post/components/FormsGeneral/ChangeFIleTipo/ChangeDisplayFileTipo";
import { connect } from "react-redux";
import { useFormik } from "formik";
import AddFormsData from "./AddForms.data";
import { db } from "@/firebaseConfig";
import { screen } from "@/utils";
// import { v4 as uuidv4 } from "uuid";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  uploadBytesResumable,
} from "firebase/storage";
import { doc, updateDoc, arrayUnion } from "firebase/firestore";
import Toast from "react-native-toast-message";
import * as FileSystem from "expo-file-system";
import { useRouter } from "expo-router";

// import "react-native-get-random-values";

function AddDocsFormBare(props: any) {
  const [renderComponent, setRenderComponent] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [tipoFile, setTipoFile] = useState("");
  const [pdfFileURL, setPdfFileURL] = useState("");

  // const navigation = useNavigation();
  const router = useRouter();

  const [shortNameFileUpdated, setShortNameFileUpdated] = useState("");

  const onCloseOpenModal = () => setShowModal((prevState) => !prevState);

  //using Formik
  const formik = useFormik({
    initialValues: AddFormsData.initialValues(),
    validationSchema: AddFormsData.validationSchema(),
    validateOnChange: false,
    onSubmit: async (formValue) => {
      try {
        const newData = formValue;
        //create the algoritm to have the date format of the post
        const date = new Date();
        const monthNames = [
          "ene.",
          "feb.",
          "mar.",
          "abr.",
          "may.",
          "jun.",
          "jul.",
          "ago.",
          "sep.",
          "oct.",
          "nov.",
          "dic.",
        ];
        const day = date.getDate();
        const month = monthNames[date.getMonth()];
        const year = date.getFullYear();
        const hour = date.getHours();
        const minute = date.getMinutes();
        const formattedDate = `${day} ${month} ${year}  ${hour}:${minute} Hrs`;
        newData.fechaPostFormato = formattedDate;
        newData.fecha = new Date();
        newData.email = props.email;

        //manage the file updated to ask for aprovals
        let imageUrlPDF;
        let snapshotPDF;
        if (pdfFileURL) {
          // const snapshotPDF = await uploadPdf(newData.pdfFile);
          // proving
          snapshotPDF = await uploadPdf(pdfFileURL, formattedDate);

          //proving

          const imagePathPDF: any = snapshotPDF?.metadata.fullPath;

          imageUrlPDF = await getDownloadURL(ref(getStorage(), imagePathPDF));
        }

        newData.pdfPrincipal = imageUrlPDF || "";
        newData.FilenameTitle = shortNameFileUpdated || "";

        //Modifying the Service State ServiciosAIT considering the LasEventPost events
        const RefFirebaseLasEventPostd = doc(
          db,
          "ServiciosAIT",
          props.actualServiceAIT?.idServiciosAIT
        );
        const updatedData = {
          pdfFile: arrayUnion(newData),
        };

        await updateDoc(RefFirebaseLasEventPostd, updatedData);

        // navigation.goBack();
        // navigation.goBack();
        router.back();

        setTimeout(() => {
          router.back();
        }, 100); // Adjust the delay as needed

        // screen.search.pdf
        // navigation.navigate(screen.search.item);

        Toast.show({
          type: "success",
          position: "bottom",
          text1: "Documento Agregado Correctamente",
        });
      } catch (error) {
        Toast.show({
          type: "error",
          position: "bottom",
          text1: "El archivo excede los 25 MB",
        });
      }
    },
  });

  const uploadPdf = async (uri: any, formattedDate: any) => {
    try {
      // const uuid = uuidv4();

      // const response = await fetch(uri);
      // const blob = await response.blob();
      // // const blob = new Blob(response);
      // const fileSize = blob.size;

      const blob: Blob = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.onload = function () {
          resolve(xhr.response);
        };
        xhr.onerror = function () {
          reject(new Error("Error converting file URI to Blob"));
        };
        xhr.responseType = "blob";
        xhr.open("GET", uri, true);
        xhr.send(null);
      });
      const fileSize = blob.size ?? 0;
      if (fileSize > 25 * 1024 * 1024) {
        throw new Error("El archivo excede los 25 MB");
      }

      const storage = getStorage();

      const storageRef = ref(
        storage,
        `pdfPost/${shortNameFileUpdated}-${JSON.stringify(new Date())}`
      );
      return await uploadBytesResumable(storageRef, blob);
    } catch (error) {
      Toast.show({
        type: "error",
        position: "bottom",
        text1: "El archivo excede los 25 MB",
      });
    }
  };

  const selectComponent = (key: string) => {
    if (key === "tipoFile") {
      setRenderComponent(
        <ChangeDisplayFileTipo
          onClose={onCloseOpenModal}
          formik={formik}
          setTipoFile={setTipoFile}
        />
      );
    }
    onCloseOpenModal();
  };

  //algorith to pick a pdf File to attach to the event
  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: false,
      });

      if (result.assets) {
        setShortNameFileUpdated(result?.assets[0]?.name);
        // formik.setFieldValue("pdfFile", result?.assets[0]?.uri);
        setPdfFileURL(result?.assets[0]?.uri);

        formik.setFieldValue("FilenameTitle", result?.assets[0]?.name);
        formik.setFieldValue("size", result?.assets[0]?.size);
      } else {
        setShortNameFileUpdated("");
      }
    } catch (err) {
      Toast.show({
        type: "error",
        position: "bottom",
        text1: "Error al tratar de subir estos datos",
      });
    }
  };

  return (
    <View style={{ backgroundColor: "white", flex: 1 }}>
      <Text> </Text>
      <Text> </Text>
      <Text> </Text>
      <Text> </Text>
      <Text> </Text>
      <View style={styles.content}>
        <Text style={styles.subtitleForm}>Adjuntar Archivo o Link</Text>
        <Text> </Text>

        <Input
          value={formik.values.FilenameTitle}
          errorMessage={formik.errors.FilenameTitle}
          placeholder="Adjuntar Archivo"
          multiline={true}
          editable={false}
          rightIcon={{
            type: "material-community",
            name: "arrow-right-circle-outline",
            onPress: () => {
              pickDocument();
            },
          }}
        />

        <Input
          value={formik.values.comentario}
          // errorMessage={formik.errors.tipoFile}
          placeholder="Link de Archivo"
          onChangeText={(text) => formik.setFieldValue("comentario", text)}
        />
        <Text> </Text>

        <Text style={styles.subtitleForm}>Tipo</Text>
        <Text> </Text>
        <Input
          value={formik.values.tipoFile}
          errorMessage={formik.errors.tipoFile}
          placeholder="Tipo de Archivo Adjunto"
          multiline={true}
          editable={false}
          rightIcon={{
            type: "material-community",
            name: "arrow-right-circle-outline",
            onPress: () => selectComponent("tipoFile"),
          }}
        />
      </View>
      <Button
        title="Agregar Documento"
        buttonStyle={styles.addInformation}
        onPress={() => formik.handleSubmit()}
        loading={formik.isSubmitting}
      />
      <Modal show={showModal} close={onCloseOpenModal}>
        {renderComponent}
      </Modal>
    </View>
  );
}

const mapStateToProps = (reducers: any) => {
  return {
    email: reducers.profile.email,
    actualServiceAIT: reducers.post.actualServiceAIT,
  };
};

const AddDocsForm = connect(mapStateToProps, {})(AddDocsFormBare);

export default AddDocsForm;
