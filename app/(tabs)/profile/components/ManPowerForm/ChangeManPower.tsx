import React from "react";
import { View, Alert, Text, ScrollView } from "react-native";
import { Input, Button } from "@rneui/themed";
import { useFormik } from "formik";
import Toast from "react-native-toast-message";
import ChangeManPowerData from "./ChangeManPower.data";
import styles from "./ChangeManPower.styles";
import { connect } from "react-redux";
import { db } from "@/firebaseConfig";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { collection, doc, setDoc } from "firebase/firestore";
import { update_firebaseProfile } from "@/redux/actions/profile";
import { v4 as uuidv4 } from "uuid";

function ChangeManPowerBare(props: any) {
  const { onClose } = props;

  const formik = useFormik({
    initialValues: ChangeManPowerData.initialValues(),
    // validationSchema: validationSchema(),
    validateOnChange: false,
    onSubmit: async (formValue) => {
      try {
        //retrieving data from Formik
        const newData = formValue;
        //validations
        if (
          newData.TotalServicios === "" ||
          newData.Servicios === "" ||
          newData.TotalIngenieria === "" ||
          newData.Ingenieria === ""
        ) {
          Alert.alert(
            "Alerta",
            "Complete todos los campos",
            [
              {
                text: "OK",
                onPress: () => console.log("OK button pressed"),
              },
            ],
            {
              cancelable: false,
            }
          );
          return;
        }

        if (parseInt(newData.Servicios) > parseInt(newData.TotalServicios)) {
          Alert.alert(
            "Alerta",
            "1. Total Personal Servicios debe ser mayor que Personal Servicios",
            [{ text: "OK", onPress: () => {} }]
          );
          return;
        }
        // if (
        //   parseInt(newData.Fabricacion) > parseInt(newData.TotalFabricacion)
        // ) {
        //   Alert.alert(
        //     "Alerta",
        //     "3. Total Fabricacion debe ser mayor que Disponible Fabricacion",
        //     [{ text: "OK", onPress: () => {} }]
        //   );
        //   return;
        // }

        if (parseInt(newData.Ingenieria) > parseInt(newData.TotalIngenieria)) {
          Alert.alert(
            "Alerta",
            "2. Total Ingenieria debe ser mayor que Disponible Ingenieria",
            [{ text: "OK", onPress: () => {} }]
          );
          return;
        }

        // if (parseInt(newData.Maquinado) > parseInt(newData.TotalMaquinado)) {
        //   Alert.alert(
        //     "Alerta",
        //     "7. Total Maquinado debe ser mayor que Disponible Maquinado",
        //     [{ text: "OK", onPress: () => {} }]
        //   );
        //   return;
        // }

        //sign up the users in Firestore Database
        newData.photoURL = props.user_photo;
        newData.email = props.email;
        //Data about the company belong this event
        const regex = /@(.+?)\./i;
        newData.companyName = props.email?.match(regex)?.[1] || "Anonimo";

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
        newData.createdAt = new Date();

        ///checking up if there are data in users
        // const uuid = uuidv4();
        // newData.uid = uuid;

        const docRef = doc(
          collection(db, "manpower"),
          JSON.stringify(new Date())
        );
        await setDoc(docRef, newData);
        Toast.show({
          type: "success",
          position: "bottom",
          text1: "La disponibilidad de trabajadores se ha subido correctamente",
        });
      } catch (error) {
        Toast.show({
          type: "error",
          position: "bottom",
          text1: "Error al tratar de subir estos datos",
        });
      }
      onClose();
    },
  });

  return (
    <ScrollView>
      <Text> </Text>
      <Text> </Text>
      <View style={[styles.row, styles.center]}>
        <Input
          label="Total Personal Servicios"
          // labelStyle={{
          //   // // position: "absolute",
          //   // bottom: 8,
          //   // marginLeft: 10,
          //   // fontSize: 12,
          // }}
          keyboardType="numeric"
          multiline={true}
          onChangeText={(text) => formik.setFieldValue("TotalServicios", text)}
          // errorMessage={formik.errors.displayNameform}
        />
      </View>

      <View style={[styles.row, styles.center]}>
        <Input
          label="Disponible Personal Servicios"
          // labelStyle={{
          //   position: "absolute",
          //   bottom: 8,
          //   marginLeft: 10,
          //   fontSize: 12,
          // }}
          keyboardType="numeric"
          multiline={true}
          onChangeText={(text) => formik.setFieldValue("Servicios", text)}
          // errorMessage={formik.errors.cargo}
        />
      </View>

      <View style={[styles.row, styles.center]}>
        <Input
          label="Total Ingenieria"
          // labelStyle={{
          //   position: "absolute",
          //   bottom: 8,
          //   marginLeft: 10,
          //   fontSize: 12,
          // }}
          keyboardType="numeric"
          multiline={true}
          onChangeText={(text) => formik.setFieldValue("TotalIngenieria", text)}
          // errorMessage={formik.errors.displayNameform}
        />
      </View>

      <View style={[styles.row, styles.center]}>
        <Input
          label="Disponible Ingenieria"
          // labelStyle={{
          //   position: "absolute",
          //   bottom: 8,
          //   marginLeft: 10,
          //   fontSize: 12,
          // }}
          keyboardType="numeric"
          multiline={true}
          onChangeText={(text) => formik.setFieldValue("Ingenieria", text)}
          // errorMessage={formik.errors.cargo}
        />
      </View>

      <Button
        title="Actualizar"
        containerStyle={styles.btnContainer}
        buttonStyle={styles.btn}
        onPress={() => formik.handleSubmit()}
        loading={formik.isSubmitting}
      />
    </ScrollView>
  );
}

const mapStateToProps = (reducers: any) => {
  return {
    user_photo: reducers.profile.user_photo,
    email: reducers.profile.email,
    uid: reducers.profile.uid,
  };
};

const ChangeManPower = connect(mapStateToProps, {
  update_firebaseProfile,
})(ChangeManPowerBare);

export default ChangeManPower;
