import React, { useState } from "react";
import { View } from "react-native";
import { Input, Button } from "@rneui/themed";
import styles from "./ChangeDisplayTitulo.styles";
import SelectExample from "./Selection";
import { connect } from "react-redux";

function ChangeDisplayTituloRaw(props: any) {
  const { onClose, formik, setTitulo, id, idServiciosAIT } = props;
  const [text, setText] = useState("");

  // const filteredData = props.totalActivies.filter(
  //   (item: any) => item.parentCode === "1.1.1.1"
  // );


  return (
    <View>
      <View style={styles.content}>
        <SelectExample
          setText={setText}
          formik={formik}
          id={id}
          idServiciosAIT={idServiciosAIT}
        />
        <Button
          title="Aceptar"
          testID="change-display-titulo"
          containerStyle={styles.btnContainer}
          buttonStyle={styles.btn}
          onPress={() => {
            setTitulo(text.toString());
            formik.setFieldValue("titulo", text.toString());
            onClose();
          }}
          loading={formik.isSubmitting}
        />
      </View>
    </View>
  );
}

// export default ChangeDisplayTitulo;

const mapStateToProps = (reducers: any) => {
  return {
    savePhotoUri: reducers.post.savePhotoUri,
    actualServiceAIT: reducers.post.actualServiceAIT,
    totalActivities: reducers.post.totalActivities,
  };
};

const ChangeDisplayTitulo = connect(
  mapStateToProps,
  {}
)(ChangeDisplayTituloRaw);

export default ChangeDisplayTitulo;
