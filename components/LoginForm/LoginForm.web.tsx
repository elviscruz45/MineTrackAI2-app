import React, { useState, useEffect } from "react";
import { View } from "react-native";
import { Input, Icon, Button } from "../rneui.web";
import { useFormik } from "formik";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import Toast from "react-native-toast-message";
import { initialValues, validationSchema } from "./LoginForm.data";
import styles from "./LoginForm.styles";
import { connect } from "react-redux";
import { update_firebaseUserUid } from "@/redux/actions/auth";
import { router } from "expo-router";

function LoginFormComponent(props: any) {
  const [showPassword, setShowPassword] = useState(false);

  const onShowHidePassword = () => setShowPassword(!showPassword);

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
        // Signed in
        const user = userCredential.user;
        props.update_firebaseUserUid(user.uid);

        router.replace("/home");
      } catch (error: any) {
        Toast.show({
          type: "error",
          position: "bottom",
          text1: "Usuario o Contraseña no valido",
        });
      }
    },
  });

  useEffect(() => {
    console.log("Firebase User UID desde LoginForm:", props.firebaseUserUid);
  }, [props.firebaseUserUid]);

  return (
    <View>
      <Input
        value={formik.values.email}
        placeholder="Correo electronico"
        autoCapitalize="none"
        containerStyle={styles.input}
        rightIcon={
          <Icon type="material-community" name="at" iconStyle={styles.icon} />
        }
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
          <Icon
            type="material-community"
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
        testID="submitButton"
        containerStyle={styles.btnContainer}
        buttonStyle={styles.btn}
        onPress={() => formik.handleSubmit()}
        loading={formik.isSubmitting}
      />
    </View>
  );
}

const mapStateToProps = (reducers: any) => {
  return reducers.authReducer;
};

const mapDispatchToProps = {
  update_firebaseUserUid,
};

export default connect(mapStateToProps, mapDispatchToProps)(LoginFormComponent);
