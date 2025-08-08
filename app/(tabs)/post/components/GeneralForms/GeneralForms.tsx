import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Button,
  FlatList,
  KeyboardAvoidingView,
  Dimensions,
} from "react-native";
import React, { useState } from "react";
import styles from "./GeneralForms.styles";
import { Input } from "@rneui/themed";
import * as DocumentPicker from "expo-document-picker";
import { Modal } from "../../../../../components/Modal/Modal";
import ChangeDisplayEtapa from "../FormsGeneral/ChangeEtapa/ChangeDisplayEtapa";
import ChangeDisplayAvance from "../FormsGeneral/ChangeAvance/ChangeDisplayAvance";
import ChangeDisplayAprobadores from "../FormsGeneral/ChangeAprobadores/ChangeDisplayAprobadores";
import ChangeDisplayMonto from "../FormsGeneral/ChangeNumeroMonto/ChangeDisplayMonto";
import ChangeDisplayFechaFin from "../FormsGeneral/ChangeFechaFin/ChangeDisplayFechaFin";
import ChangeDisplayHH from "../FormsGeneral/ChangeNumeroHH/ChangeDisplayHH";
import ChangeDisplayFileTipo from "../FormsGeneral/ChangeFIleTipo/ChangeDisplayFileTipo";
import ChangeDisplayVisibility from "../FormsGeneral/ChangeVisibility/ChangeDisplayVisibility";
import { connect } from "react-redux";
import { userTypeList } from "../../../../../utils/userTypeList";
import Toast from "react-native-toast-message";
import * as ImagePicker from "expo-image-picker";
import { Image as ImageExpo } from "expo-image";
// import * as ImageManipulator from "expo-image-manipulator";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
import * as ImageManipulator from "expo-image-manipulator";

const windowWidth = Dimensions.get("window").width;

