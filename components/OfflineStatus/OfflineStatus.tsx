import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Alert, Platform } from "react-native";
import { Icon } from "@rneui/themed";
import * as Network from "expo-network";
import {
  getOfflineQueueStatus,
  clearOfflineQueue,
  checkConnectivityAndProcess,
} from "@/utils/offlineQueue";

interface OfflineStatusProps {
  showDetails?: boolean;
  onPress?: () => void;
}

const OfflineStatus: React.FC<OfflineStatusProps> = ({
  showDetails = true,
  onPress,
}) => {
  const [pendingCount, setPendingCount] = useState(0);
  const [isOnline, setIsOnline] = useState(true);
  const [loading, setLoading] = useState(false);

  const checkStatus = async () => {
    try {
      // Verificar conectividad
      if (Platform.OS === "web") {
        // En web, usar navigator.onLine
        setIsOnline(navigator.onLine);
      } else {
        // En mobile, usar expo-network
        const networkState = await Network.getNetworkStateAsync();
        setIsOnline(
          !!(networkState.isConnected && networkState.isInternetReachable)
        );
      }

      // Verificar cola offline
      const { pendingOperations } = await getOfflineQueueStatus();
      setPendingCount(pendingOperations);
    } catch (error) {
      console.error("Error checking offline status:", error);
    }
  };

  useEffect(() => {
    checkStatus();

    // Configurar listeners específicos para cada plataforma
    if (Platform.OS === "web") {
      // En web, escuchar eventos de online/offline
      const handleOnline = () => checkStatus();
      const handleOffline = () => checkStatus();

      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);

      // Actualizar estado cada 10 segundos
      const interval = setInterval(checkStatus, 10000);

      return () => {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
        clearInterval(interval);
      };
    } else {
      // En mobile, solo usar interval
      const interval = setInterval(checkStatus, 10000);
      return () => clearInterval(interval);
    }
  }, []);

  const handleSync = async () => {
    if (!isOnline) {
      Alert.alert(
        "Sin Conexión",
        "No hay conexión a internet. La sincronización se realizará automáticamente cuando se restablezca la conexión."
      );
      return;
    }

    setLoading(true);
    try {
      await checkConnectivityAndProcess();
      await checkStatus(); // Actualizar contadores
    } catch (error) {
      console.error("Error during manual sync:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearQueue = () => {
    Alert.alert(
      "Limpiar Cola Offline",
      `¿Estás seguro de que quieres eliminar ${pendingCount} operaciones pendientes? Esta acción no se puede deshacer.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            await clearOfflineQueue();
            await checkStatus();
          },
        },
      ]
    );
  };

  const handlePress = () => {
    if (onPress) {
      onPress();
      return;
    }

    if (pendingCount > 0) {
      Alert.alert(
        "Estado Offline",
        `Tienes ${pendingCount} operaciones pendientes de sincronización.`,
        [
          { text: "Cerrar", style: "cancel" },
          { text: "Sincronizar", onPress: handleSync },
          {
            text: "Limpiar Cola",
            style: "destructive",
            onPress: handleClearQueue,
          },
        ]
      );
    }
  };

  if (!showDetails && pendingCount === 0) {
    return null;
  }

  const getStatusColor = () => {
    if (!isOnline) return "#ff6b6b";
    if (pendingCount > 0) return "#ffa726";
    return "#4caf50";
  };

  const getStatusIcon = () => {
    if (loading) return "sync";
    if (!isOnline) return "cloud-off-outline";
    if (pendingCount > 0) return "cloud-upload-outline";
    return "cloud-done-outline";
  };

  const getStatusText = () => {
    if (!isOnline) return "Sin conexión";
    if (pendingCount > 0) return `${pendingCount} pendientes`;
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
        paddingVertical: 6,
        borderRadius: 20,
        marginHorizontal: 10,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.22,
        shadowRadius: 2.22,
      }}
    >
      <Icon
        name={getStatusIcon()}
        type="material"
        color="white"
        size={16}
        style={{ marginRight: 6 }}
      />
      {showDetails && (
        <Text
          style={{
            color: "white",
            fontSize: 12,
            fontWeight: "600",
          }}
        >
          {getStatusText()}
        </Text>
      )}
    </TouchableOpacity>
  );
};

export default OfflineStatus;
