import React from "react";
import { View, ScrollView, StyleSheet, Text } from "react-native";
import { DataTable } from "react-native-paper";
// import { screen } from "../../../utils";
import { useRouter } from "expo-router";

const MontoEDPList = (props: any) => {
  const router = useRouter();

  const { data } = props;
  const newTableData = [];

  if (data) {
    for (let i = 0; i < data.length; i++) {
      if (
        data[i].AvanceAdministrativoTexto !== "Stand by" &&
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
          etapa:
            data[i]["AvanceAdministrativoTexto"] === "Fin servicio" ||
            data[i]["AvanceAdministrativoTexto"] === "Registro de Pago"
              ? "Pagado"
              : data[i]["AvanceAdministrativoTexto"] === "Aprobacion EDP" ||
                data[i]["AvanceAdministrativoTexto"] === "Envio EDP"
              ? "NoPagado"
              : data[i]["AvanceEjecucion"] === "100"
              ? "Compl"
              : "Ejec",
        });
      }
    }
  }
  newTableData?.sort((a, b) => b.price - a.price);

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

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <DataTable>
        {/* Table header */}
        <DataTable.Header>
          <DataTable.Title style={styles.multiLineColumn}>
            Nombre
          </DataTable.Title>
          <DataTable.Title style={styles.shortColumn2}> </DataTable.Title>
          <DataTable.Title style={styles.shortColumn3}>Valor</DataTable.Title>
        </DataTable.Header>

        {/* Table data */}
        {newTableData.map((item: any, index) => (
          <DataTable.Row key={index}>
            <Text
              style={{
                flex: 1,
                alignSelf: "flex-start",
                color: item.etapa === "NoPagado" ? "red" : "black",
                maxWidth: 300,
              }}
              onPress={() => goToInformation(item.idServiciosAIT)}
            >
              {item.name}
            </Text>
            <Text
              style={{
                flex: 1,
                alignSelf: "center",

                color: item.etapa === "NoPagado" ? "red" : "black",
                justifyContent: "flex-end",
                alignItems: "flex-end",
                textAlign: "center",
              }}
            >
              {item.etapa}
            </Text>
            <Text
              style={{
                flex: 0,
                alignSelf: "center",
                color: item.etapa === "NoPagado" ? "red" : "black",
                justifyContent: "flex-end",
                alignItems: "flex-end",
                textAlign: "center",
              }}
            >
              S/
              {parseFloat(item?.price).toLocaleString(undefined, {
                minimumFractionDigits: 2,
              })}
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
    // padding: 16,
    backgroundColor: "#fff",
  },

  shortColumn1: {
    flex: 0.77, // Adjust the value as per your requirement for the width
    maxWidth: 200, // Adjust the maxWidth as per your requirement
  },
  shortColumn2: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
  },
  shortColumn3: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "flex-end",
    textAlign: "left",
  },
  multiLineColumn: {
    flex: 1,
    maxWidth: 300,
  },
});

export default MontoEDPList;
