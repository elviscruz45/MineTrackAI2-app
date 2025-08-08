import React, { useState } from "react";
import { View } from "react-native";
import { Input, Button } from "@rneui/themed";
import  styles  from "./ChangeDisplayMonto.styles";
import Toast from "react-native-toast-message";

 function ChangeDisplayMonto(props: any) {
  const { onClose, setMonto, formik } = props;
  const [text, setText] = useState<any>("0");
  return (
    <View>
      <View style={styles.content}>
        <Input
          placeholder="Monto de cotizacion"
          testID="ChangeDisplayMonto:Input"
          value={text}
          // editable={true}
          keyboardType="numeric"
          onChangeText={(text) => setText(text)}
          // errorMessage={formik.errors.NumeroAIT}
        />
        <Button
          title="Aceptar"
          testID="ChangeDisplayMonto:Button"
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
              setMonto(text.toString());
              formik.setFieldValue("Monto", text.toString());

              onClose();
            }
          }}
        />
      </View>
    </View>
  );
}
export default ChangeDisplayMonto;