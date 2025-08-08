import React from "react";
import { View, ScrollView, StyleSheet, Text } from "react-native";
import { DataTable } from "react-native-paper";
// import { screen } from "../../../utils";
import { useRouter } from "expo-router";

const MontoServiceList = (props: any) => {
  const router = useRouter();

  const { data } = props;
  const newTableData = [];

  if (data) {
    for (let i = 0; i < data.length; i++) {
      if (
        data[i].AvanceAdministrativoTexto !== "Standy by" &&
        data[i].AvanceAdministrativoTexto !== "Cancelacion"
      ) {
        const monto = Number(data[i].Monto) || 0;
        let price = monto;
        if (data[i].Moneda === "Dolares") price = monto * 3.5;
        else if (data[i].Moneda === "Euros") price = monto * 4;

        newTableData.push({
          idServiciosAIT: data[i].idServiciosAIT,
          id: data[i].NumeroAIT,
          name: data[i].NombreServicio,
          price,
          moneda: data[i].Moneda,
        });
      }
    }
  }

  newTableData?.sort((a, b) => b.price - a.price);
  const goToInformation = (idServiciosAIT: any) => {
    router.push({
      pathname: "/search/Item",
      params: { Item: idServiciosAIT },
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <DataTable>
        {/* Table header */}
        <DataTable.Header>
          <DataTable.Title style={styles.titulo2}>Nombre</DataTable.Title>
          <DataTable.Title style={styles.titulo3}>Valor</DataTable.Title>
        </DataTable.Header>

        {/* Table data */}
        {newTableData.map((item: any, index) => (
          <DataTable.Row key={index}>
            <Text
              style={styles.multiLineColumn}
              onPress={() => goToInformation(item.idServiciosAIT)}
            >
              {item.name}
            </Text>
            <DataTable.Cell style={styles.shortColumn2}>
              {"S/ "}
              {parseFloat(item.price).toLocaleString(undefined, {
                minimumFractionDigits: 2,
              })}
            </DataTable.Cell>
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
  titulo1: {
    flex: 0.77, // Adjust the value as per your requirement for the width
    maxWidth: 200, // Adjust the maxWidth as per your requirement
  },
  titulo2: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "flex-start",
    textAlign: "center",
    // flex: 1, // Adjust the value as per your requirement for the width
    // alignSelf: "flex-end",
  },
  titulo3: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "flex-end",
    textAlign: "center",
  },
  shortColumn1: {
    flex: 0.77, // Adjust the value as per your requirement for the width
    // maxWidth: 200, // Adjust the maxWidth as per your requirement
  },
  shortColumn2: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "flex-end",
    textAlign: "center",
    alignSelf: "center",
  },
  multiLineColumn: {
    flex: 2,
    maxWidth: 300,
  },
});
export default MontoServiceList;
