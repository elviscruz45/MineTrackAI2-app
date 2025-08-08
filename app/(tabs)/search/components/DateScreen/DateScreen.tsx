import { View, Text, Button } from "react-native";
import React, { useEffect, useState } from "react";
import styles from "./DateScreen.styles";
import { connect } from "react-redux";
// import { EquipmentListUpper } from "../../../actions/home";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Platform, TouchableOpacity } from "react-native";

function DateScreen(props: any) {
  const [dateStart, setDateStart] = useState(new Date());
  const [dateEnd, setDateEnd] = useState(new Date());
  const [ios, setIos] = useState(false);
  const [androidDateStart, setAndroidDateStart] = useState(false);
  const [androidDateEnd, setAndroidDateEnd] = useState(false);
  const [androidDate, setAndroidDate] = useState(false);
  const [filtroText, setFiltroText] = useState("Sin Filtro");

  const { filterButton, quitFilterButton } = props;

  useEffect(() => {
    if (Platform.OS === "android") {
      setIos(false);
      setAndroidDate(true);
      // for iOS, add a button that closes the picker
    } else if (Platform.OS === "ios") {
      setIos(true);
      setAndroidDate(false);
      setAndroidDateStart(false);
      setAndroidDateEnd(false);
    }
  }, []);

  //methods that come from the parent
  const filter = () => {
    setFiltroText("Con Filtro");

    const startDate = dateStart.getTime();
    const endDate = dateEnd.getTime();
    const timeDifference = endDate - startDate;
    const daysDifference = timeDifference / (1000 * 3600 * 24);

    if (dateStart > dateEnd) {
      alert("La fecha de inicio no puede ser mayor a la fecha de fin");
    } else if (daysDifference >= 30) {
      alert("La diferencia entre las fechas no debe ser mayor a 30 días");
    } else if (new Date(startDate) > new Date()) {
      alert("La fecha de inicio no puede ser mayor a la fecha de hoy");
    } else {
      filterButton(dateStart, dateEnd);
    }
  };

  const QuitFilter = () => {
    setFiltroText("Sin Filtro");
    setDateEnd(new Date());
    setDateStart(new Date());
    quitFilterButton();
  };

  //methods to change the date
  const onChangeStart = (event: any, selectedDate: any) => {
    const currentDate = selectedDate;
    setAndroidDateStart(false);
    setDateStart(currentDate);
  };
  const onChangeEnd = (event: any, selectedDate: any) => {
    const currentDate = selectedDate;
    setAndroidDateEnd(false);
    setDateEnd(currentDate);
  };

  const showDatepickerStart = () => {
    setAndroidDateStart(true);
  };

  const showDatepickerEnd = () => {
    setAndroidDateEnd(true);
  };

  return (
    <>
      {Platform.OS === "web" && <View style={{ marginTop: 20 }}></View>}
      {Platform.OS === "web" ? (
        <View style={[styles.row, styles.center, { alignSelf: "center" }]}>
          <Text style={{ fontSize: 18, fontWeight: "bold", color: "" }}>
            Inicio:{" "}
          </Text>
          <input
            type="date"
            id="date"
            value={dateStart.toISOString().split("T")[0]}
            name="date"
            onChange={(event: any) => {
              const selectedDateString = event.target.value; // "YYYY-MM-DD" string
              const [year, month, day] = selectedDateString.split("-");
              const selectedDate = new Date(
                Number(year),
                Number(month) - 1,
                Number(day)
              ); // month is 0-indexed in JavaScript Date
              setDateStart(selectedDate);
              // formik.setFieldValue("fechaVencimiento", selectedDate);
            }}
          />
          <Text style={{ fontSize: 18, fontWeight: "bold", color: "" }}>
            {" "}
            Fin:{" "}
          </Text>
          <input
            type="date"
            value={dateEnd.toISOString().split("T")[0]}
            id="date"
            name="date"
            onChange={(event: any) => {
              const selectedDateString = event.target.value; // "YYYY-MM-DD" string
              const [year, month, day] = selectedDateString.split("-");
              const selectedDate = new Date(
                Number(year),
                Number(month) - 1,
                Number(day)
              ); // month is 0-indexed in JavaScript Date
              setDateEnd(selectedDate);
            }}
          />
        </View>
      ) : (
        <View style={[styles.row, styles.center]}>
          <Text></Text>

          <Text style={{ color: "" }}>Inicio:</Text>
          {androidDate && (
            <Button
              onPress={showDatepickerStart}
              color={"#2A3B76"}
              title={`${dateStart.toLocaleDateString(undefined, {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
              })}`}
            />
          )}
          {ios && (
            <DateTimePicker
              style={{ alignSelf: "center", backgroundColor: "#2A3B76" }}
              value={dateStart}
              mode={"date"}
              is24Hour={true}
              onChange={onChangeStart}
            />
          )}
          <Text style={{ color: "" }}>Fin</Text>

          {androidDate && (
            <Button
              onPress={showDatepickerEnd}
              color={"#2A3B76"}
              title={`${dateEnd.toLocaleDateString(undefined, {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
              })}`}
            />
          )}
          {androidDateStart && (
            <DateTimePicker
              value={dateStart}
              mode={"date"}
              is24Hour={true}
              onChange={onChangeStart}
            />
          )}
          {androidDateEnd && (
            <DateTimePicker
              value={dateEnd}
              mode={"date"}
              is24Hour={true}
              onChange={onChangeEnd}
            />
          )}

          {ios && (
            <DateTimePicker
              style={{ alignSelf: "center", backgroundColor: "#2A3B76" }}
              value={dateEnd}
              mode={"date"}
              is24Hour={true}
              onChange={onChangeEnd}
            />
          )}

          <Text></Text>

          <Text></Text>
        </View>
      )}
      {Platform.OS === "web" && <View style={{ marginTop: 20 }}></View>}

      <Text></Text>

      <Text></Text>

      <View style={[styles.row1]}>
        <View style={styles.filterViewButton}>
          <TouchableOpacity
            style={
              filtroText === "Con Filtro"
                ? styles.filterbutton
                : styles.filterbutton2
            }
            onPress={() => filter()}
          >
            <Text style={styles.filterButtonText}>Filtrar</Text>
          </TouchableOpacity>
        </View>
        <Text> </Text>

        <View style={styles.filterViewButton}>
          <TouchableOpacity
            style={
              filtroText === "Sin Filtro"
                ? styles.filterbutton
                : styles.filterbutton2
            }
            onPress={() => QuitFilter()}
          >
            <Text style={styles.filterButtonText}>Sin Filtro</Text>
          </TouchableOpacity>
        </View>
      </View>
      <Text></Text>
    </>
  );
}
export default DateScreen;
