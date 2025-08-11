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
  Animated,
} from "react-native";
import { Feather, MaterialIcons, Ionicons } from "@expo/vector-icons";
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
  const [fadeAnim] = useState(new Animated.Value(0));

  // Animation effect when component mounts
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

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
        style={{ backgroundColor: "white" }}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          {/* Header Section */}
          <View style={styles.headerContainer}>
            <View style={styles.headerInfo}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Ionicons name="calendar-outline" size={18} color="#3498db" />
                <Text style={[styles.headerText, { marginLeft: 6 }]}>
                  {fechaPostFormato}
                </Text>
              </View>

              <View style={{ flexDirection: "row", alignItems: "center" }}>
                {pdfPrincipal && (
                  <TouchableOpacity
                    onPress={() =>
                      uploadFile(pdfPrincipal.replace(/abcdefg/g, "%2F"))
                    }
                    style={{ marginHorizontal: 8 }}
                  >
                    <MaterialIcons
                      name="attach-file"
                      size={20}
                      color="#3498db"
                    />
                  </TouchableOpacity>
                )}

                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <MaterialIcons name="visibility" size={18} color="#3498db" />
                  <Text style={[styles.headerText, { marginLeft: 4 }]}>
                    {visibilidad}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Main Image */}
          <ImageExpo
            source={{ uri: fotoPrincipal?.replace(/abcdefg/g, "%2F") }}
            style={styles.postPhoto}
            cachePolicy={"memory-disk"}
            contentFit="cover"
            transition={300}
          />

          {/* Title Section */}
          <Text style={styles.titleText}>{AITNombreServicio}</Text>

          {/* Content Description */}
          <Text style={styles.detailText}>{titulo}</Text>
          <Text style={styles.detailText}>{comentarios}</Text>

          {/* Tareo Details Section (if applicable) */}
          {titulo === "Tareo" && (
            <View
              style={{
                backgroundColor: "#f8f9fa",
                borderRadius: 12,
                margin: 16,
                padding: 16,
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "600",
                  color: "#2c3e50",
                  marginBottom: 10,
                }}
              >
                Detalles de Personal
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  justifyContent: "space-between",
                }}
              >
                <View style={{ width: "48%", marginBottom: 8 }}>
                  <Text style={styles.avanceNombre}>
                    Total personal: {totalHH}
                  </Text>
                </View>
                <View style={{ width: "48%", marginBottom: 8 }}>
                  <Text style={styles.avanceNombre}>
                    Supervisores: {supervisores}
                  </Text>
                </View>
                <View style={{ width: "48%", marginBottom: 8 }}>
                  <Text style={styles.avanceNombre}>HSE: {HSE}</Text>
                </View>
                <View style={{ width: "48%", marginBottom: 8 }}>
                  <Text style={styles.avanceNombre}>
                    Lider Técnico: {liderTecnico}
                  </Text>
                </View>
                <View style={{ width: "48%", marginBottom: 8 }}>
                  <Text style={styles.avanceNombre}>Soldador: {soldador}</Text>
                </View>
                <View style={{ width: "48%", marginBottom: 8 }}>
                  <Text style={styles.avanceNombre}>Técnico: {tecnico}</Text>
                </View>
                <View style={{ width: "48%", marginBottom: 8 }}>
                  <Text style={styles.avanceNombre}>Ayudante: {ayudante}</Text>
                </View>
              </View>
            </View>
          )}

          {/* Gallery Section */}
          {newImages && newImages.length > 0 && (
            <View style={styles.galleryContainer}>
              <Text style={styles.sectionTitle}>Galería</Text>
              <FlatList
                style={{ backgroundColor: "white" }}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                data={newImages}
                renderItem={({ item }) => (
                  <TouchableOpacity>
                    <ImageExpo
                      source={{ uri: item }}
                      style={styles.postPhoto2}
                      cachePolicy={"memory-disk"}
                      contentFit="cover"
                      transition={300}
                    />
                  </TouchableOpacity>
                )}
                keyExtractor={(index) => `${index}`}
              />
            </View>
          )}

          {/* Comment Input Section */}
          <View style={styles.commentContainer}>
            <ImageExpo
              source={{ uri: props.user_photo }}
              style={styles.roundImage}
              cachePolicy={"memory-disk"}
              contentFit="cover"
            />
            <TextInput
              style={styles.input}
              placeholder="Ingresa tu comentario"
              value={comment}
              onChangeText={handleCommentChange}
              placeholderTextColor="#9ca3af"
            />
            <TouchableOpacity
              onPress={() => handleSendComment(comment)}
              style={styles.sendButton}
              activeOpacity={0.7}
            >
              <Feather name="send" size={18} color="white" />
            </TouchableOpacity>
          </View>

          {/* Comments Section */}
          {postsComments && postsComments.length > 0 ? (
            <View style={{ marginBottom: 20 }}>
              <Text style={styles.sectionTitle}>
                Comentarios ({postsComments.length})
              </Text>
              <FlatList
                data={postsComments}
                scrollEnabled={false}
                renderItem={({ item, index }) => {
                  const commentDate = new Date(item.date);
                  const formattedDate = commentDate.toLocaleDateString(
                    undefined,
                    {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    }
                  );
                  const formattedTime = commentDate.toLocaleTimeString(
                    undefined,
                    {
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  );

                  return (
                    <View style={styles.commentCard}>
                      <View style={styles.commentHeader}>
                        <View
                          style={{ flexDirection: "row", alignItems: "center" }}
                        >
                          <ImageExpo
                            source={{ uri: item?.commenterPhoto }}
                            style={styles.roundImage}
                            cachePolicy={"memory-disk"}
                            contentFit="cover"
                          />
                          <Text style={[styles.userName, { marginLeft: 10 }]}>
                            {item.commenterName}
                          </Text>
                        </View>
                        <Text style={styles.dateText}>
                          {formattedDate} • {formattedTime}
                        </Text>
                      </View>
                      <Text style={styles.commentText}>{item.comment}</Text>
                    </View>
                  );
                }}
              />
            </View>
          ) : (
            <View style={{ alignItems: "center", marginVertical: 30 }}>
              <Feather name="message-circle" size={40} color="#d1d5db" />
              <Text style={{ color: "#6b7280", marginTop: 10, fontSize: 16 }}>
                No hay comentarios. ¡Sé el primero!
              </Text>
            </View>
          )}
        </Animated.View>
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
