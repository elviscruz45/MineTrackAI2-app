import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { Icon } from "@rneui/themed";
import { Platform } from "react-native";

interface OfflineFormOperation {
  id: string;
  type: "setDoc" | "updateDoc";
  collection: string;
  docId: string;
  data: any;
  timestamp: number;
  formType: "TitleForms" | "GeneralForms";
}

const OFFLINE_FORMS_QUEUE_KEY = "offline_forms_queue";

interface OfflineFormsStatusProps {
  onForceSync?: () => void;
}

const OfflineFormsStatus: React.FC<OfflineFormsStatusProps> = ({
  onForceSync,
}) => {
  const [queueCount, setQueueCount] = useState(0);
  const [isOnline, setIsOnline] = useState(true);

  const checkQueueStatus = async () => {
    try {
      let queue: OfflineFormOperation[] = [];

      if (Platform.OS === "web") {
        const stored = localStorage.getItem(OFFLINE_FORMS_QUEUE_KEY);
        queue = stored ? JSON.parse(stored) : [];
      } else {
        const AsyncStorage =
          require("@react-native-async-storage/async-storage").default;
        const stored = await AsyncStorage.getItem(OFFLINE_FORMS_QUEUE_KEY);
        queue = stored ? JSON.parse(stored) : [];
      }

      setQueueCount(queue.length);
    } catch (error) {
      console.error("Error checking queue status:", error);
      setQueueCount(0);
    }
  };

  const checkNetworkStatus = async () => {
    try {
      if (Platform.OS === "web") {
        setIsOnline(navigator.onLine);
      } else {
        const Network = require("expo-network");
        const networkState = await Network.getNetworkStateAsync();
        setIsOnline(
          !!(networkState.isConnected && networkState.isInternetReachable)
        );
      }
    } catch (error) {
      console.error("Error checking network:", error);
      setIsOnline(false);
    }
  };

  const handlePress = () => {
    if (queueCount > 0) {
      Alert.alert(
        "Formularios Offline",
        `Tienes ${queueCount} formularios pendientes de envío.\n\nTipos en cola: TitleForms y GeneralForms`,
        [
          { text: "OK", style: "cancel" },
          ...(onForceSync
            ? [
                {
                  text: "Sincronizar Ahora",
                  onPress: onForceSync,
                  style: "default" as const,
                },
              ]
            : []),
        ]
      );
    } else {
      Alert.alert(
        "Estado de Formularios",
        isOnline
          ? "Todos los formularios están sincronizados"
          : "Sin conexión. Los formularios se guardarán offline.",
        [{ text: "OK" }]
      );
    }
  };

  useEffect(() => {
    checkQueueStatus();
    checkNetworkStatus();

    // Actualizar cada 5 segundos
    const interval = setInterval(() => {
      checkQueueStatus();
      checkNetworkStatus();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  if (queueCount === 0 && isOnline) {
    return null; // No mostrar nada si todo está sincronizado
  }

  const getStatusColor = () => {
    if (!isOnline) return "#F44336"; // Rojo
    if (queueCount > 0) return "#FF9800"; // Naranja
    return "#4CAF50"; // Verde
  };

  const getStatusIcon = () => {
    if (!isOnline) return "cloud-off";
    if (queueCount > 0) return "cloud-upload";
    return "cloud-done";
  };

  const getStatusText = () => {
    if (!isOnline) return "Sin conexión";
    if (queueCount > 0) return `${queueCount} formularios pendientes`;
    return "Sincronizado";
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: getStatusColor(),
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        margin: 10,
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      }}
    >
      <Icon
        name={getStatusIcon()}
        type="material"
        color="white"
        size={18}
        style={{ marginRight: 8 }}
      />
      <Text
        style={{
          color: "white",
          fontSize: 13,
          fontWeight: "600",
        }}
      >
        {getStatusText()}
      </Text>
    </TouchableOpacity>
  );
};

export default OfflineFormsStatus;
