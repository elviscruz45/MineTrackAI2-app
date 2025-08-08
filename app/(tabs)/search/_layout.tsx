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
          title: "Servicios",
          headerShown: false,
          headerTitleAlign: "center", // Center the title
        }}
      />

      <Stack.Screen
        name="Item"
        options={{
          title: "Servicio",
          headerShown: true,
          headerTitleAlign: "center", // Center the title
          // headerTitle: () => <Text>Regresar</Text>,
        }}
      />
      <Stack.Screen
        name="file"
        options={{
          title: "Archivos",
          headerShown: true,
          headerTitleAlign: "center", // Center the title

          // headerShown: false,
          // presentation: "modal",
        }}
      />
      <Stack.Screen
        name="AddForms"
        options={{
          title: "Agregar Documento",
          headerShown: true,
          headerTitleAlign: "center", // Center the title

          // headerShown: false,
          // presentation: "modal",
        }}
      />
      <Stack.Screen
        name="moreDetail"
        options={{
          title: "Detalles del servicio",
          headerShown: true,
          headerTitleAlign: "center", // Center the title
          // headerTitle: () => <Text>Regresar</Text>,
        }}
      />
      <Stack.Screen
        name="CommentSearch"
        options={{
          title: "Comentarios",
          headerShown: true,
          headerTitleAlign: "center", // Center the title
          // headerTitle: () => <Text>Regresar</Text>,
        }}
      />
      <Stack.Screen
        name="DocstoApprove"
        options={{
          title: "Documentos por aprobar",
          headerShown: true,
          headerTitleAlign: "center", // Center the title
          // headerTitle: () => <Text>Regresar</Text>,
        }}
      />

      <Stack.Screen
        name="EditAIT"
        options={{
          title: "Editar Servicio",
          headerShown: true,
          headerTitleAlign: "center", // Center the title
          // headerTitle: () => <Text>Regresar</Text>,
        }}
      />

      <Stack.Screen
        name="EditEvent"
        options={{
          title: "Editar Evento",
          headerShown: true,
          headerTitleAlign: "center", // Center the title
          // headerTitle: () => <Text>Regresar</Text>,
        }}
      />
      <Stack.Screen
        name="Graph"
        options={{
          title: "Avance Gráfico",
          headerShown: true,
          headerTitleAlign: "center", // Center the title
          // headerTitle: () => <Text>Regresar</Text>,
        }}
      />
    </Stack>
  );
}
