import { View, Image } from "react-native";
import React, { useMemo, useState } from "react";
import { createTitleFormsStyles } from "./TitleForms.styles";
import { Input } from "@rneui/themed";
import { MaterialCommunityIcon } from "@/components/MaterialCommunityIcon";
import { Modal } from "@/components/Modal/Modal";
import ChangeDisplayTitulo from "../ChangeTitulo/ChangeDisplayTitulo";
import { connect } from "react-redux";
import { useWindowDimensions } from "react-native";

function TitleFormsBare(props: any) {
  const { width: windowWidth } = useWindowDimensions();
  const styles = useMemo(
    () => createTitleFormsStyles(windowWidth),
    [windowWidth],
  );
  const { formik, id, idServiciosAIT, photoUri } = props;
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
        />,
      );
    }
    onCloseOpenModal();
  };

  return (
    <View style={styles.equipments}>
      <Image
        source={{
          uri: photoUri || props.savePhotoUri,
        }}
        style={styles.postPhoto}
        resizeMode="cover"
      />

      <View style={styles.formColumn}>
        <Input
          value={formik.values.titulo}
          label="Título del evento"
          multiline
          editable
          inputContainerStyle={styles.textArea}
          errorMessage={formik.errors.titulo}
          onChangeText={(text) => {
            formik.setFieldValue("titulo", text);
            setTitulo(text);
          }}
          rightIcon={
            <MaterialCommunityIcon
              name="arrow-right-circle-outline"
              color="#c2c2c2"
              onPress={() => selectComponent("titulo")}
            />
          }
        />
        <Input
          value={formik.values.comentarios}
          label="Comentarios"
          placeholder="Describe lo ocurrido, acciones tomadas y observaciones…"
          errorMessage={formik.errors.comentarios}
          multiline
          inputContainerStyle={styles.textArea2}
          onChangeText={(text) => {
            formik.setFieldValue("comentarios", text);
          }}
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
