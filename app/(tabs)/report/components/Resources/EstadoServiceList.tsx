import React from "react";
import { View, ScrollView, StyleSheet, Text } from "react-native";
import { DataTable } from "react-native-paper";
// import { screen } from "../../../utils";
import { useRouter } from "expo-router";

const EstadoServiceList = (props: any) => {
  const router = useRouter();

  const { data } = props;

  const newTableData = [];
  if (data) {
    for (let i = 0; i < data.length; i++) {
      if (
        data[i].AvanceAdministrativoTexto !== "Stand by" &&
        data[i].AvanceAdministrativoTexto !== "Cancelacion"
      ) {
        const dateString = data[i]?.FechaFin;

        let daysLeft = 0;
        if (dateString && typeof dateString === "string") {
          const [day, month, year, time] = dateString.split(/[/ ]/);
          const date = new Date(`${year}-${month}-${day}T${time}`);
          const milliseconds = date.getTime();
          const hoursLeft = (milliseconds - Date.now()) / 3600000;
          daysLeft = isNaN(hoursLeft) ? 0 : Math.round(hoursLeft);
        }

        newTableData.push({
          idServiciosAIT: data[i].idServiciosAIT,
          id: data[i].NumeroAIT,
          avance: data[i].AvanceEjecucion,
          name: data[i].NombreServicio,
          diasPendientes: daysLeft,
        });
      }
    }
  }
  newTableData?.sort((a: any, b: any) => a.diasPendientes - b.diasPendientes);
  const goToInformation = (idServiciosAIT: any) => {
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
          <DataTable.Title style={styles.shortColumn1}>Avance</DataTable.Title>
          <DataTable.Title style={styles.multiLineColumn}>
            Nombre
          </DataTable.Title>
          <DataTable.Title style={styles.shortColumn2}>
            Horas Atrasadas
          </DataTable.Title>
        </DataTable.Header>

        {/* Table data */}
        {newTableData.map((item: any, index) => (
          <DataTable.Row key={index}>
            <Text
              style={{
                flex: 0.75,
                color:
                  parseInt(item.diasPendientes as string) > 4
                    ? "black"
                    : parseInt(item.diasPendientes as string) > 0
                    ? "black"
                    : "black",
                alignSelf: "center",
                textAlign: "left",
              }}
            >
              {item.avance}%
            </Text>
            <Text
              style={{
                flex: 1,
                color:
                  parseInt(item.diasPendientes as string) > 4
                    ? "black"
                    : parseInt(item.diasPendientes as string) > 0
                    ? "black"
                    : "black",

                // alignSelf: "center",
                // textAlign: "center",
                // justifyContent: "center",
              }}
              onPress={() => goToInformation(item.idServiciosAIT)}
            >
              {item.name}
            </Text>
            <Text
              style={{
                flex: 1,
                color:
                  parseInt(item.diasPendientes as string) > 4
                    ? "black"
                    : parseInt(item.diasPendientes as string) > 0
                    ? "black"
                    : "black",
                justifyContent: "flex-end",
                alignItems: "flex-end",
                // textAlign: "center",
                textAlign: "right",
                alignSelf: "center",
              }}
            >
              0 Hr.
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
    flex: 1, // Adjust the value as per your requirement for the width
    justifyContent: "flex-end",
    alignItems: "flex-end",
  },
  multiLineColumn: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
  },
});
export default EstadoServiceList;
