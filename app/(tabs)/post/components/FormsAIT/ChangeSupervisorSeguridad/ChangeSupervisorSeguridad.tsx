import React, { useState } from "react";
import { View } from "react-native";
import { Input, Button } from "@rneui/themed";
import  styles  from "./ChangeSupervisorSeguridad.styles";
import Toast from "react-native-toast-message";

 function ChangeSupervisorSeguridad(props: any) {
  const { onClose, setSupervisorSeguridad, formik } = props;
  const [text, setText] = useState<any>("");

  return (
    <View>
      <View style={styles.content}>
        <Input
          value={text}
          testID="ChangeDisplayHH:Input"
          placeholder="# Supervisores de seguridad"
          // editable={true}
          keyboardType="numeric"
          onChangeText={(text) => setText(text)}
          // errorMessage={formik.errors.NumeroAIT}
        />
        <Button
          title="Aceptar"
          testID="ChangeDisplayHH:Button"
          containerStyle={styles.btnContainer}
          buttonStyle={styles.btn}
          onPress={() => {
            if (isNaN(text)) {
              Toast.show({
                type: "error",
                position: "bottom",
                text1: "Ingrese un número válido",
              });
              onClose();
            } else if (text.trim() === "" || text < 0) {
              Toast.show({
                type: "error",
                position: "bottom",
                text1: "Solo numeros mayores a 0",
              });
              onClose();
            } else {
              setSupervisorSeguridad(text.toString());
              formik.setFieldValue("SupervisorSeguridad", text.toString());

              onClose();
            }
          }}
          // loading={formik.isSubmitting}
        />
      </View>
    </View>
  );
}

export default ChangeSupervisorSeguridad;