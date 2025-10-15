import * as Network from "expo-network";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { doc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "@/firebaseConfig";
import Toast from "react-native-toast-message";
import { Platform } from "react-native";

// Offline queue configuration
const OFFLINE_QUEUE_KEY = "offline_firebase_queue";

export interface OfflineFirebaseOperation {
  id: string;
  type: "setDoc" | "updateDoc";
  data: any;
  timestamp: number;
  collection: string;
  docId?: string;
}

// Storage wrapper que usa localStorage en web y AsyncStorage en mobile
const StorageManager = {
  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === "web") {
      try {
        return localStorage.getItem(key);
      } catch (error) {
        console.error("Error accessing localStorage:", error);
        return null;
      }
    } else {
      return await AsyncStorage.getItem(key);
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === "web") {
      try {
        localStorage.setItem(key, value);
      } catch (error) {
        console.error("Error setting localStorage:", error);
        throw error;
      }
    } else {
      await AsyncStorage.setItem(key, value);
    }
  },

  async removeItem(key: string): Promise<void> {
    if (Platform.OS === "web") {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.error("Error removing from localStorage:", error);
        throw error;
      }
    } else {
      await AsyncStorage.removeItem(key);
    }
  },
};

/**
 * Agrega una operación Firebase a la cola offline
 */
export const queueFirebaseOperation = async (
  operation: OfflineFirebaseOperation
): Promise<void> => {
  try {
    const existingQueue = await StorageManager.getItem(OFFLINE_QUEUE_KEY);
    const queue = existingQueue ? JSON.parse(existingQueue) : [];
    queue.push(operation);
    await StorageManager.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
    console.log("Operación agregada a la cola offline:", operation.id);
  } catch (error) {
    console.error("Error al agregar operación a la cola offline:", error);
  }
};

/**
 * Procesa la cola offline cuando hay conexión
 */
export const processOfflineQueue = async (): Promise<void> => {
  try {
    const queueData = await StorageManager.getItem(OFFLINE_QUEUE_KEY);
    if (!queueData) return;

    const queue = JSON.parse(queueData);
    if (queue.length === 0) return;

    console.log(`Procesando ${queue.length} operaciones offline...`);
    let processedCount = 0;
    const failedOperations = [];

    for (const operation of queue) {
      try {
        if (operation.type === "setDoc") {
          await setDoc(
            doc(db, operation.collection, operation.docId),
            operation.data
          );
        } else if (operation.type === "updateDoc") {
          const docRef = doc(db, operation.collection, operation.docId);
          await updateDoc(docRef, operation.data);
        }
        console.log(`Operación procesada: ${operation.id}`);
        processedCount++;
      } catch (error) {
        console.error(`Error procesando operación ${operation.id}:`, error);
        // Mantener operaciones fallidas para reintento
        failedOperations.push(operation);
      }
    }

    // Actualizar la cola solo con operaciones fallidas
    if (failedOperations.length > 0) {
      await StorageManager.setItem(
        OFFLINE_QUEUE_KEY,
        JSON.stringify(failedOperations)
      );
      console.log(
        `${failedOperations.length} operaciones fallaron y permanecen en cola`
      );
    } else {
      // Limpiar la cola si todas las operaciones fueron exitosas
      await StorageManager.removeItem(OFFLINE_QUEUE_KEY);
      console.log("Cola offline procesada y limpiada completamente");
    }

    // Mostrar notificación de sincronización si se procesaron operaciones
    if (processedCount > 0) {
      Toast.show({
        type: "success",
        text1: "Sincronización Completa",
        text2: `${processedCount} operaciones sincronizadas con el servidor`,
        position: "top",
        visibilityTime: 4000,
      });
    }
  } catch (error) {
    console.error("Error procesando cola offline:", error);
  }
};

/**
 * Verifica la conectividad y procesa la cola si hay conexión
 */
