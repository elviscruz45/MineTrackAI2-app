import React, { useState } from "react";
import { View } from "react-native";
import { Button } from "@rneui/themed";
import styles from "./ChangeTagEquipo.styles";
import TagEquipoSelection from "./TagEquipoSelection";

function ChangeTagEquipo(props: any) {
  const { onClose, formik, setTagequipo } = props;
  const [text, setText] = useState("");

  return (
    <View>
      <View style={styles.content}>
        <TagEquipoSelection setText={setText} />
        <Button
          title="Aceptar"
          containerStyle={styles.btnContainer}
          buttonStyle={styles.btn}
          onPress={() => {
            if (!text) return;
            setTagequipo(text);
            formik.setFieldValue("TagEquipo", text);
            onClose();
          }}
        />
      </View>
    </View>
  );
}

export default ChangeTagEquipo;
