import React, { useState } from "react";

import { View, Text } from "react-native";

 const RecursosProgress = (props: any) => {
  const { cantidad, titulo, unidad, porcentaje, total } = props;
  // Example: 20% progress

  const getColor = (porcentaje: any) => {
    if (porcentaje < 25) {
      return "red";
    } else if (porcentaje < 50) {
      return "orange";
    } else if (porcentaje < 75) {
      return "limegreen";
    } else if (porcentaje < 100) {
      return "green";
    } else {
      return "green";
    }
  };

  const barWidth = `${porcentaje * 100}%`; // Calculate the width as a percentage string

  return (
    <>
      <Text
        style={{
          marginLeft: 15,
          borderRadius: 5,
          fontWeight: "700",
        }}
      >
        Area: {titulo}
      </Text>
      <View
        style={{
          paddingHorizontal: 15,
        }}
      >
        <View>
          <Text>
            Disponible: {cantidad} {unidad}
          </Text>
          <Text>
            Total: {total} {unidad}
          </Text>
        </View>

        <View
          style={
            {
              // backgroundColor: getColor(porcentaje * 100),
              // width: barWidth,
              // height: 10,
              // borderRadius: 5,
              // alignSelf: "flex-start", // Align the progress bar to the left
            }
          }
        ></View>

        <Text> </Text>
      </View>
    </>
  );
};
export default RecursosProgress;