import React, { useEffect, useState, useCallback } from "react";
import {
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Dimensions,
  Linking,
  TextInput,
  Alert,
  ScrollView,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { connect } from "react-redux";
import { Icon } from "@rneui/themed";
import { styles } from "./_styles/comment.styles";
import {
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  onSnapshot,
  getDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "@/firebaseConfig";
import { saveActualPostFirebase } from "../../../redux/actions/post";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Image as ImageExpo } from "expo-image";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { screen } from "../../../utils";
import Toast from "react-native-toast-message";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Platform } from "react-native";

function CommentScreen(props: any) {
  let totalEventServiceAITLIST;
  const router = useRouter();
  const {
    AITidServicios,
    fechaPostFormato,
    pdfPrincipal,
    visibilidad,
    fotoPrincipal,
    AITNombreServicio,
    emailPerfil,
    idDocFirestoreDB,
    titulo,
    comentarios,
    totalHH,
    supervisores,
    HSE,
    liderTecnico,
    soldador,
    tecnico,
    ayudante,
  }: any = useLocalSearchParams();

  const [postsComments, setPostsComments] = useState<any>([]);
  const [comment, setComment] = useState("");
  const [newImages, setNewImages] = useState([]);

  // go to edit screen
  const goToEditEventScreen = () => {
    router.push({
      pathname: "/home/EditEvent",
      params: {
        idDocFirestoreDB: idDocFirestoreDB,
        AITidServicios: AITidServicios,
        fechaPostFormato: fechaPostFormato,
        pdfPrincipal: pdfPrincipal,
        visibilidad: visibilidad,
        fotoPrincipal: fotoPrincipal.replace(/%2F/g, "abcdefg"),
        AITNombreServicio: AITNombreServicio,
        emailPerfil: emailPerfil,
        titulo: titulo,
        comentarios: comentarios,
      },
    });
  };

  useEffect(() => {
    totalEventServiceAITLIST = props.totalEventServiceAITLIST;

    let EventServiceITEM = totalEventServiceAITLIST?.filter(
      (item: any) => item.idDocFirestoreDB === idDocFirestoreDB
    );
    setPostsComments(EventServiceITEM?.[0]?.comentariosUsuarios);
    setNewImages(EventServiceITEM?.[0]?.newImages);
  }, [props.totalEventServiceAITLIST]);

  //---This is used to get the attached file in the post that contain an attached file---
  const uploadFile = useCallback(async (uri: any) => {
    try {
      const supported = await Linking.canOpenURL(uri);
      if (supported) {
        await Linking.openURL(uri);
      } else {
        Toast.show({
          type: "error",
          position: "bottom",
          text1: "No se pudo abrir el documento",
        });
      }
    } catch (error) {
      Toast.show({
        type: "error",
        position: "bottom",
        text1: "Error al abrir el documento",
      });
    }
  }, []);

  const handleCommentChange = (text: any) => {
    setComment(text);
  };

  const handleSendComment = async (comment: any) => {
    // Send the comment to Firebase
    // Check if the comment parameter is empty or contains only spaces
    if (comment.trim() === "") {
      return;
    }

    const PostRef = doc(db, "events", idDocFirestoreDB);
    const commentObj = {
      comment: comment,
      commenterEmail: props.email,
      commenterName: props.firebase_user_name,
      commenterPhoto: props.user_photo,
      date: new Date().getTime(),
    };
    await updateDoc(PostRef, {
      comentariosUsuarios: arrayUnion(commentObj),
    });
    // Clear the comment input
    setComment("");
  };

  // goToServiceInfo
  const goToServiceInfo = () => {};

  //Delete function
  const docDelete = async (idDoc: any) => {
    if (Platform.OS === "web") {
      const confirmed = window.confirm(
        "Estas Seguro que desear Eliminar el evento?"
      );
      if (confirmed) {
        //delete the doc from events collections
        router.back();
        await deleteDoc(doc(db, "events", idDoc));
      }
    } else {
      Alert.alert(
        "Eliminar Evento",
        "Estas Seguro que desear Eliminar el evento?",
        [
          {
            text: "Cancelar",
            style: "cancel",
          },
          {
            text: "Aceptar",
            onPress: async () => {
              //delete the doc from events collections
              // navigation.navigate(screen.home.home);

              await deleteDoc(doc(db, "events", idDoc));
              //updating events in ServiciosAIT to filter the deleted event
              const Ref = doc(db, "ServiciosAIT", AITidServicios);
              const docSnapshot: any = await getDoc(Ref);
              const eventList = docSnapshot.data().events;

              const filteredList = eventList?.filter(
                (obj: any) => obj.idDocFirestoreDB !== idDocFirestoreDB
              );

              const updatedData = {
                events: filteredList,
              };

              await updateDoc(Ref, updatedData);
              Toast.show({
                type: "success",
                position: "bottom",
                text1: "Se ha eliminado correctamente",
              });
            },
          },
        ],
        { cancelable: false }
      );
    }
  };

  if (!postsComments) {
    return <LoadingSpinner />;
  } else {
    return (
      <KeyboardAwareScrollView
        style={{ backgroundColor: "white" }} // Add backgroundColor here
        showsVerticalScrollIndicator={false}

        // contentContainerStyle={{ flexGrow: 1 }} // Allow the content to grow inside the ScrollView
        // keyboardShouldPersistTaps="handled" // Ensure taps are handled when the keyboard is open
      >
        <Text> </Text>
        <View style={[styles.row5, styles.center, { marginHorizontal: "1%" }]}>
          <Text style={{ margin: 5, color: "#5B5B5B" }}>
            {"Fecha:  "}
            {fechaPostFormato}
          </Text>
          {/* {(props.profile?.userType === "SuperUsuario" ||
            props.email === emailPerfil) && (
            <TouchableOpacity onPress={() => goToEditEventScreen()}>
              <View style={{ marginRight: "2%" }}>
                <ImageExpo
                  source={require("../../../assets/pictures/editIcon2.png")}
                  style={styles.editIcon}
                />
              </View>
            </TouchableOpacity>
          )} */}
          {pdfPrincipal && (
            <TouchableOpacity
              onPress={() =>
                uploadFile(pdfPrincipal.replace(/abcdefg/g, "%2F"))
              }
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginRight: "2%",
              }}
            >
              <Icon type="material-community" name="paperclip" />
            </TouchableOpacity>
          )}
        </View>
        <Text style={{ margin: 5, color: "#5B5B5B", marginHorizontal: "2%" }}>
          {"Visibilidad:  "}
          {visibilidad}
        </Text>
        <ImageExpo
          source={{ uri: fotoPrincipal?.replace(/abcdefg/g, "%2F") }}
          style={styles.postPhoto}
          cachePolicy={"memory-disk"}
        />
        <Text> </Text>

        <Text
          style={{
            color: "black",
            fontWeight: "700",
            textAlign: "center",
            // alignSelf: "center",

            fontSize: 15,
            paddingHorizontal: 30,
          }}
          onPress={() => goToServiceInfo()}
        >
          {AITNombreServicio}
        </Text>
        {/* {props.email === emailPerfil && (
          <TouchableOpacity
            onPress={() => docDelete(idDocFirestoreDB)}
            style={{
              marginRight: "2%",
            }}
          >
            <ImageExpo
              source={require("../../../assets/pictures/deleteIcon.png")}
              style={styles.roundImage10}
              cachePolicy={"memory-disk"}
            />
          </TouchableOpacity>
        )} */}
        <Text> </Text>
        <Text
          style={{
            // color: "black",
            fontWeight: "700",
            // alignSelf: "center",
            // fontSize: 20,
            paddingHorizontal: 5,
          }}
        >
          {titulo}
        </Text>

        <Text> </Text>

        <Text
          style={{
            paddingHorizontal: 5,
          }}
        >
          {comentarios}
        </Text>

        <View>
          <Text> </Text>
          {titulo === "Tareo" && (
            <>
              <Text style={styles.avanceNombre}>
                {" "}
                Total personal: {totalHH}{" "}
              </Text>
              <Text> </Text>
              <Text style={styles.avanceNombre}>
                {" "}
                Cantidad supervisores : {supervisores}{" "}
              </Text>
              <Text style={styles.avanceNombre}> Cantidad HSE : {HSE} </Text>
              <Text style={styles.avanceNombre}>
                {" "}
                Cantidad Lider Tecnico : {liderTecnico}{" "}
              </Text>
              <Text style={styles.avanceNombre}>
                {" "}
                Cantidad Soldador : {soldador}{" "}
              </Text>
              <Text style={styles.avanceNombre}>
                {" "}
                Cantidad Tecnico : {tecnico}{" "}
              </Text>
              <Text style={styles.avanceNombre}>
                {" "}
                Cantidad Ayudante : {ayudante}{" "}
              </Text>
            </>
          )}
        </View>

        <Text> </Text>
        <FlatList
          style={{
            backgroundColor: "white",
            paddingTop: 10,
            paddingVertical: 10,
          }}
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          data={newImages}
          renderItem={({ item }) => {
            return (
              <View>
                <ImageExpo
                  source={{ uri: item }}
                  style={styles.postPhoto2}
                  cachePolicy={"memory-disk"}
                />
              </View>
            );
          }}
          keyExtractor={(index) => `${index}`}
        />
        <Text> </Text>

        <View style={styles.commentContainer}>
          <ImageExpo
            source={{ uri: props.user_photo }}
            style={styles.roundImage}
            cachePolicy={"memory-disk"}
          />
          <TextInput
            style={styles.input}
            placeholder="Ingresa tu comentario"
            value={comment}
            onChangeText={handleCommentChange}
          />
          <TouchableOpacity
            onPress={() => handleSendComment(comment)}
            style={styles.sendButton}
          >
            <Feather name="send" size={16} color="white" />
          </TouchableOpacity>
        </View>

        <FlatList
          data={postsComments}
          scrollEnabled={false}
          renderItem={({ item, index }) => {
            const options = {
              year: "numeric",
              month: "numeric",
              day: "numeric",
              hour: "numeric",
              minute: "numeric",
              hour12: false,
            };

            return (
              <View style={{ paddingHorizontal: 10 }}>
                <Text> </Text>
                <View style={[styles.row, styles.center]}>
                  <View style={[styles.row, styles.center]}>
                    <ImageExpo
                      source={{
                        uri: item?.commenterPhoto,
                      }}
                      style={styles.roundImage}
                      cachePolicy={"memory-disk"}
                    />
                    <Text style={styles.center2}>{item.commenterName}</Text>
                  </View>

                  <Text style={styles.center2}>
                    {new Date(item.date).toLocaleString(undefined)}
                  </Text>
                </View>
                <Text> </Text>
                <View style={styles.center3}>
                  <Text style={styles.center4}>{item.comment}</Text>
                </View>
              </View>
            );
          }}
        />
      </KeyboardAwareScrollView>
    );
  }
}

const mapStateToProps = (reducers: any) => {
  return {
    servicesData: reducers.home.servicesData,
    firebase_user_name: reducers.profile.firebase_user_name,
    user_photo: reducers.profile.user_photo,
    email: reducers.profile.email,
    totalEventServiceAITLIST: reducers.home.totalEventServiceAITLIST,
    profile: reducers.profile.profile,
  };
};

const ConnectedCommentScreen = connect(mapStateToProps, {
  saveActualPostFirebase,
})(CommentScreen);

export default ConnectedCommentScreen;
