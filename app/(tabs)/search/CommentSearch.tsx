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
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { connect } from "react-redux";
import { Icon } from "@rneui/themed";
import styles from "./CommentSearch.styles";
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
import { LoadingSpinner } from "../../../components/LoadingSpinner";
import { Image as ImageExpo } from "expo-image";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { screen } from "../../../utils";
import Toast from "react-native-toast-message";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { useRouter, useLocalSearchParams } from "expo-router";
const windowWidth = Dimensions.get("window").width;

function CommentSearchScreen(props: any) {
  let totalEventServiceAITLIST;

  const [comment, setComment] = useState("");
  const [post, setPost] = useState<any>();

  const router = useRouter();

  const { idDocFirestoreDB, AITidServicios }: any = useLocalSearchParams();
  const Index = idDocFirestoreDB;

  // go to edit screen
  const goToEditEventScreen = () => {
    router.push({
      pathname: "/search/EditEvent",
      params: {
        idDocFirestoreDB: idDocFirestoreDB,
        idDocAITFirestoreDB: AITidServicios,
      },
    });
  };

  useEffect(() => {
    async function fetchData() {
      const q = query(
        collection(db, "events"),
        where("idDocFirestoreDB", "==", Index)
      );

      try {
        const querySnapshot = await getDocs(q);
        const lista: any = [];
        querySnapshot.forEach((doc) => {
          lista.push(doc.data());
        });
        setPost(lista[0]);
      } catch (error) {
        console.error("Error fetching data: ", error);
      }
    }
    fetchData();
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

    const PostRef = doc(db, "events", post?.idDocFirestoreDB);

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
    // navigation.goBack();
    // router.back();
  };

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

              const filteredList = eventList.filter(
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

  if (!post) {
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
        <View style={[styles.row5, styles.center]}>
          <Text style={{ margin: 5, color: "#5B5B5B" }}>
            {"Fecha:  "}
            {post?.fechaPostFormato}
          </Text>

          {(props.profile?.userType === "SuperUsuario" ||
            props.email === post?.emailPerfil) && (
            <TouchableOpacity onPress={() => goToEditEventScreen()}>
              <View style={{ marginRight: "2%" }}>
                <ImageExpo
                  source={require("../../../assets/pictures/editIcon2.png")}
                  style={styles.editIcon}
                />
              </View>
            </TouchableOpacity>
          )}
          {post?.pdfPrincipal && (
            <TouchableOpacity
              onPress={() => uploadFile(post.pdfPrincipal)}
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
        <Text style={{ margin: 5, color: "#5B5B5B" }}>
          {"Visibilidad:  "}
          {post?.visibilidad}
        </Text>
        <Text> </Text>
        <ImageExpo
          source={{ uri: post?.fotoPrincipal }}
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
          // onPress={() => goToServiceInfo()}
        >
          {post?.AITNombreServicio}
        </Text>
        {props.email === post?.emailPerfil && (
          <TouchableOpacity
            onPress={() => docDelete(post.idDocFirestoreDB)}
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
        )}

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
          {post?.titulo}
        </Text>

        <Text> </Text>

        <Text
          style={{
            paddingHorizontal: 5,
          }}
        >
          {post?.comentarios}
        </Text>
        <Text> </Text>
        <View>
          <Text style={{}}>{post.description}</Text>
          <Text> </Text>
          {post.titulo === "Tareo" && (
            <>
              <Text style={styles.avanceNombre}>
                {" "}
                Total personal: {post.totalHH}{" "}
              </Text>
              <Text> </Text>
              <Text style={styles.avanceNombre}>
                {" "}
                Cantidad supervisores : {post.supervisores}{" "}
              </Text>
              <Text style={styles.avanceNombre}>
                {" "}
                Cantidad HSE : {post.HSE}{" "}
              </Text>
              <Text style={styles.avanceNombre}>
                {" "}
                Cantidad Lider Tecnico : {post.liderTecnico}{" "}
              </Text>
              <Text style={styles.avanceNombre}>
                {" "}
                Cantidad Soldador : {post.soldador}{" "}
              </Text>
              <Text style={styles.avanceNombre}>
                {" "}
                Cantidad Tecnico : {post.tecnico}{" "}
              </Text>
              <Text style={styles.avanceNombre}>
                {" "}
                Cantidad Ayudante : {post.ayudante}{" "}
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
          data={post.newImages}
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
          data={post.comentariosUsuarios}
          scrollEnabled={false}
          renderItem={({ item, index }) => {
            const options: Intl.DateTimeFormatOptions = {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
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
                    {new Date(item.date).toLocaleString(undefined, options)}
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

const CommentSearch = connect(mapStateToProps, {
  saveActualPostFirebase,
})(CommentSearchScreen);

export default CommentSearch;
