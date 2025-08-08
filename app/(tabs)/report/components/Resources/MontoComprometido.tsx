import React from "react";
import { View, ScrollView, StyleSheet, Text } from "react-native";
import { DataTable } from "react-native-paper";

 const MontoComprometido = (props: any) => {
  const { data } = props;

  // Helper function to get the abbreviated month name
  function getMonthName(month: any) {
    const monthNames = [
      "ene",
      "feb",
      "mar",
      "abr",
      "may",
      "jun",
      "jul",
      "ago",
      "sep",
      "oct",
      "nov",
      "dic",
    ];
    return monthNames[month - 1];
  }

  // convertFirebaseTimestampToJSDate
  function convertFirebaseTimestampToJSDate(timestamp: any) {
    const { seconds, nanoseconds } = timestamp;
    const milliseconds = seconds * 1000 + nanoseconds / 1000000;

    return new Date(milliseconds);
  }

  // Grouping fruits by year and month and calculating the sum of values
  const ServicesByYearAndMonth: any = {};
  let ServicesByYearAndMonthList: any = [];
  if (data) {
    data.forEach((item: any) => {
      if (
        item.AvanceAdministrativoTexto !== "Stand by" &&
        item.AvanceAdministrativoTexto !== "Cancelacion"
      ) {
        const date =
          convertFirebaseTimestampToJSDate(item.NuevaFechaEstimada ?? 0) >
          convertFirebaseTimestampToJSDate(item.FechaFin)
            ? convertFirebaseTimestampToJSDate(item.NuevaFechaEstimada ?? 0)
            : convertFirebaseTimestampToJSDate(item.FechaFin);

        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const key = `${year} ${getMonthName(month)}`;
        if (!ServicesByYearAndMonth[key]) {
          ServicesByYearAndMonth[key] = {
            date: date,
            year: year.toString(),
            month: getMonthName(month),
            valueSum: 0,
          };
        }

        ServicesByYearAndMonth[key].valueSum +=
          item.Moneda === "Dolares"
            ? parseInt(item.Monto) * 3.5
            : item.Moneda === "Euros"
            ? parseInt(item.Monto) * 4
            : parseInt(item.Monto);
      }
    });

    ServicesByYearAndMonthList = Object.values(ServicesByYearAndMonth).sort(
      (a: any, b: any) => a.date - b.date
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <DataTable>
        {/* Table header */}
        <DataTable.Header>
          <DataTable.Title style={styles.multiLineColumn}>Año</DataTable.Title>
          <DataTable.Title style={styles.multiLineColumn}>Mes</DataTable.Title>
          <DataTable.Title style={{}}>Valor</DataTable.Title>
        </DataTable.Header>

        {/* Table data */}
        {ServicesByYearAndMonthList.map((item: any, index: any) => (
          <DataTable.Row key={index}>
            <DataTable.Cell style={styles.multiLineColumn}>
              {item.year}
            </DataTable.Cell>
            <DataTable.Cell style={styles.multiLineColumn}>
              {item.month}
            </DataTable.Cell>
            <DataTable.Cell style={styles.multiLineColumn}>
              {"S/ "}
              {parseFloat(item.valueSum).toLocaleString(undefined, {
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

  multiLineColumn: {
    flex: 1,
  },
});
export default MontoComprometido;