function GeneralFormsBare(props: any) {
  const { formik, setMoreImages, agregarImagenes } = props;
  const [pickedDocument, setPickedDocument] = useState(null);
  const [renderComponent, setRenderComponent] = useState<any>(null);
  const [aprobadores, setAprobadores] = useState("");
  const [etapa, setEtapa] = useState<string>("");
  const [avance, setAvance] = useState<string>("");
  const [showModal, setShowModal] = useState(false);
  const [fechafin, setFechafin] = useState(null);
  const [monto, setMonto] = useState(null);
  const [horashombre, setHorashombre] = useState(null);
  const [aditional, setAditional] = useState(false);
  const [tipoFile, setTipoFile] = useState("");
  const [visibilidad, setVisibilidad] = useState("");
  const [shortNameFileUpdated, setShortNameFileUpdated] = useState("");
  const [images, setImages] = useState([]);
  const [pdfFileURL, setPdfFileURL] = useState("");

  //Data about the company belong this event
  const regex = /@(.+?)\./i;
  const companyName = props.email?.match(regex)?.[1] || "";

  // //configuring the name of the pdf file to make it readable
  // let shortNameFile = "";

  //algorith to pick a pdf File to attach to the event
  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: false,
      });
      if (result.assets) {
        setShortNameFileUpdated(result?.assets[0]?.name);
        formik.setFieldValue("pdfFile", result?.assets[0]?.uri);
        setPdfFileURL(result?.assets[0]?.uri);

        formik.setFieldValue("FilenameTitle", result?.assets[0]?.name);
      } else {
        setShortNameFileUpdated("");
      }
    } catch (err) {
      Toast.show({
        type: "error",
        position: "bottom",
        text1: "Error al adjuntar el documento",
      });
    }
  };
  const onCloseOpenModal = () => setShowModal((prevState) => !prevState);

  ///function to date format
  const formatdate = (item: any) => {
    const date = new Date(item);
    const monthNames = [
      "de enero del",
      "de febrero del",
      "de marzo del",
      "de abril del",
      "de mayo del",
      "de junio del",
      "de julio del",
      "de agosto del",
      "de septiembre del",
      "de octubre del",
      "de noviembre del",
      "de diciembre del",
    ];
    const day = date.getDate();
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    const hour = date.getHours();
    const minute = date.getMinutes();
    const formattedDate = `${day} ${month} ${year} `;
    const fechaPostFormato = formattedDate;
    return fechaPostFormato;
  };

  //function to format money
  const formatNumber = (item: any) => {
    const amount = item;
    const formattedAmount = new Intl.NumberFormat("en-US").format(amount);
    return formattedAmount;
  };

  const selectComponent = (key: string) => {
    if (key === "visibilidad") {
      setRenderComponent(
        <ChangeDisplayVisibility
          onClose={onCloseOpenModal}
          formik={formik}
          setVisibilidad={setVisibilidad}
        />
      );
    }
    if (key === "etapa") {
      setRenderComponent(
        <ChangeDisplayEtapa
          onClose={onCloseOpenModal}
          formik={formik}
          setEtapa={setEtapa}
          setAprobadores={setAprobadores}
          etapa={etapa}
        />
      );
    }
    if (key === "tipoFile") {
      setRenderComponent(
        <ChangeDisplayFileTipo
          onClose={onCloseOpenModal}
          formik={formik}
          setTipoFile={setTipoFile}
        />
      );
    }
    if (key === "porcentajeAvance") {
      setRenderComponent(
        <ChangeDisplayAvance
          onClose={onCloseOpenModal}
          formik={formik}
          setAvance={setAvance}
        />
      );
    }
    if (key === "aprobacion") {
      setRenderComponent(
        <ChangeDisplayAprobadores
          onClose={onCloseOpenModal}
          formik={formik}
          setAprobadores={setAprobadores}
          etapa={etapa}
        />
      );
    }
    if (key === "MontoModificado") {
      setRenderComponent(
        <ChangeDisplayMonto
          onClose={onCloseOpenModal}
          formik={formik}
          setMonto={setMonto}
        />
      );
    }
    if (key === "NuevaFechaEstimada") {
      setRenderComponent(
        <ChangeDisplayFechaFin
          onClose={onCloseOpenModal}
          formik={formik}
          setFechafin={setFechafin}
        />
      );
    }
    if (key === "HHModificado") {
      setRenderComponent(
        <ChangeDisplayHH
          onClose={onCloseOpenModal}
          formik={formik}
          setHorashombre={setHorashombre}
        />
      );
    }
    onCloseOpenModal();
  };

  //method to retrieve the picture required in the event post (pick Imagen, take a photo)
  const pickImages = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images", "videos"],
      // allowsEditing: true,
      allowsMultipleSelection: true,
      selectionLimit: 7,
      aspect: [4, 3],
      quality: 1,
    });
    let uriImages: any = [];

    if (!result.canceled) {
      const imageManipulationPromises = result?.assets?.map(async (item) => {
        const resizedPhoto = await ImageManipulator.manipulateAsync(
          item.uri,
          [{ resize: { width: 800 } }],
          { compress: 0.4, format: SaveFormat.JPEG, base64: true }
        );
        return resizedPhoto.uri;
      });

      uriImages = await Promise.all(imageManipulationPromises);
    }
    setImages(uriImages);
    setMoreImages(uriImages);
    // setImages(result.assets ? [result.assets] : result.assets);

    // const resizedPhoto = await ImageManipulator.manipulateAsync(
    //   result.assets[0].uri,
    //   [{ resize: { width: 800 } }],
    //   { compress: 0.1, format: "jpeg", base64: true }
    // );
    // setImages(resizedPhoto.uri ? [resizedPhoto.uri] : resizedPhoto.selected);
    // props.savePhotoUri(resizedPhoto.uri);
    // navigation.navigate(screen.post.form);
    // setEquipment(null);
    // }
  };

  return (
    <>
      <View
        style={{
          backgroundColor: "white",
          width: windowWidth > 1000 ? "55%" : "100%",
          alignSelf: "center",
        }} // Add backgroundColor here
      >
        {formik?.values?.titulo == "Tareo" && (
          <>
            <Input
              label="Cantidad supervisores"
              value={formik.values.supervisores}
              keyboardType="numeric"
              onChangeText={(text) => {
                const numericText = text.replace(/[^0-9]/g, "");
                formik.setFieldValue("supervisores", numericText);
              }}
            />
            <Input
              label="Cantidad HSE"
              value={formik.values.HSE}
              keyboardType="numeric"
              onChangeText={(text) => {
                const numericText = text.replace(/[^0-9]/g, "");
                formik.setFieldValue("HSE", numericText);
              }}
            />
            <Input
              label="Cantidad Lider Tecnico"
              value={formik.values.liderTecnico}
              keyboardType="numeric"
              onChangeText={(text) => {
                const numericText = text.replace(/[^0-9]/g, "");
                formik.setFieldValue("liderTecnico", numericText);
              }}
            />
            <Input
              label="Cantidad Soldador"
              value={formik.values.soldador}
              keyboardType="numeric"
              onChangeText={(text) => {
                const numericText = text.replace(/[^0-9]/g, "");
                formik.setFieldValue("soldador", numericText);
              }}
            />
            <Input
              label="Cantidad Tecnico"
              value={formik.values.tecnico}
              keyboardType="numeric"
              onChangeText={(text) => {
                const numericText = text.replace(/[^0-9]/g, "");
                formik.setFieldValue("tecnico", numericText);
              }}
            />
            <Input
              label="Cantidad Ayudante"
              value={formik.values.ayudante}
              keyboardType="numeric"
              onChangeText={(text) => {
                const numericText = text.replace(/[^0-9]/g, "");
                formik.setFieldValue("ayudante", numericText);
              }}
            />
          </>
        )}
        {/* <Input
          value={formik.values.id}
          label="ID del Evento"
          editable={true}
          keyboardType="numeric"
          // errorMessage={formik.errors.etapa}
          onChangeText={(text) => {
            const numericText = text.replace(/[^0-9.]/g, "");
            formik.setFieldValue("id", numericText);
          }}
        /> */}
        {agregarImagenes !== "editar" && (
          <Input
            value={formik.values.etapa}
            label="Etapa del Evento"
            editable={false}
            errorMessage={formik.errors.etapa}
            rightIcon={{
              type: "material-community",
              name: "arrow-right-circle-outline",
              onPress: () => selectComponent("etapa"),
            }}
          />
        )}
        {/* {(formik.values.etapa === "Avance Ejecucion" ||
          formik.values.etapa === "Avance Ejecucion" ||
          etapa === "Solicitud Aprobacion Doc" ||
          etapa === "Aprobacion Doc" ||
          etapa === "Solicitud Ampliacion Servicio" ||
          etapa === "Aprobacion Ampliacion" ||
          etapa === "Stand by" ||
          etapa === "Cancelacion") && ( */}

        <Input
          value={`${formik.values.porcentajeAvance} %`}
          label="Avance de ejecucion (0 a 100)"
          editable={false}
          // errorMessage={formik.errors.porcentajeAvance}
          rightIcon={{
            type: "material-community",
            name: "arrow-right-circle-outline",
            onPress: () => selectComponent("porcentajeAvance"),
          }}
        />

        {/* )} */}
        {(etapa === "Envio Solicitud Servicio" ||
          etapa === "Envio Cotizacion" ||
          etapa === "Solicitud Aprobacion Doc" ||
          etapa === "Solicitud Ampliacion Servicio" ||
          etapa === "Envio EDP") && (
          <Input
            value={formik.values.aprobacion}
            label="Aprobador"
            editable={false}
            multiline={true}
            // errorMessage={formik.errors.aprobacion}
            rightIcon={{
              type: "material-community",
              name: "arrow-right-circle-outline",
              onPress: () => selectComponent("aprobacion"),
            }}
          />
        )}

        {/* <Text style={styles.subtitleForm}>Opcional</Text> */}

        {/* <Input
          label="Visibilidad del evento"
          value={formik.values.visibilidad}
          editable={false}
          // errorMessage={formik.errors.visibilidad}
          rightIcon={{
            type: "material-community",
            name: "arrow-right-circle-outline",
            onPress: () => selectComponent("visibilidad"),
          }}
        /> */}

        {(formik.values.etapa === "Envio Solicitud Servicio" ||
          formik.values.etapa === "Solicitud Aprobacion Doc" ||
          formik.values.etapa === "Envio Cotizacion") && (
          <Input
            value={shortNameFileUpdated}
            label="Adjuntar PDF"
            multiline={true}
            editable={false}
            rightIcon={{
              type: "material-community",
              name: "arrow-right-circle-outline",
              onPress: () => {
                pickDocument();
              },
            }}
          />
        )}

        {shortNameFileUpdated && (
          <Input
            value={formik.values.tipoFile}
            label="Tipo de Archivo Adjunto"
            multiline={true}
            editable={false}
            rightIcon={{
              type: "material-community",
              name: "arrow-right-circle-outline",
              onPress: () => selectComponent("tipoFile"),
            }}
          />
        )}

        <Text> </Text>

        {agregarImagenes !== "editar" && (
          <View style={styles.pickImagesButton}>
            <Button title="Agregar Imagenes" onPress={pickImages} />
          </View>
        )}

        <FlatList
          style={{
            backgroundColor: "white",
            paddingTop: 10,
            paddingVertical: 10,
          }}
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          data={images}
          renderItem={({ item }) => {
            return (
              <View>
                <ImageExpo
                  source={{ uri: item }}
                  style={{
                    marginLeft: 20,
                    width: 80,
                    height: 80,
                    // borderRadius: 80,
                    // borderWidth: 0.3,
                  }}
                  // cachePolicy={"memory-disk"}
                />
              </View>
            );
          }}
          keyExtractor={(index) => `${index}`}
        />
      </View>

      <Modal show={showModal} close={onCloseOpenModal}>
        {renderComponent}
      </Modal>
    </>
  );
}

const mapStateToProps = (reducers: any) => {
  return {
    profile: reducers.profile.profile,
    email: reducers.profile.email,
  };
};

const GeneralForms = connect(mapStateToProps, {})(GeneralFormsBare);
export default GeneralForms;
