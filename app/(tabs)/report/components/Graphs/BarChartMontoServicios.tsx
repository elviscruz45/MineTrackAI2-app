import React from "react";
import { View, StyleSheet, Text, Dimensions } from "react-native";
// import {
//   VictoryChart,
//   VictoryBar,
//   VictoryTheme,
//   VictoryTooltip,
//   VictoryContainer,
//   VictoryAxis,
//   VictoryLabel,
// } from "victory-native";
// import { tipoServicioList } from "../../../utils/tipoServicioList";
import {
  LineChart,
  BarChart,
  PieChart,
  ProgressChart,
  ContributionGraph,
  StackedBarChart,
} from "react-native-chart-kit";
// import { pad } from "lodash";
const BarChartMontoServicios = (props: any) => {
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

  //data for the bar chart
  const { data } = props;

  let datas: any;

  let sumByTipoServicio: any;
  if (data) {
    sumByTipoServicio = {
      "Parada de Planta": 0,
      Reparacion: 0,
      Fabricacion: 0,
      Ingenieria: 0,
      Instalacion: 0,
      IngenieriayFabricacion: 0,
      Otro: 0,
    };

    const totalEntries: any = data?.length;
    for (let i = 0; i < totalEntries; i++) {
      const tipoServicio = data[i]?.TipoServicio;
      const rawMonto = data[i].Monto ?? 0;
      const monto = Number(rawMonto) || 0; // This ensures monto is always a number

      let rate = 1;
      if (data[i]["Moneda"] === "Dolares") rate = 3.5;
      if (data[i]["Moneda"] === "Euros") rate = 4;

      if (sumByTipoServicio[tipoServicio] === undefined) {
        sumByTipoServicio[tipoServicio] = 0;
      }

      sumByTipoServicio[tipoServicio] += monto * rate;
    }

    //"Parada de Planta"
    datas = [
      {
        label: "Parada de Planta",
        value: sumByTipoServicio["Parada de Planta"] ?? 0,
        unidad: "Soles",
      },
      {
        label: "Reparacion",
        value: sumByTipoServicio["Reparacion"] ?? 0,
        unidad: "Soles",
      },
      {
        label: "Fabricacion",
        value: sumByTipoServicio["Fabricacion"] ?? 0,
        unidad: "Soles",
      },
      {
        label: "Ingenieria",
        value: sumByTipoServicio["Ingenieria"] ?? 0,
        unidad: "Soles",
      },
      {
        label: "InInstalacionst",
        value: sumByTipoServicio["Instalacion"] ?? 0,
        unidad: "Soles",
      },
      {
        label: "IngenieriayFabricacion",
        value: sumByTipoServicio["IngenieriayFabricacion"] ?? 0,
        unidad: "Soles",
      },
      {
        label: "Otro",
        value: sumByTipoServicio["Otro"] ?? 0,
        unidad: "Soles",
      },
    ];
  }

  let datainaObject: any = {
    "Parada de Planta": 0,
    Reparacion: 0,
    Fabricacion: 0,
    Ingenieria: 0,
    Instalacion: 0,
    IngenieriayFabricacion: 0,
    Otro: 0,
  };

  datas.forEach((element: any) => {
    datainaObject[element.label] = element.value;
  });

  if (data?.length === 0) {
    return;
    return (
      <>
        <Text> </Text>
        <Text style={{ alignSelf: "center" }}>
          No hay datos para mostrar grafica
        </Text>
      </>
    );
  }

  const datass = {
    labels: ["PPlanta", "Rep", "Fab", "Ing", "Inst", "IngFab", "Otro"],
    datasets: [
      {
        // data: [20, 45, 28, 80, 99, 430],
        data: [
          datainaObject["Parada de Planta"],
          datainaObject["Reparacion"],
          datainaObject["Fabricacion"],
          datainaObject["Ingenieria"],
          datainaObject["Instalacion"],
          datainaObject["IngenieriayFabricacion"],
          datainaObject["Otro"],
        ],
        color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`, // optional
        strokeWidth: 2, // optional
      },
    ],
  };

  return (
    <BarChart
      style={graphStyle}
      data={datass}
      width={screenWidth}
      height={320}
      yAxisLabel="S/."
      yAxisSuffix=""
      chartConfig={chartConfig}
      verticalLabelRotation={30}
    />
  );
};

const graphStyle = {
  marginVertical: 8,
  paddingRight: 100,
  // borderRadius: 16,
  backgroundColor: "black",
  marginHorizontal: 0,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginLeft: -50,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
});

export default BarChartMontoServicios;
