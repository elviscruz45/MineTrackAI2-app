import React from "react";
import { View, StyleSheet, Text, Dimensions, Platform } from "react-native";

import { tipoServicioList } from "../../../utils/tipoServicioList";
import {
  LineChart,
  BarChart,
  PieChart,
  ProgressChart,
  ContributionGraph,
  StackedBarChart,
} from "react-native-chart-kit";
// import { pad } from "lodash";
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

const CurvaS = (props: any) => {
  const { HorasTotales, AvanceEventos } = props;
  const steps = screenWidth > 1000 ? 15 : 15;
  const labels = Array.from({ length: steps + 1 }, (_, i) =>
    Math.round(i * (HorasTotales / steps))
  );

  const axe_x = [
    0, 19, 38, 58, 77, 96, 115, 134, 154, 173, 192, 211, 230, 250, 269, 288,
  ];
  const axe_y1 = [0, 2, 4, 8, 15, 22, 30, 40, 55, 70, 80, 88, 93, 96, 98, 100];
  // const axe_y2 = [0, 1, 3, 6, 12, 13, 14, 20, 30, 40];

  // const AvanceEventosPrueba = [
  //   {
  //     fechaAvance: "2025-05-27T22:58:42.000Z",
  //     horasdesdeFechaInicio: -44.048055555555555,
  //     porcentajeAvance: "25",
  //   },
  //   {
  //     fechaAvance: "2025-05-27T22:59:30.000Z",
  //     horasdesdeFechaInicio: 95.008333333333333,
  //     porcentajeAvance: "35",
  //   },
  //   {
  //     fechaAvance: "2025-05-27T22:59:30.000Z",
  //     horasdesdeFechaInicio: 99.008333333333333,
  //     porcentajeAvance: "50",
  //   },
  //   {
  //     fechaAvance: "2025-05-27T22:59:30.000Z",
  //     horasdesdeFechaInicio: 199.008333333333333,
  //     porcentajeAvance: "45",
  //   },
  //   {
  //     fechaAvance: "2025-05-27T22:59:30.000Z",
  //     horasdesdeFechaInicio: 199.008333333333333,
  //     porcentajeAvance: "45",
  //   },
  //   {
  //     fechaAvance: "2025-05-27T22:59:30.000Z",
  //     horasdesdeFechaInicio: 199.008333333333333,
  //     porcentajeAvance: "45",
  //   },
  //   {
  //     fechaAvance: "2025-05-27T22:59:30.000Z",
  //     horasdesdeFechaInicio: 199.008333333333333,
  //     porcentajeAvance: "45",
  //   },
  //   {
  //     fechaAvance: "2025-05-27T22:59:30.000Z",
  //     horasdesdeFechaInicio: 199.008333333333333,
  //     porcentajeAvance: "45",
  //   },
  //   {
  //     fechaAvance: "2025-05-27T22:59:30.000Z",
  //     horasdesdeFechaInicio: 199.008333333333333,
  //     porcentajeAvance: "45",
  //   },
  //   {
  //     fechaAvance: "2025-05-27T22:59:30.000Z",
  //     horasdesdeFechaInicio: 280.008333333333333,
  //     porcentajeAvance: "93",
  //   },
  //   {
  //     fechaAvance: "2025-05-27T22:59:30.000Z",
  //     horasdesdeFechaInicio: 297.008333333333333,
  //     porcentajeAvance: "98",
  //   },
  // ];

  const axe_y2 = axe_x?.map((hour) => {
    // Find all events up to this hour
    const eventsBefore = AvanceEventos?.filter(
      (item: any) => item.horasdesdeFechaInicio <= hour
    );
    // Get the latest percentage, or 0 if none
    if (eventsBefore.length === 0) return 0;
    return Number(eventsBefore[eventsBefore.length - 1].porcentajeAvance) || 0;
  });

  const axe_y3 = [];

  const dataLineChart: any = {
    labels: axe_x,
    datasets: [
      {
        data: axe_y1,
        color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`, // optional
        strokeWidth: 2, // optional
      },
      {
        data: axe_y2,
        // data: [80, 81, 83, 86, 92, 93, 94, 100, 110, 130],

        color: (opacity = 1) => `rgba(132, 243, 122, ${opacity})`, // optional

        strokeWidth: 2, // optional
      },
    ],
    legend: ["Programado", "Real"], // optional
  };

  return (
    <View style={{ alignItems: "center", backgroundColor: "white" }}>
      <LineChart
        data={dataLineChart}
        width={
          screenWidth > 1500
            ? screenWidth * 0.6
            : screenWidth > 800
            ? screenWidth * 0.8
            : screenWidth * 1
        }
        height={256}
        verticalLabelRotation={30}
        chartConfig={chartConfig}
        bezier
      />
    </View>
  );
};

const graphStyle = {
  marginVertical: 8,
  // paddingRight: 100,
  // borderRadius: 16,

  backgroundColor: "black",
  // marginHorizontal: "20%",
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // marginLeft: -50,

    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
});
export default CurvaS;
