import {
  View,
  Text,
  TouchableOpacity,
  Image,
  FlatList,
  useWindowDimensions,
} from "react-native";
import React, { useMemo, useState } from "react";
import { createGeneralFormsStyles } from "./GeneralForms.styles";
import { Input, Button } from "@rneui/themed";
import * as DocumentPicker from "expo-document-picker";
import { Modal } from "../../../../../components/Modal/Modal";
import ChangeDisplayMonto from "../FormsGeneral/ChangeNumeroMonto/ChangeDisplayMonto";
import ChangeDisplayFechaFin from "../FormsGeneral/ChangeFechaFin/ChangeDisplayFechaFin";
import ChangeDisplayHH from "../FormsGeneral/ChangeNumeroHH/ChangeDisplayHH";
import ChangeDisplayFileTipo from "../FormsGeneral/ChangeFIleTipo/ChangeDisplayFileTipo";
import ChangeDisplayVisibility from "../FormsGeneral/ChangeVisibility/ChangeDisplayVisibility";
import ChangeDisplayCausa from "../FormsGeneral/ChangeCausa/ChangeDisplayCausa";
import ChangeDisplayTipoEvento from "../FormsGeneral/ChangeTipoEvento/ChangeDisplayTipoEvento";
import ChangeDisplayClasificacionHSE from "../FormsGeneral/ChangeClasificacionHSE/ChangeDisplayClasificacionHSE";
import { connect } from "react-redux";
import { userTypeList } from "../../../../../utils/userTypeList";
import Toast from "react-native-toast-message";
import * as ImagePicker from "expo-image-picker";
import { Image as ImageExpo } from "expo-image";
// import * as ImageManipulator from "expo-image-manipulator";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
import * as ImageManipulator from "expo-image-manipulator";

