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

const BarChartTareo = (props: any) => {
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
  // const cleanedData = JSON.parse(jsonString).map(({ fotoUsuarioPerfil, fotoPrincipal, ...rest }) => rest);

  let datas;

  let sumByTipoServicio;

  if (data) {
    sumByTipoServicio = {
      Sup: 0,
      HSE: 0,
      Lider: 0,
      Sold: 0,
      Tecn: 0,
      Ayud: 0,
    };

    const totalEntries = data?.length;

    for (let i = 0; i < totalEntries; i++) {
      if (data[i]["supervisores"]) {
        sumByTipoServicio["Sup"] += parseInt(data[i].supervisores) * 12;
      }
      if (data[i]["HSE"]) {
        sumByTipoServicio["HSE"] += parseInt(data[i].HSE) * 12;
      }
      if (data[i]["liderTecnico"]) {
        sumByTipoServicio["Lider"] += parseInt(data[i].liderTecnico) * 12;
      }
      if (data[i]["soldador"]) {
        sumByTipoServicio["Sold"] += parseInt(data[i].soldador) * 12;
      }
      if (data[i]["tecnico"]) {
        sumByTipoServicio["Tecn"] += parseInt(data[i].tecnico) * 12;
      }
      if (data[i]["ayudante"]) {
        sumByTipoServicio["Ayud"] += parseInt(data[i].ayudante) * 12;
      }
    }

    //"Tareo"
    datas = [
      {
        label: "Sup",
        value: sumByTipoServicio["Sup"] ?? 0,
        unidad: "Soles",
      },
      {
        label: "HSE",
        value: sumByTipoServicio["HSE"] ?? 0,
        unidad: "Soles",
      },
      {
        label: "Lider",
        value: sumByTipoServicio["Lider"] ?? 0,
        unidad: "Soles",
      },
      {
        label: "Sold",
        value: sumByTipoServicio["Sold"] ?? 0,
        unidad: "Soles",
      },
      {
        label: "Tecn",
        value: sumByTipoServicio["Tecn"] ?? 0,
        unidad: "Soles",
      },
      {
        label: "Ayud",
        value: sumByTipoServicio["Ayud"] ?? 0,
        unidad: "Soles",
      },
    ];
  }

  let datainaObject: any = {
    Sup: 0,
    HSE: 0,
    Lider: 0,
    Sold: 0,
    Tecn: 0,
    Ayud: 0,
  };

  datas?.forEach((element: any) => {
    datainaObject[element.label] = element?.value;
  });

  if (data.events?.length === 0) {
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
    labels: ["Sup", "HSE", "Lider", "Sold", "Tecn", "Ayud"],
    datasets: [
      {
        // data: [20, 45, 28, 80, 99, 430],
        data: [
          datainaObject["Sup"],
          datainaObject["HSE"],
          datainaObject["Lider"],
          datainaObject["Sold"],
          datainaObject["Tecn"],
          datainaObject["Ayud"],
        ],
      },
    ],
  };

  return (
    <View style={{ alignItems: "center", backgroundColor: "white" }}>
      <BarChart
        style={graphStyle}
        data={datass}
        width={
          screenWidth > 1500
            ? screenWidth * 0.6
            : screenWidth > 800
            ? screenWidth * 0.8
            : screenWidth * 1
        }
        height={320}
        yAxisLabel=""
        yAxisSuffix=""
        chartConfig={chartConfig}
        verticalLabelRotation={30}
      />
      <Text style={{ marginHorizontal: 15 }}>
        Supervisor: {datass.datasets[0].data[0]}
      </Text>
      <Text style={{ marginHorizontal: 15 }}>
        HSE:{datass.datasets[0].data[1]}
      </Text>
      <Text style={{ marginHorizontal: 15 }}>
        Lider:{datass.datasets[0].data[2]}
      </Text>
      <Text style={{ marginHorizontal: 15 }}>
        Soldador:{datass.datasets[0].data[3]}
      </Text>
      <Text style={{ marginHorizontal: 15 }}>
        Tecnico:{datass.datasets[0].data[4]}
      </Text>
      <Text style={{ marginHorizontal: 15 }}>
        Ayudante:{datass.datasets[0].data[5]}
      </Text>
      <Text> </Text>
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
export default BarChartTareo;
