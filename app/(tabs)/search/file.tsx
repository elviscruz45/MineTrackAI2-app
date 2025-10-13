import React, { useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Linking,
  Alert,
  Platform,
} from "react-native";
import { Image as ImageExpo } from "expo-image";
import styles from "./file.styles";
import { getStorage, ref, deleteObject } from "firebase/storage";
import { screen } from "../../../utils";
import { connect } from "react-redux";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import Toast from "react-native-toast-message";
import { db } from "@/firebaseConfig";
import { doc, updateDoc, arrayUnion, getDoc } from "firebase/firestore";
import { useRouter } from "expo-router";
import { useLocalSearchParams } from "expo-router";

function FileScreenBare(props: any) {
  const { NombreServicio }: any = useLocalSearchParams();

  //const navigation = useNavigation();
  const router = useRouter();

  // const userType = props.profile?.userType;

  const documents = props.actualServiceAIT.pdfFile?.filter((item: any) => {
    return typeof item !== "string";
  });

  const documentsUserType = documents;

  // ?.filter((item: any) => {
  //   return (
  //     (item.tipoFile !== "Cotizacion" && item.tipoFile !== "Orden de compra") ||
  //     userType === "SuperUsuario" ||
  //     userType === "Gerente" ||
  //     userType === "Planificador" ||
  //     userType === "GerenteContratista" ||
  //     userType === "PlanificadorContratista"
  //   );
  // });

  const uploadFile = useCallback(async (uri: any) => {
    try {
      const supported = await Linking.canOpenURL(uri);
      if (supported) {
        await Linking.openURL(uri);
      } else {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "No se puede abrir el documento PDF",
          visibilityTime: 2000,
          autoHide: true,
          topOffset: 30,
          bottomOffset: 40,
        });
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "No se puede abrir el documento PDF",
        visibilityTime: 2000,
        autoHide: true,
        topOffset: 30,
        bottomOffset: 40,
      });
    }
  }, []);

  const goToAddDocsForm = () => {
    router.push({
      pathname: "/search/AddForms",
      // params: { Item: item },
    });
    // navigation.navigate(screen.search.tab, {
    //   screen: screen.search.addDocs,
    //   // params: { Item: item },
    // });
  };

  const deleteDoc = async (item: any) => {
    if (Platform.OS === "web") {
      const confirmed = window.confirm(
        "Estas Seguro que desear Eliminar el evento?"
      );

      if (confirmed) {
        const Ref = doc(
          db,
          "ServiciosAIT",
          props.actualServiceAIT?.idServiciosAIT
        );
        const docSnapshot = await getDoc(Ref);
        const docList = docSnapshot?.data()?.pdfFile;

        const filteredList = docList?.filter(
          (obj: any) => obj.pdfPrincipal !== item?.pdfPrincipal
        );

        const updatedData = {
          pdfFile: filteredList,
        };

        await updateDoc(Ref, updatedData);
      }
    } else {
      Alert.alert(
        "Eliminar Documento",
        "Estas Seguro que desear Eliminar el Documento?",
        [
          {
            text: "Cancelar",
            style: "cancel",
          },
          {
            text: "Aceptar",
            onPress: async () => {
              //updating events in ServiciosAIT to filter the deleted event
              const Ref = doc(
                db,
                "ServiciosAIT",
                props.actualServiceAIT?.idServiciosAIT
              );
              const docSnapshot: any = await getDoc(Ref);
              const eventList = docSnapshot.data().pdfFile;

              const filteredList = eventList.filter(
                (obj: any) =>
                  obj.pdfPrincipal !== props.actualServiceAIT?.pdfPrincipal
              );

              const updatedData = {
                pdfFile: filteredList,
              };

              await updateDoc(Ref, updatedData);

              //delete doc from storage
              const documentPath = `pdfPost/${item.fechaPostFormato}-${item.FilenameTitle}`;
              try {
                const storage = getStorage();
                const storageRef = ref(storage, documentPath);
                await deleteObject(storageRef);
              } catch (error) {
                console.error("Error deleting document:", error);
                // Handle errors as needed
              }

              //send success message
              Toast.show({
                type: "success",
                position: "bottom",
                text1: "Se ha eliminado correctamente",
              });
              router.back();
            },
          },
        ],
        { cancelable: false }
      );
    }
  };

  const openGoogleDriveLink = useCallback(async (uri: any) => {
    try {
      const supported = await Linking.canOpenURL(uri);
      if (supported) {
        await Linking.openURL(uri);
      } else {
        Toast.show({
          type: "error",
          position: "bottom",
          text1: "Este archivo no tiene Documento adjunto",
        });
      }
    } catch (error) {
      Toast.show({
        type: "error",
        position: "bottom",
        text1: "Este archivo no tiene Documento adjunto",
      });
    }
  }, []);

  return (
    <KeyboardAwareScrollView
      style={{ backgroundColor: "white" }} // Add backgroundColor here
    >
      <Text> </Text>

      <Text style={styles.name}>{NombreServicio}</Text>
      <Text> </Text>
      <TouchableOpacity onPress={() => goToAddDocsForm()}>
        <ImageExpo
          source={require("../../../assets/pictures/AddIcon2.png")}
          style={styles.image3}
          cachePolicy={"memory-disk"}
        />
      </TouchableOpacity>

      <FlatList
        data={documentsUserType}
        scrollEnabled={false}
        renderItem={({ item }) => {
          // confirmation if the requestment is a drive document:
          const inputString = item.comentario;
          const pattern = /https?:\/\/(www\.)?/i; // Matches any Google Drive link
          const isDriveDoc = pattern.test(inputString);

          //config image
          const imagePdf = require("../../../assets/images/pdf4.png");
          const imageDrive = require("../../../assets/images/drive.png");
          const imagePng = require("../../../assets/images/imageIcon.png");
          const imageDoc = require("../../../assets/images/docImage.png");
          const imageXls = require("../../../assets/images/excelImage.jpeg");

          //titulo
          const fileExtension = item.FilenameTitle?.split(".").pop();

          return (
            <View style={{ marginBottom: 20 }}>
              <View style={styles.equipments2}>
                <TouchableOpacity
                  onPress={() =>
                    item.pdfPrincipal && uploadFile(item.pdfPrincipal)
                  }
                  onLongPress={
                    props.email === item.email
                      ? () => deleteDoc(item)
                      : () => {}
                  }
                >
                  <ImageExpo
                    source={
                      isDriveDoc
                        ? imageDrive
                        : fileExtension === "png" ||
                          fileExtension === "jpg" ||
                          fileExtension === "jpeg"
                        ? imagePng
                        : fileExtension === "xls" ||
                          fileExtension === "xlsx" ||
                          fileExtension === "csv"
                        ? imageXls
                        : fileExtension === "doc" || fileExtension === "docx"
                        ? imageDoc
                        : imagePdf
                    }
                    style={styles.image2}
                    cachePolicy={"memory-disk"}
                  />
                </TouchableOpacity>

                <View>
                  {item.FilenameTitle && (
                    <View style={[{ flexDirection: "row" }]}>
                      <Text style={{ fontWeight: "bold" }}>{"Titulo: "}</Text>
                      <Text style={[styles.info2, { marginRight: "30%" }]}>
                        {item.FilenameTitle}
                      </Text>
                    </View>
                  )}
                  <View style={[{ flexDirection: "row" }]}>
                    <Text style={{ fontWeight: "bold" }}>
                      {"Tipo de Documento: "}
                    </Text>
                    <Text style={styles.info2}>{item.tipoFile}</Text>
                  </View>

                  {isDriveDoc && (
                    <View style={[{ flexDirection: "row" }]}>
                      <Text style={{ fontWeight: "bold" }}>{"Link: "}</Text>
                      <Text
                        style={styles.info2}
                        selectable={true}
                        onPress={() => openGoogleDriveLink(item.comentario)}
                      >
                        {item.comentario}
                      </Text>
                    </View>
                  )}

                  <View style={[{ flexDirection: "row" }]}>
                    <Text style={{ fontWeight: "bold" }}>{"Autor: "}</Text>
                    <Text style={styles.info2}>{item.email}</Text>
                  </View>

                  <View style={[{ flexDirection: "row" }]}>
                    <Text style={{ fontWeight: "bold" }}>{"Fecha: "}</Text>
                    <Text style={{}}>
                      {item.fechaPostFormato || "No definido"}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          );
        }}
        keyExtractor={(item, index) => `${index}-${item.pdfPrincipal}`} // Provide a unique key for each item
      />
    </KeyboardAwareScrollView>
  );
}

const mapStateToProps = (reducers: any) => {
  return {
    email: reducers.profile.email,
    profile: reducers.profile.profile,
    actualServiceAIT: reducers.post.actualServiceAIT,

    // servicesData: reducers.home.servicesData,
    // totalEventServiceAITLIST: reducers.home.totalEventServiceAITLIST,
  };
};

const FileScreen = connect(mapStateToProps, {})(FileScreenBare);

export default FileScreen;
