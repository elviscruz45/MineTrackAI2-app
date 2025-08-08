import React, { useState } from "react";
import { View, TouchableOpacity, Dimensions, Text } from "react-native";
import {
  LineChart,
  BarChart,
  PieChart,
  ProgressChart,
  ContributionGraph,
  StackedBarChart,
} from "react-native-chart-kit";
const PieChartView = (props: any) => {
  //pie configuration
  const screenWidth = Dimensions.get("window").width;
  const chartConfig = {
    backgroundGradientFrom: "white", // Negro puro
    backgroundGradientFromOpacity: 1,
    backgroundGradientTo: "white",
    backgroundGradientToOpacity: 1,
    color: (opacity = 1) => `blue`, // Gris claro para contraste sin ser blanco puro
    strokeWidth: 1, // optional, default 3
    barPercentage: 0.5,
    useShadowColorFromDataset: false, // optional
  };

  //Data for the pie chart

  // const { data } = props;
  const { data } = props;
  let datas: any;
  let sumByTipoServicio: any;
  if (data) {
    sumByTipoServicio = {};
    const totalEntries = data?.length;

    for (let i = 0; i < totalEntries; i++) {
      const AvanceAdministrativoTexto = data[i].AvanceAdministrativoTexto;
      const tipoServicio = data[i].TipoServicio;
      if (
        sumByTipoServicio[tipoServicio] &&
        AvanceAdministrativoTexto !== "Stand by" &&
        AvanceAdministrativoTexto !== "Cancelacion"
      ) {
        sumByTipoServicio[tipoServicio]++;
      } else {
        sumByTipoServicio[tipoServicio] = 1;
      }
    }
    datas = [
      { x: "Parada de Planta", y: sumByTipoServicio["Parada de Planta"] ?? 0 },
      { x: "Reparacion", y: sumByTipoServicio["Reparacion"] ?? 0 },
      { x: "Fabricacion", y: sumByTipoServicio["Fabricacion"] ?? 0 },
      { x: "Ingenieria", y: sumByTipoServicio["Ingenieria"] ?? 0 },
      { x: "Instalacion", y: sumByTipoServicio["Instalacion"] ?? 0 },
      { x: "IngFab", y: sumByTipoServicio["IngenieriayFabricacion"] ?? 0 },
      { x: "Otro", y: sumByTipoServicio["Otro"] ?? 0 },
    ];

    datas = datas.filter((item: any) => item.y !== 0);
  }

  const datainaObject: any = {
    "Parada de Planta": 0,
    Reparacion: 0,
    Fabricacion: 0,
    Ingenieria: 0,
    Instalacion: 0,
    IngenieriayFabricacion: 0,
    Otro: 0,
  };
  datas.forEach((element: any) => {
    datainaObject[element.x] = element.y;
  });

  if (!datas) return null;

  const dataPie = [
    {
      name: "Parada de Planta",
      population: datainaObject["Parada de Planta"],
      color: "rgba(131, 167, 234, 1)",
      legendFontColor: "#7F7F7F",
      legendFontSize: 13,
    },
    {
      name: "Reparacion",
      population: datainaObject["Reparacion"],
      color: "#F00",
      legendFontColor: "#7F7F7F",
      legendFontSize: 13,
    },
    {
      name: "Fabricacion",
      population: datainaObject["Fabricacion"],
      color: "black",
      legendFontColor: "#7F7F7F",
      legendFontSize: 13,
    },
    {
      name: "Ingenieria",
      population: datainaObject["Ingenieria"],
      color: "green",
      legendFontColor: "#7F7F7F",
      legendFontSize: 13,
    },
    {
      name: "Instalacion",
      population: datainaObject["Instalacion"],
      color: "yellow",
      legendFontColor: "#7F7F7F",
      legendFontSize: 13,
    },
    {
      name: "IngFab",
      population: datainaObject["IngenieriayFabricacion"],
      color: "pink",
      legendFontColor: "#7F7F7F",
      legendFontSize: 13,
    },
    {
      name: "Otro",
      population: datainaObject["Otro"],
      color: "rgb(0, 0, 255)",
      legendFontColor: "#7F7F7F",
      legendFontSize: 13,
    },
  ];

  const total = datas.reduce((sum: any, entry: any) => sum + entry.y, 0);
  if (total === 0) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text> </Text>
        <Text> </Text>
      </View>
    );
  }
  return (
    <PieChart
      data={dataPie}
      width={screenWidth}
      height={220}
      chartConfig={chartConfig}
      accessor={"population"}
      backgroundColor={"transparent"}
      paddingLeft={"15"}
      center={[0, 0]}
      absolute
    />
  );
};
export default PieChartView;
