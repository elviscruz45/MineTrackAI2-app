import {
  View,
  Text,
  Pressable,
  useColorScheme,
  TouchableOpacity,
} from "react-native";
import React from "react";
import { Link, Tabs } from "expo-router";
import { Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
//   import { useAppDispatch } from "../../../reducers/hooks";
//   import { useAppSelector } from "../../../reducers/hooks";
//   import { setToFalse, setToTrue } from "../../../slices/slide";
import { useState } from "react";
// import Colors from "../../../constants/Colors";

//   function TabBarIcon(props: {
//     name: React.ComponentProps<typeof FontAwesome>["name"];
//     color: string;
//   }) {
//     return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
//   }

export default function _layout() {
  // const dispatch = useAppDispatch();
  // const modalState = useAppSelector((state) => state.modalSlice.value);
  // const colorScheme = useColorScheme();
  // const handleVisibleModalFalse = () => {
  //   dispatch(setToFalse());

  // };
  // const handleVisibleModalTrue = () => {
  //   dispatch(setToTrue());

  // };
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
          title: "report",
        }}
      />
    </Stack>
  );
}
