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
import { Ionicon as Ionicons } from "@/components/icons/AppIcon";

import { useState } from "react";

export default function _layout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "Perfil",
          headerShown: false,
          headerTitleAlign: "center", // Center the title
        }}
      />
      <Stack.Screen
        name="Approval"
        options={{
          title: "Lista de Aprobación",
          headerShown: true,
          headerTitleAlign: "center", // Center the title
        }}
      />
    </Stack>
  );
}
