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

const BarChartProceso = (props: any) => {
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
  const { data } = props;
  let datas: any;
  let sumByEtapa;
  if (data) {
    sumByEtapa = {
      NoCompl: 0,
      EDPNoPagados: 0,
      Compl: 0,
      EDPPagados: 0,
    };

    const totalEntries = data?.length;
    for (let i = 0; i < totalEntries; i++) {
      const monto = Number(data[i].Monto) || 0;
      const moneda = data[i].Moneda;

      if (data[i].AvanceAdministrativoTexto === "Registro de Pago") {
        if (moneda === "Dolares") {
          sumByEtapa["EDPPagados"] += monto * 3.5;
        } else if (moneda === "Euros") {
          sumByEtapa["EDPPagados"] += monto * 4;
        } else if (moneda === "Soles") {
          sumByEtapa["EDPPagados"] += monto;
        }
      } else if (data[i]["AvanceAdministrativoTexto"] === "Envio EDP") {
        if (moneda === "Dolares") {
          sumByEtapa["EDPNoPagados"] += monto * 3.5;
        } else if (moneda === "Euros") {
          sumByEtapa["EDPNoPagados"] += monto * 4;
        } else if (moneda === "Soles") {
          sumByEtapa["EDPNoPagados"] += monto;
        }
      } else if (
        data[i]["AvanceAdministrativoTexto"] === "Avance Ejecucion" &&
        data[i]["AvanceEjecucion"] === "100"
      ) {
        if (moneda === "Dolares") {
          sumByEtapa["Compl"] += monto * 3.5;
        } else if (moneda === "Euros") {
          sumByEtapa["Compl"] += monto * 4;
        } else if (moneda === "Soles") {
          sumByEtapa["Compl"] += monto;
        }
      } else if (
        data[i]["AvanceAdministrativoTexto"] !== "Stand by" &&
        data[i]["AvanceAdministrativoTexto"] !== "Cancelacion"
      ) {
        if (moneda === "Dolares") {
          sumByEtapa["NoCompl"] += monto * 3.5;
        } else if (moneda === "Euros") {
          sumByEtapa["NoCompl"] += monto * 4;
        } else if (moneda === "Soles") {
          sumByEtapa["NoCompl"] += monto;
        }
      }
    }
    datas = [
      {
        label: "Pagado",
        value: sumByEtapa["EDPPagados"],
        unidad: "Soles",
      },
      {
        label: "No Pagado",
        value: sumByEtapa["EDPNoPagados"],
        unidad: "Soles",
      },
      {
        label: "Completado",
        value: sumByEtapa["Compl"],
        unidad: "Soles",
      },
      {
        label: "Ejecucion",
        value: sumByEtapa["NoCompl"],
        unidad: "Soles",
      },
    ];
  }

  let datainaObject: any = {
    Pagado: 0,
    "No Pagado": 0,
    Completado: 0,
    Ejecucion: 0,
  };
  datas.forEach((element: any) => {
    datainaObject[element.label] = element.value;
  });
  if (data?.length === 0) {
    return (
      <>
        <Text></Text>
        <Text style={{ alignSelf: "center" }}>
          No hay datos para mostrar grafica
        </Text>
      </>
    );
  }

  const datass = {
    labels: ["Pagado", "No Pagado", "Completado", "Ejecucion"],
    datasets: [
      {
        // data: [20, 45, 28, 80, 99, 430],
        data: [
          datainaObject["Pagado"],
          datainaObject["No Pagado"],
          datainaObject["Completado"],
          datainaObject["Ejecucion"],
        ],
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
  marginVertical: 0,
  paddingRight: 100,
  // borderRadius: 16,
  backgroundColor: "black",
  marginHorizontal: 0,
};

const styles = StyleSheet.create({
  container: {
    margin: 20, // padding: 30,
    // marginRight: 80,
    // margin: 10,
    // paddingHorizontal: 40,
    // alignSelf: "flex-start",
    // margin: 10,
    // flex: 1,
    // justifyContent: "right",
    // alignItems: "center",
    // backgroundColor: "white",
  },
});

export default BarChartProceso;
