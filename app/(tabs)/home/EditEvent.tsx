import { View, Text, KeyboardAvoidingView, ScrollView } from "react-native";
import { Avatar, Button } from "@rneui/themed";
import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import { styles } from "./_styles/EditEvent.styles";
import GeneralForms from "../post/components/GeneralForms/GeneralForms";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { validationSchema, initialValues } from "../../../utils/EditEventData";
import { useFormik } from "formik";
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  arrayUnion,
  getDoc,
} from "firebase/firestore";
import TitleForms from "../post/components/TitleForms/TitleForms";

import { Image as ImageExpo } from "expo-image";
import Toast from "react-native-toast-message";
import { db } from "@/firebaseConfig";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Platform } from "react-native";

function EditEventScreenBare(props: any) {
  // const [moreImages, setMoreImages] = useState([]);

  const router = useRouter();
  const { AITidServicios, idDocFirestoreDB }: any = useLocalSearchParams();

  const formik = useFormik({
    initialValues: initialValues(),
    validationSchema: validationSchema(),
    validateOnChange: false,
    onSubmit: async (formValue) => {
      try {
        const newData = formValue;

        //update the doc from events collections
        const eventDocRef = doc(db, "events", idDocFirestoreDB);
        const updatedData = {
          visibilidad: newData.visibilidad,
        };

        await updateDoc(eventDocRef, updatedData);

        //updating events in ServiciosAIT to filter the deleted event
        const Ref = doc(db, "ServiciosAIT", AITidServicios);
        const docSnapshot = await getDoc(Ref);
        const data = docSnapshot.data();
        if (data && data.events) {
          const eventList = data.events;

          const updatedList = eventList?.map((obj: any) => {
            if (obj.idDocFirestoreDB === idDocFirestoreDB) {
              // Update the desired property of the object
              return { ...obj, visibilidad: newData.visibilidad };
            }
            return obj;
          });

          const updatedData2 = {
            events: updatedList,
          };
          await updateDoc(Ref, updatedData2);
          router.back();

          setTimeout(() => {
            router.back();
          }, 100); // Adjust the delay as needed

          Toast.show({
            type: "success",
            position: "bottom",
            text1: "El evento se ha subido correctamente",
          });
        }
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

const EditEventScreen = connect(mapStateToProps, {
  // saveActualPostFirebase,
  // resetPostPerPageHome,
  // saveTotalUsers,
})(EditEventScreenBare);

export default EditEventScreen;
