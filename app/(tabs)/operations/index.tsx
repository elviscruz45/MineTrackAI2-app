import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import EquipmentBrowser from "./EquipmentBrowser";

export default function OperationsIndex() {
  const router = useRouter();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f8fafc" }}>
      <View
        style={{
          flexDirection: "row",
          padding: 16,
          gap: 8,
          borderBottomWidth: 1,
          borderBottomColor: "#e2e8f0",
        }}
      >
        <TouchableOpacity
          onPress={() => router.push("/operations/new")}
          style={{
            flex: 1,
            backgroundColor: "#2A3B76",
            borderRadius: 10,
            padding: 14,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "700" }}>+ Nuevo registro</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.push("/operations/equipment")}
          style={{
            flex: 1,
            backgroundColor: "#e2e8f0",
            borderRadius: 10,
            padding: 14,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#334155", fontWeight: "700" }}>Ver equipos</Text>
        </TouchableOpacity>
      </View>
      <EquipmentBrowser />
    </SafeAreaView>
  );
}
