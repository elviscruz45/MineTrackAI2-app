import React, { useState } from "react";
import { View } from "react-native";
import { Button } from "@rneui/themed";
import styles from "./ChangeDisplayClasificacionHSE.styles";
import SelectExample from "./Selection";

function ChangeDisplayClasificacionHSE(props: any) {
  const { onClose, formik, setClasificacionHSE } = props;
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
            setClasificacionHSE(text.toString());
            formik.setFieldValue("clasificacionHSE", text.toString());
            onClose();
          }}
        />
      </View>
    </View>
  );
}

export default ChangeDisplayClasificacionHSE;
