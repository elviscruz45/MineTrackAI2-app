import React, { useState } from "react";
// import { VictoryPie, VictoryLabel, VictoryAnimation } from "victory-native";
import { Avatar, Icon } from "@rneui/themed";
// import Svg from "react-native-svg";
import { View, Text, Alert } from "react-native";
import { Image as ImageExpo } from "expo-image";
import { Platform, TouchableOpacity } from "react-native";

import * as ImagePicker from "expo-image-picker";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  uploadBytesResumable,
} from "firebase/storage";
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import { db } from "@/firebaseConfig";

const CircularProgress = ({
  imageSourceDefault,
  imageStyle,
  avance,
  idait,
  image,
  titulo,
  emailProfile,
  emailPost,
}: {
  imageSourceDefault: any;
  imageStyle: any;
  avance: any;
  idait: any;
  image: any;
  titulo: any;
  emailProfile: any;
  emailPost: any;
}) => {
  const [avatar, setAvatar] = useState<any>();

  const data = [
    { x: 1, y: parseInt(avance) },
    { x: 2, y: 100 - parseInt(avance) },
  ];

  const changeAvatar = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes:  ["images", "videos"],
      allowsEditing: true,
      aspect: [4, 4],
    });

    if (!result.canceled) uploadImage(result.assets[0].uri);
  };

  const uploadImage = async (uri: any) => {
    const response = await fetch(uri);
    const blob = await response.blob();

    const storage = getStorage();
    const storageRef = ref(storage, `Serviceavatar/${idait}`);

    uploadBytesResumable(storageRef, blob).then((snapshot) => {
      updatePhotoUrl(snapshot.metadata.fullPath);
    });
  };

  const updatePhotoUrl = async (imagePath: any) => {
    const storage = getStorage();
    const imageRef = ref(storage, imagePath);
    const imageUrl = await getDownloadURL(imageRef);
    const RefFirebaseServiceAIT = doc(db, "ServiciosAIT", idait);

    const updateDataLasEventPost = {
      photoServiceURL: imageUrl,
    };
    await updateDoc(RefFirebaseServiceAIT, updateDataLasEventPost);

    setAvatar(imageUrl);
  };

  const editPhoto = () => {
    if (Platform.OS === "web") {
      const confirmed = window.confirm(
        "Estas Seguro que deseas cambiar de Imagen?"
      );
      if (confirmed) {
        changeAvatar();
      }
    } else {
      Alert.alert(
        "Editar",
        "Estas Seguro que deseas cambiar de Imagen?",
        [
          {
            text: "Cancelar",
            style: "cancel",
          },
          {
            text: "Aceptar",
            onPress: async () => {
              changeAvatar();
            },
          },
        ],
        { cancelable: false }
      );
    }
  };

  return (
    <TouchableOpacity
      onPress={emailProfile === emailPost ? () => editPhoto() : () => {}}
    >
      <ImageExpo
        source={image ? { uri: image } : imageSourceDefault}
        style={{
          // alignContent: "center",
          marginLeft: "5%",
          marginTop: "5%",
          width: 100,
          height: 100,
          borderRadius: 80,
          borderWidth: 0.3,
          // alignSelf: "center",
        }}
      />
    </TouchableOpacity>
  );
};

{
  /* {image ? (
        <ImageExpo
          source={{ uri: image }}
          style={
            Platform.OS === "ios"
              ? {
                  // alignContent: "center",
                  marginLeft: "5%",
                  marginTop: "5%",
                  width: 80,
                  height: 80,
                  borderRadius: 80,
                  borderWidth: 0.3,

                  // alignSelf: "center",
                }
              : {
                  // alignContent: "center",
                  marginLeft: "0%",
                  marginTop: "11%",
                  width: 80,
                  height: 80,
                  borderRadius: 80,
                  borderWidth: 0.3,

                  // alignSelf: "center",
                }
          }
        />
      ) : (
        <ImageExpo
          source={imageSourceDefault}
          style={
            Platform.OS === "ios"
              ? {
                  // alignContent: "center",
                  marginLeft: "5%",
                  marginTop: "5%",
                  width: 80,
                  height: 80,
                  borderRadius: 80,
                  borderWidth: 0.3,

                  // alignSelf: "center",
                }
              : {
                  // alignContent: "center",
                  marginLeft: "0%",
                  marginTop: "11%",
                  width: 80,
                  height: 80,
                  borderRadius: 80,
                  borderWidth: 0.3,

                  // alignSelf: "center",
                }
          }
        />
      ) 
    
      } */
}
export default CircularProgress;
