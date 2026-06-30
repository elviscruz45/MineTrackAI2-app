import React, { useState, useEffect } from "react";
import RecursosProgress from "./RecursosProgress";
import { View, Text, StyleSheet, ScrollView, Image } from "react-native";
import { subscribeManpower } from "@/lib/db/manpower";
const RecursosHumanos = (props: any) => {
  const [manpower, setManpower] = useState<any>([]);
  // this useEffect is used to retrive all data from firebase
  useEffect(() => {
    if (!props.company) return;

    const unsubscribe = subscribeManpower((data) => {
      setManpower(data);
    });

    return () => {
      unsubscribe();
    };
  }, [props.company]);

  if (!manpower) {
    return (
      <>
        <View style={styles2.container22}>
          <Text
            style={{
              paddingHorizontal: 15,
              fontWeight: "600",
              textAlign: "center",
            }}
          >
            Disponibiliad Recursos
          </Text>
        </View>
        <Text></Text>
        <Text style={{ alignSelf: "center" }}>No Se ha reportado Todavia</Text>
      </>
    );
  }
  return (
    <>
      <View style={styles2.container22}>
        <Text
          style={{
            paddingHorizontal: 15,
            fontWeight: "600",
            textAlign: "center",
          }}
        >
          Disponibiliad Recursos
        </Text>
      </View>

      <Text></Text>

      <RecursosProgress
        cantidad={manpower?.Servicios}
        total={manpower?.TotalServicios}
        porcentaje={manpower?.Servicios / manpower?.TotalServicios}
        titulo={"Servicios"}
        unidad={"tecnicos de servicios"}
      />

      <RecursosProgress
        cantidad={manpower?.Ingenieria}
        total={manpower?.TotalIngenieria}
        porcentaje={manpower?.Ingenieria / manpower?.TotalIngenieria}
        titulo={"Ingenieria"}
        unidad={"tecnicos de ingenieria"}
      />

      <Text
        style={{
          paddingHorizontal: 15,
          fontWeight: "300",
          textAlign: "right",
          fontSize: 12,
        }}
      >
        Ultima Actualizacion: {manpower?.fechaPostFormato}
      </Text>
    </>
  );
};
const styles2 = StyleSheet.create({
  container22: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5FCFF",
  },
});
export default RecursosHumanos;
