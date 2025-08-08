import { View, Text, Linking, Button, Image } from "react-native";
import React, { useState } from "react";
import styles from "./TitleForms.styles";
import { Input } from "@rneui/themed";
import { Modal } from "@/components/Modal/Modal";
import ChangeDisplayTitulo from "../ChangeTitulo/ChangeDisplayTitulo";
import { connect } from "react-redux";

function TitleFormsBare(props: any) {
  const { formik, id, idServiciosAIT } = props;
  const [renderComponent, setRenderComponent] = useState<any>(null);
  const [showModal, setShowModal] = useState<any>(false);
  const [titulo, setTitulo] = useState<any>("");

  const onCloseOpenModal = () => setShowModal((prevState: any) => !prevState);

  const selectComponent = (key: any) => {
    if (key === "titulo") {
      setRenderComponent(
        <ChangeDisplayTitulo
          onClose={onCloseOpenModal}
          formik={formik}
          setTitulo={setTitulo}
          id={id}
          idServiciosAIT={idServiciosAIT}
        />
      );
    }
    onCloseOpenModal();
  };

  return (
    <View style={styles.equipments}>
      <Image
        source={{
          uri: props.savePhotoUri,
        }}
        style={styles.postPhoto}
      />

      <View style={{}}>
        <Input
          value={formik.values.titulo}
          label="Titulo del Evento"
          // style={{ marginHorizontal: 40 }}
          multiline={true}
          editable={true}
          inputContainerStyle={styles.textArea}
          errorMessage={formik.errors.titulo}
          onChangeText={(text) => {
            formik.setFieldValue("titulo", text);
            setTitulo(text);
          }}
          rightIcon={{
            type: "material-community",
            name: "arrow-right-circle-outline",
            onPress: () => {
              selectComponent("titulo");
            },
          }}
        />
        <Input
          value={formik.values.comentarios}
          label="Comentarios"
          placeholder="Agregar Aqui"
          errorMessage={formik.errors.comentarios}
          multiline={true}
          inputContainerStyle={styles.textArea2}
          onChangeText={(text) => {
            formik.setFieldValue("comentarios", text);
          }} // errorMessage={formik.errors.observacion}
        />
      </View>

      <Modal show={showModal} close={onCloseOpenModal}>
        {renderComponent}
      </Modal>
    </View>
  );
}

const mapStateToProps = (reducers: any) => {
  return {
    savePhotoUri: reducers.post.savePhotoUri,

    actualServiceAIT: reducers.post.actualServiceAIT,
  };
};

const TitleForms = connect(mapStateToProps, {})(TitleFormsBare);

export default TitleForms;
