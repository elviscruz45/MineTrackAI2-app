import React from "react";
import { View, ScrollView, StyleSheet, Text } from "react-native";
import { DataTable } from "react-native-paper";
// import { screen } from "../../../utils";
// import {screen}
import { useRouter } from "expo-router";

 const ServiceList = (props: any) => {
  const router = useRouter();

  const { data } = props;

  const newTableData = [];
  if (data) {
    for (let i = 0; i < data.length; i++) {
      if (
        data[i].AvanceAdministrativoTexto !== "Stand by" &&
        data[i].AvanceAdministrativoTexto !== "Cancelacion"
      ) {
        newTableData.push({
          idServiciosAIT: data[i].idServiciosAIT,

          id: data[i].NumeroAIT,
          name: data[i].NombreServicio,
          TipoServicio: data[i].TipoServicio,
        });
      }
    }
  }
  newTableData?.sort((a, b) => a.TipoServicio.localeCompare(b.TipoServicio));

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
          <DataTable.Title style={styles.shortColumn1}>Tipo</DataTable.Title>
          <DataTable.Title style={styles.multiLineColumn}>
            Nombre
          </DataTable.Title>
        </DataTable.Header>

        {/* Table data */}
        {newTableData.map((item, index) => (
          <DataTable.Row key={index}>
            <DataTable.Cell style={styles.shortColumn1}>
              {item.TipoServicio}
            </DataTable.Cell>

            <Text
              style={styles.multiLineColumn}
              onPress={() => goToInformation(item.idServiciosAIT)}
            >
              {item.name}
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
  },
  multiLineColumn: {
    flex: 2,
    alignSelf: "center",
  },
});
export default ServiceList;