export const checkConnectivityAndProcess = async (): Promise<void> => {
  try {
    // En web, asumimos conectividad si el navigator está online
    if (Platform.OS === "web") {
      if (navigator.onLine) {
        await processOfflineQueue();
      }
    } else {
      // En mobile, usar expo-network
      const networkState = await Network.getNetworkStateAsync();
      if (networkState.isConnected && networkState.isInternetReachable) {
        await processOfflineQueue();
      }
    }
  } catch (error) {
    console.error("Error verificando conectividad:", error);
  }
};

/**
 * Función wrapper para operaciones Firebase con manejo offline automático
 */
export const safeFirebaseOperation = async (
  operation: () => Promise<void>,
  fallbackData: OfflineFirebaseOperation
): Promise<boolean> => {
  try {
    let isOnline = false;

    if (Platform.OS === "web") {
      // En web, verificar con navigator.onLine
      isOnline = navigator.onLine;
    } else {
      // En mobile, usar expo-network
      const networkState = await Network.getNetworkStateAsync();
      isOnline = !!(
        networkState.isConnected && networkState.isInternetReachable
      );
    }

    if (isOnline) {
      // Hay conexión, ejecutar operación directamente
      await operation();
      return true;
    } else {
      // Sin conexión, agregar a cola offline
      await queueFirebaseOperation(fallbackData);
      Toast.show({
        type: "info",
        text1: "Guardado Offline",
        text2: "Los datos se sincronizarán cuando tengas conexión",
        position: "top",
        visibilityTime: 3000,
      });
      return false;
    }
  } catch (error) {
    // Error en la operación online, intentar guardar offline
    console.error("Error en operación Firebase, guardando offline:", error);
    await queueFirebaseOperation(fallbackData);
    Toast.show({
      type: "warning",
      text1: "Error de Conexión",
      text2: "Datos guardados offline para sincronizar después",
      position: "top",
      visibilityTime: 3000,
    });
    return false;
  }
};

/**
 * Obtiene el estado actual de la cola offline
 */
export const getOfflineQueueStatus = async (): Promise<{
  pendingOperations: number;
  operations: OfflineFirebaseOperation[];
}> => {
  try {
    const queueData = await StorageManager.getItem(OFFLINE_QUEUE_KEY);
    const operations = queueData ? JSON.parse(queueData) : [];

    return {
      pendingOperations: operations.length,
      operations,
    };
  } catch (error) {
    console.error("Error obteniendo estado de cola offline:", error);
    return {
      pendingOperations: 0,
      operations: [],
    };
  }
};

/**
 * Limpia manualmente la cola offline (uso administrativo)
 */
export const clearOfflineQueue = async (): Promise<void> => {
  try {
    await StorageManager.removeItem(OFFLINE_QUEUE_KEY);
    console.log("Cola offline limpiada manualmente");

    Toast.show({
      type: "info",
      text1: "Cola Offline Limpiada",
      text2: "Se eliminaron todas las operaciones pendientes",
      position: "top",
    });
  } catch (error) {
    console.error("Error limpiando cola offline:", error);
  }
};

/**
 * Hook para monitorear conectividad automáticamente
 */
export const useConnectivityMonitor = (intervalMs: number = 30000) => {
  const startMonitoring = () => {
    // Verificar cola offline al iniciar
    checkConnectivityAndProcess();

    if (Platform.OS === "web") {
      // En web, usar eventos de navigator y interval de respaldo
      const handleOnline = () => checkConnectivityAndProcess();

      window.addEventListener("online", handleOnline);

      // Interval de respaldo
      const interval = setInterval(async () => {
        await checkConnectivityAndProcess();
      }, intervalMs);

      return () => {
        window.removeEventListener("online", handleOnline);
        clearInterval(interval);
      };
    } else {
      // En mobile, usar solo interval
      const interval = setInterval(async () => {
        await checkConnectivityAndProcess();
      }, intervalMs);

      return () => clearInterval(interval);
    }
  };

  return { startMonitoring };
};
