import React, { useState } from "react";
import { View } from "react-native";
import { Input, Button } from "@rneui/themed";

import  styles  from "./ChangeDisplayEmpresaMinera.styles";
import  SelectExample  from "./Selection";

 function ChangeDisplayEmpresaMinera(props: any) {
  const { onClose, formik, setMinera } = props;
  const [text, setText] = useState("");

  return (
    <View>
      <View style={styles.content}>
        <SelectExample formik={formik} setText={setText} />
        <Button
          title="Aceptar"
          testID="ChangeDisplayEmpresaMinera:Button2"
          containerStyle={styles.btnContainer}
          buttonStyle={styles.btn}
          onPress={() => {
            setMinera(text.toString());
            formik.setFieldValue("EmpresaMinera", text.toString());
            onClose();
          }}
          // loading={formik2.isSubmitting}
        />
      </View>
    </View>
  );
}

export default ChangeDisplayEmpresaMinera;