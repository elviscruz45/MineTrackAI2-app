import React from "react";
import { View, ScrollView, StyleSheet, Text } from "react-native";
import { DataTable } from "react-native-paper";
// import { screen } from "../../../utils";
import { useRouter } from "expo-router";

const HistoryEstadoServiceList = (props: any) => {
  const router = useRouter();

  const { data } = props;
  const newTableData = [];

  if (data) {
    for (let i = 0; i < data.length; i++) {
      if (
        data[i].AvanceAdministrativoTexto === "Inicio Servicio" ||
        data[i].AvanceAdministrativoTexto ===
          "Solicitud Aprobacion Doc" ||
        data[i].AvanceAdministrativoTexto === "Aprobacion Doc" ||
        data[i].AvanceAdministrativoTexto === "Avance Ejecucion" ||
        data[i].AvanceAdministrativoTexto ===
          "Solicitud Ampliacion Servicio" ||
        data[i].AvanceAdministrativoTexto === "Aprobacion Ampliacion"
      ) {
        let daysLeft = (
          (data[i].FechaFin.seconds * 1000 - Date.now()) /
          86400000
        ).toFixed(0);

        newTableData.push({
          idServiciosAIT: data[i].idServiciosAIT,
          id: data[i].NumeroAIT,
          avance: data[i].AvanceEjecucion,
          name: data[i].NombreServicio,
          diasPendientes: daysLeft,
          fechaPostFormato: data[i].fechaPostFormato,
          createdAt: data[i].createdAt,
          estadoFinalEjecucion:
            data[i].NuevaFechaEstimada &&
            data[i].fechaFinEjecucion &&
            data[i].fechaFinEjecucion - data[i].NuevaFechaEstimada > 0
              ? "Atrasado"
              : data[i].FechaFin &&
                data[i].fechaFinEjecucion &&
                data[i].fechaFinEjecucion - data[i].FechaFin > 0
              ? "Atrasado"
              : "En tiempo",
        });
      }
    }
  }

  newTableData?.sort((a, b) => a.createdAt - b.createdAt);
  const goToInformation = (idServiciosAIT: any) => {
    // navigation.navigate(screen.search.tab, {
    //   screen: screen.search.item,
    //   params: { Item: idServiciosAIT },
    // });

    router.push({
      pathname: "/search/Item",
      params: { Item: idServiciosAIT },
    });
  };

  if (!data) {
    return null;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <DataTable>
        {/* Table header */}
        <DataTable.Header>
          <DataTable.Title style={styles.multiLineColumn}>
            Nombre
          </DataTable.Title>
          <DataTable.Title style={styles.shortColumn2}>
            Dias Pendientes
          </DataTable.Title>
        </DataTable.Header>

        {/* Table data */}
        {newTableData.map((item, index) => (
          <DataTable.Row key={index}>
            <Text
              style={{
                flex: 2,
                color:
                  item.estadoFinalEjecucion === "En tiempo" ? "black" : "red",
                alignSelf: "center",
              }}
              onPress={() => goToInformation(item.idServiciosAIT)}
            >
              {item.name}
            </Text>
            <Text
              style={{
                flex: 1,
                color:
                  item.estadoFinalEjecucion === "En tiempo" ? "black" : "red",
                alignSelf: "center",
                textAlign: "center",
              }}
            >
              {item.estadoFinalEjecucion}
            </Text>
          </DataTable.Row>
        ))}
      </DataTable>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },

  shortColumn1: {
    flex: 0.77, // Adjust the value as per your requirement for the width
    maxWidth: 200, // Adjust the maxWidth as per your requirement
  },
  shortColumn2: {
    flex: 0, // Adjust the value as per your requirement for the width
  },
  multiLineColumn: {
    flex: 1,
  },
});

export default HistoryEstadoServiceList;
