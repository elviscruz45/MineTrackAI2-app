import React, { useState, useEffect } from "react";
import DateTimePicker from "@react-native-community/datetimepicker";
import { SafeAreaView } from "react-native-safe-area-context";
import { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import { Platform, Button, View } from "react-native";
import { Text } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";

function ChangeDisplayFechaFin(props: any) {
  const router = useRouter();

  const { onClose, setData, codigo, data, tipo } = props;

  const [date, setDate] = useState(new Date());
  const [mode, setMode] = useState("date");
  const [show, setShow] = useState(false);

  const onChange = (event: any, selectedDate: any) => {
    const currentDate = selectedDate;
    setShow(false);
    setDate(currentDate);

    // formik.setFieldValue("FechaFin", currentDate);
    // onClose();
    if (Platform.OS === "ios") {
      onClose();
    }
  };

  useEffect(() => {
    if (show === false) setShow(true);
  }, []);

  const showMode = (currentMode: any) => {
    DateTimePickerAndroid.open({
      value: date,
      onChange,
      mode: currentMode,
      is24Hour: true,
    });
  };

  const aceptar = () => {
    // setData("holaa");
    // setData((data: any) =>
    // );

    if (tipo === "Inicio") {
      setData(
        data?.map((item: any) =>
          item.Codigo === codigo
            ? {
                ...item,
                RealFechaInicio: date.toISOString(),
              }
            : item
        )
      );
    } else {
      setData(
        data?.map((item: any) =>
          item.Codigo === codigo
            ? {
                ...item,
                RealFechaFin: date.toISOString(),
              }
            : item
        )
      );
    }
    // router.back();

    onClose();
  };

  const showDatepicker = () => {
    showMode("date");
  };

  const showTimepicker = () => {
    showMode("time");
  };
  if (Platform.OS === "web") {
    return (
      <View style={{ marginHorizontal: 10 }}>
        <Text> </Text>
        <Text style={{ fontSize: 18, fontWeight: "bold", color: "gray" }}>
          Fecha de Inicio
        </Text>
        <Text> </Text>
        <input
          type="datetime-local"
          id="date"
          name="date"
          lang="es"
          onChange={(event: any) => {
            const selectedDateTimeString = event.target.value; // "YYYY-MM-DDThh:mm"
            const [dateStr, timeStr] = selectedDateTimeString.split("T");
            const [year, month, day] = dateStr.split("-");
            const [hours, minutes] = timeStr
              ? timeStr.split(":")
              : ["00", "00"];
            const selectedDate = new Date(
              Number(year),
              Number(month) - 1,
              Number(day),
              Number(hours),
              Number(minutes)
            );
            setDate(selectedDate); // <-- THIS LINE IS NEEDED!
          }}
        />
        <Text> </Text>
        <Button onPress={aceptar} title="Aceptar" />
      </View>
    );
  } else if (Platform.OS === "ios") {
    return (
      <SafeAreaView>
        {show && (
          <DateTimePicker
            testID="dateTimePicker"
            value={date}
            is24Hour={true}
            onChange={onChange}
            style={{ alignSelf: "center", backgroundColor: "#2A3B76" }}
          />
        )}
      </SafeAreaView>
    );
  } else {
    return (
      <SafeAreaView>
        <Button onPress={showDatepicker} title="Dia" />
        <Text> </Text>
        <Button onPress={showTimepicker} title="Hora" />
        <Text> </Text>
        <Text>Tiempo: {date.toLocaleString()}</Text>
        <Button onPress={aceptar} title="Aceptar" />
      </SafeAreaView>
    );
  }
}

export default ChangeDisplayFechaFin;