function GeneralFormsBare(props: any) {
  const { width: windowWidth } = useWindowDimensions();
  const styles = useMemo(
    () => createGeneralFormsStyles(windowWidth),
    [windowWidth],
  );
  const { formik, setMoreImages, agregarImagenes, initialImages, allowAddImages } =
    props;
  const [renderComponent, setRenderComponent] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [fechafin, setFechafin] = useState(null);
  const [monto, setMonto] = useState(null);
  const [horashombre, setHorashombre] = useState(null);
  const [aditional, setAditional] = useState(false);
  const [tipoFile, setTipoFile] = useState("");
  const [visibilidad, setVisibilidad] = useState("");
  const [causa, setCausa] = useState("");
  const [tipoEvento, setTipoEvento] = useState("");
  const [clasificacionHSE, setClasificacionHSE] = useState("");
  const [shortNameFileUpdated, setShortNameFileUpdated] = useState("");
  const [images, setImages] = useState<string[]>(initialImages ?? []);
  const [pdfFileURL, setPdfFileURL] = useState("");

  React.useEffect(() => {
    if (initialImages?.length) {
      setImages(initialImages);
      setMoreImages?.(initialImages);
    }
  }, [initialImages, setMoreImages]);

  //Data about the company belong this event
  const regex = /@(.+?)\./i;
  const companyName = props.email?.match(regex)?.[1] || "";

  // //configuring the name of the pdf file to make it readable
  // let shortNameFile = "";

  //algorith to pick a pdf File to attach to the event
  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
        copyToCacheDirectory: true,
      });
      const asset = result.canceled ? null : result.assets?.[0];
      if (asset) {
        const name = asset.name ?? "documento.pdf";
        setShortNameFileUpdated(name);
        formik.setFieldValue("pdfFile", asset.uri);
        formik.setFieldValue("pdfFileSource", asset.file ?? null);
        setPdfFileURL(asset.uri);
        formik.setFieldValue("FilenameTitle", name);
      } else {
        setShortNameFileUpdated("");
        formik.setFieldValue("pdfFile", "");
        formik.setFieldValue("pdfFileSource", null);
        setPdfFileURL("");
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
    if (key === "tipoFile") {
      setRenderComponent(
        <ChangeDisplayFileTipo
          onClose={onCloseOpenModal}
          formik={formik}
          setTipoFile={setTipoFile}
        />,
      );
    }
    if (key === "MontoModificado") {
      setRenderComponent(
        <ChangeDisplayMonto
          onClose={onCloseOpenModal}
          formik={formik}
          setMonto={setMonto}
        />,
      );
    }
    if (key === "NuevaFechaEstimada") {
      setRenderComponent(
        <ChangeDisplayFechaFin
          onClose={onCloseOpenModal}
          formik={formik}
          setFechafin={setFechafin}
        />,
      );
    }
    if (key === "HHModificado") {
      setRenderComponent(
        <ChangeDisplayHH
          onClose={onCloseOpenModal}
          formik={formik}
          setHorashombre={setHorashombre}
        />,
      );
    }
    if (key === "causa") {
      setRenderComponent(
        <ChangeDisplayCausa
          onClose={onCloseOpenModal}
          formik={formik}
          setCausa={setCausa}
        />,
      );
    }
    if (key === "tipoEvento") {
      setRenderComponent(
        <ChangeDisplayTipoEvento
          onClose={onCloseOpenModal}
          formik={formik}
          setTipoEvento={setTipoEvento}
        />,
      );
    }
    if (key === "clasificacionHSE") {
      setRenderComponent(
        <ChangeDisplayClasificacionHSE
          onClose={onCloseOpenModal}
          formik={formik}
          setClasificacionHSE={setClasificacionHSE}
        />,
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
          { compress: 0.4, format: SaveFormat.JPEG, base64: true },
        );
        return resizedPhoto.uri;
      });

      uriImages = await Promise.all(imageManipulationPromises);
    }
    setImages((prev) => [...prev, ...uriImages]);
    setMoreImages?.((prev: string[]) => [...(prev ?? []), ...uriImages]);
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
      <View style={styles.container}>
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

        <Input
          value={formik.values.tipoEvento}
          label="Tipo de Evento"
          editable={false}
          rightIcon={{
            type: "material-community",
            name: "arrow-right-circle-outline",
            onPress: () => selectComponent("tipoEvento"),
          }}
        />

        <Input
          value={formik.values.causa}
          label="Causa del evento"
          editable={false}
          rightIcon={{
            type: "material-community",
            name: "arrow-right-circle-outline",
            onPress: () => selectComponent("causa"),
          }}
        />

        {tipoEvento === "HSE" && (
          <Input
            value={formik.values.clasificacionHSE}
            label="Clasificación HSE"
            editable={false}
            rightIcon={{
              type: "material-community",
              name: "arrow-right-circle-outline",
              onPress: () => selectComponent("clasificacionHSE"),
            }}
          />
        )}

        {(tipoEvento === "HSE" || tipoEvento === "Técnico") && (
          <>
            <Text style={styles.hseGroupLabel}>
              Impacto operacional (HSE / Técnico)
            </Text>
            <Input
              label="Componente afectado"
              placeholder="Ej. motor principal, correa transportadora, válvula…"
              value={formik.values.equipoAfectado}
              onChangeText={(text) =>
                formik.setFieldValue("equipoAfectado", text)
              }
            />
            <Input
              label="Horas perdidas"
              value={formik.values.horasPerdidas}
              keyboardType="numeric"
              onChangeText={(text) => {
                const numericText = text.replace(/[^0-9.]/g, "");
                formik.setFieldValue("horasPerdidas", numericText);
              }}
            />
          </>
        )}
        <Input
          value={shortNameFileUpdated}
          label="Adjuntar PDF (Opcional)"
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
        <Text> </Text>

        {(agregarImagenes !== "editar" || allowAddImages) && (
          <View style={styles.pickImagesButton}>
            <Button
              title="Agregar imágenes"
              onPress={pickImages}
              buttonStyle={styles.pickImagesBtn}
              titleStyle={styles.pickImagesBtnTitle}
            />
          </View>
        )}

        <FlatList
          style={styles.imageStrip}
          horizontal
          showsHorizontalScrollIndicator={false}
          data={images}
          renderItem={({ item }) => (
            <View>
              <ImageExpo
                source={{ uri: item }}
                style={styles.thumb}
                contentFit="cover"
              />
            </View>
          )}
          keyExtractor={(_, index) => `${index}`}
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
