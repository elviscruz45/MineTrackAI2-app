import React, { useState } from "react";
import { View } from "react-native";
import { Button } from "@rneui/themed";
import styles from "./ChangeDisplayCausa.styles";
import SelectExample from "./Selection";

function ChangeDisplayCausa(props: any) {
  const { onClose, formik, setCausa } = props;
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
            setCausa(text.toString());
            formik.setFieldValue("causa", text.toString());
            onClose();
          }}
        />
      </View>
    </View>
  );
}

export default ChangeDisplayCausa;
