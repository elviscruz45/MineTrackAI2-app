import React, { useState, useEffect } from "react";
import DateTimePicker from "@react-native-community/datetimepicker";
import { SafeAreaView } from "react-native-safe-area-context";
import { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import { Platform, Button } from "react-native";
import { Text } from "react-native";

function ChangeDisplayFechaInicio(props: any) {
  const { onClose, formik, setFechaInicio, showTimePicker, setShowTimePicker } =
    props;

  const [date, setDate] = useState(new Date());
  const [mode, setMode] = useState("date");
  const [show, setShow] = useState(false);

  const onChange = (event: any, selectedDate: any) => {
    const currentDate = selectedDate;
    setShow(false);
    setDate(currentDate);
    setFechaInicio(currentDate);
    formik.setFieldValue("FechaInicio", currentDate);
    if (Platform.OS === "ios") {
      onClose();
    }
    // onClose();
  };
  useEffect(() => {
    if (show === false) setShow(true);
  }, []);

  // const showMode = () => {
  //   DateTimePickerAndroid.open({
  //     value: date,
  //     onChange,
  //     // mode: mode,
  //     is24Hour: true,
  //   });
  // };

  const showMode = (currentMode: any) => {
    if (Platform.OS === "ios") {
      setShow(true);
      setMode(currentMode);
    } else {
      DateTimePickerAndroid.open({
        value: date,
        onChange,
        mode: currentMode,
        is24Hour: true,
      });
    }
  };

  const aceptar = () => {
    onClose();
  };

  const showDatepicker = () => {
    showMode("date");
  };

  const showTimepicker = () => {
    showMode("time");
  };

  if (Platform.OS === "ios") {
    return (
      <SafeAreaView>
        {show && (
          <>
            <DateTimePicker
              testID="dateTimePicker"
              value={date}
              // mode={mode}
              is24Hour={true}
              onChange={onChange}
              style={{ alignSelf: "center", backgroundColor: "#2A3B76" }}
            />
            {/* <Button onPress={aceptar} title="Aceptar" /> */}
          </>
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

export default ChangeDisplayFechaInicio;
