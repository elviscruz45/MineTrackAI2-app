import { View, Text, KeyboardAvoidingView, ScrollView } from "react-native";
import { Avatar, Button } from "@rneui/themed";
import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import styles from "./EditEvent.styles";
import GeneralForms from "../post/components/GeneralForms/GeneralForms";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
// import { screen } from "../../../utils";
import EditEventData from "./EditEvent.data";
// import { saveActualPostFirebase } from "../../redux/actions/post";
import { useFormik } from "formik";

import { db } from "@/firebaseConfig";
// import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  arrayUnion,
  getDoc,
} from "firebase/firestore";
// import { areaLists } from "../../../utils/areaList";
import TitleForms from "../post/components/TitleForms/TitleForms";
// import { resetPostPerPageHome } from "../../redux/home";
// import { saveTotalUsers } from "../../redux/actions/post";
// import {
//   dateFormat,
//   useUserData,
//   uploadPdf,
//   uploadImage,
// } from "./InformatioScreen.calc";
import { Image as ImageExpo } from "expo-image";
import Toast from "react-native-toast-message";
import { useLocalSearchParams } from "expo-router";
import { useRouter } from "expo-router";
function EditEventSearchScreenBare(props: any) {
  const router = useRouter();

  const { idDocFirestoreDB, idDocAITFirestoreDB }: any = useLocalSearchParams();
  const formik = useFormik({
    initialValues: EditEventData.initialValues(),
    validationSchema: EditEventData.validationSchema(),
    validateOnChange: false,
    onSubmit: async (formValue) => {
      try {
        const newData = formValue;

        //update the doc from events collections
        const eventDocRef = doc(db, "events", idDocFirestoreDB);
        const updatedData: any = {
          visibilidad: newData.visibilidad,
        };
        if (newData?.porcentajeAvance) {
          updatedData.porcentajeAvance = newData.porcentajeAvance;
        }
        await updateDoc(eventDocRef, updatedData);

        //updating events in ServiciosAIT to filter the deleted event
        const Ref = doc(db, "ServiciosAIT", idDocAITFirestoreDB);
        const docSnapshot: any = await getDoc(Ref);
        const eventList = docSnapshot.data().events;
        const updatedList = eventList.map((obj: any) => {
          if (obj.idDocFirestoreDB === idDocFirestoreDB) {
            // Create the updated object with visibilidad
            const updatedObj = { ...obj, visibilidad: newData.visibilidad };

            // Conditionally add porcentajeAvance if it exists in newData
            if (newData?.porcentajeAvance) {
              updatedObj.porcentajeAvance = newData.porcentajeAvance;
            }

            return updatedObj;
          }
          return obj;
        });

        const updatedData2: any = {
          events: updatedList,
        };
        if (newData?.porcentajeAvance) {
          // Option 1: Set AvanceEjecucion directly to the new porcentajeAvance
          updatedData2.AvanceEjecucion = newData.porcentajeAvance;
        }
        await updateDoc(Ref, updatedData2);

        router.back();

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

  return (
    <KeyboardAwareScrollView
      style={{ backgroundColor: "white" }} // Add backgroundColor here
    >
      <Text> </Text>
      <Text> </Text>
      <Text> </Text>
      <View>
        <GeneralForms formik={formik} agregarImagenes={"editar"} />
        <Button
          title="Editar Evento"
          buttonStyle={styles.addInformation}
          onPress={() => formik.handleSubmit()}
          loading={formik.isSubmitting}
        />
      </View>
    </KeyboardAwareScrollView>
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

const EditEvent = connect(mapStateToProps, {
  // saveActualPostFirebase,
  // resetPostPerPageHome,
  // saveTotalUsers,
})(EditEventSearchScreenBare);

export default EditEvent;
