import React, { useState, useEffect } from "react";
import { View } from "react-native";
import { Input, Button } from "@rneui/themed";
import { useFormik } from "formik";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import Toast from "react-native-toast-message";
import { initialValues, validationSchema } from "./LoginForm.data";
import styles from "./LoginForm.styles";
import { connect } from "react-redux";
import { update_firebaseUserUid } from "@/redux/actions/auth";
import { update_firebaseProfile } from "@/redux/actions/profile";
import { db } from "@/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { saveTotalActivities } from "@/redux/actions/post";
import { MaterialCommunityIcon } from "@/components/MaterialCommunityIcon";

function LoginForm(props: any) {
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();
  const onShowHidePassword = () => setShowPassword((prevState) => !prevState);

  const retrieveData = async () => {
    try {
      const emailPersist = (await AsyncStorage.getItem("emailPersist")) ?? "";
      const passwordPersist =
        (await AsyncStorage.getItem("passwordPersist")) ?? "";

      formik.setFieldValue("email", JSON.parse(emailPersist));
      formik.setFieldValue("password", JSON.parse(passwordPersist));
    } catch (error) {
      console.error("Error retrieving login data:", error);
    }
  };

  useEffect(() => {
    retrieveData();
  }, []);

  const formik = useFormik({
    initialValues: initialValues(),
    validationSchema: validationSchema(),
    validateOnChange: false,
    onSubmit: async (formValue) => {
      try {
        const auth = getAuth();
        const userCredential = await signInWithEmailAndPassword(
          auth,
          formValue.email,
          formValue.password
        );

        const user_uid = userCredential.user.uid;

        const docRef = doc(db, "users", user_uid);
        try {
          const docSnap = (await getDoc(docRef)) ?? null;

          if (docSnap.exists()) {
            props.update_firebaseProfile(docSnap.data()); //redux
            router.push({
              pathname: "/home",
            });
          } else {
            Toast.show({
              type: "error",
              position: "bottom",
              text1: "Actualice sus datos en el perfil para comenzar",
            });
            router.push({
              pathname: "/profile",
            });
          }
        } catch (error) {
          console.error("Error fetching document:", error);
          Toast.show({
            type: "error",
            position: "bottom",
            text1: "Error fetching document",
          });
        }

        props.update_firebaseUserUid(userCredential.user.uid); //redux
        // Add this line
        await AsyncStorage.setItem("authToken", userCredential.user.uid);

        await AsyncStorage.setItem(
          "emailPersist",
          JSON.stringify(formValue.email)
        );
        await AsyncStorage.setItem(
          "passwordPersist",
          JSON.stringify(formValue.password)
        );
      } catch (error) {
        console.error("Error signing in:", error);
        Toast.show({
          type: "error",
          position: "bottom",
          text1: "Usuario o contraseña incorrectos",
        });
      }
    },
  });

  return (
    <View style={styles.content}>
      <Input
        value={formik.values.email}
        placeholder="Correo electronico"
        autoCapitalize="none"
        containerStyle={styles.input}
        rightIcon={<MaterialCommunityIcon name="at" iconStyle={styles.icon} />}
        onChangeText={(text) => formik.setFieldValue("email", text)}
        errorMessage={formik.errors.email}
      />
      <Input
        value={formik.values.password}
        placeholder="Contraseña"
        autoCapitalize="none"
        containerStyle={styles.input}
        secureTextEntry={showPassword ? false : true}
        rightIcon={
          <MaterialCommunityIcon
            name={showPassword ? "eye-off-outline" : "eye-outline"}
            iconStyle={styles.icon}
            onPress={onShowHidePassword}
          />
        }
        onChangeText={(text) => formik.setFieldValue("password", text)}
        errorMessage={formik.errors.password}
      />
      <Button
        title="Iniciar sesión"
        testID="submitButton" // Add testID here
        containerStyle={styles.btnContainer}
        buttonStyle={styles.btn}
        onPress={() => formik.handleSubmit()}
        // onPress={holatu}
        loading={formik.isSubmitting}
      />
    </View>
  );
}

const mapStateToProps = (reducers: any) => {
  return {
    firebase_user_name: reducers.profile.firebase_user_name,
    user_photo: reducers.profile.user_photo,
    email: reducers.profile.email,
    servicesData: reducers.home.servicesData,
  };
};

export const ConnectedLoginForm = connect(mapStateToProps, {
  update_firebaseUserUid,
  update_firebaseProfile,
  saveTotalActivities,
})(LoginForm);
