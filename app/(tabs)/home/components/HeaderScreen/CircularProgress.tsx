import { View } from "react-native";
import { Image as ImageExpo } from "expo-image";
import { Platform } from "react-native";
import { Text } from "react-native";
import React from "react";

const CircularProgress = ({
  imageSource,
  imageStyle,
  avance,
  image,
}: {
  imageSource?: any;
  imageStyle?: any;
  avance: string;
  image?: string;
}) => {
  const data = [
    { x: 1, y: parseInt(avance) },
    { x: 2, y: 100 - parseInt(avance) },
  ];

  return (
    <>
      {image ? (
        <ImageExpo
          source={{ uri: image }}
          style={{
            marginLeft: 20,
            width: 80,
            height: 80,
            borderRadius: 80,
            borderWidth: 0.3,
          }}
        />
      ) : (
        <ImageExpo
          source={
            imageSource ||
            require("../../../../../assets/equipmentplant/ImageIcons/confipetrolLogos.png")
          }
          style={{
            marginLeft: 20,
            width: 80,
            height: 80,
            borderRadius: 80,
            borderWidth: 0.3,
          }}
        />
      )}
    </>
  );
};

export default CircularProgress;
