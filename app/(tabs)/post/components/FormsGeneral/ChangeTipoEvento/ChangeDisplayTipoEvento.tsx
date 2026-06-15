import React, { useState } from "react";
import { View } from "react-native";
import { Button } from "@rneui/themed";
import styles from "./ChangeDisplayTipoEvento.styles";
import SelectExample from "./Selection";

function ChangeDisplayTipoEvento(props: any) {
  const { onClose, formik, setTipoEvento } = props;
  const [text, setText] = useState("");

  return (
    <View>
      <View style={styles.content}>
        <SelectExample setText={setText} formik={formik} />
        <Button
          title="Aceptar"
          containerStyle={styles.btnContainer}
          buttonStyle={styles.btn}
          onPress={() => {
            setTipoEvento(text.toString());
            formik.setFieldValue("tipoEvento", text.toString());
            // Reset HSE-specific fields when type changes
            if (text !== "HSE") {
              formik.setFieldValue("clasificacionHSE", "");
            }
            onClose();
          }}
        />
      </View>
    </View>
  );
}

export default ChangeDisplayTipoEvento;
