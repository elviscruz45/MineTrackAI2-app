import { View, Text, KeyboardAvoidingView, ScrollView } from "react-native";
import { Avatar, Button } from "@rneui/themed";
import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import { styles } from "./_styles/EditEvent.styles";
import GeneralForms from "../post/components/GeneralForms/GeneralForms";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { validationSchema, initialValues } from "../../../utils/EditEventData";
import { useFormik } from "formik";
import { updateEvent } from "@/lib/db/events";
import { getServicioAitById, updateServicioAit } from "@/lib/db/serviciosAit";
import Toast from "react-native-toast-message";
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

        await updateEvent(idDocFirestoreDB, {
          visibilidad: newData.visibilidad,
        });

        const servicio = await getServicioAitById(AITidServicios);
        if (servicio?.events) {
          const eventList = servicio.events as any[];

          const updatedList = eventList?.map((obj: any) => {
            if (obj.idDocFirestoreDB === idDocFirestoreDB) {
              return { ...obj, visibilidad: newData.visibilidad };
            }
            return obj;
          });

          await updateServicioAit(AITidServicios, { events: updatedList });
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
