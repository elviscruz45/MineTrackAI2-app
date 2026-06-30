import * as Network from "expo-network";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";
import { Platform } from "react-native";
import { createServicioAit, updateServicioAit } from "@/lib/db/serviciosAit";
import { createEvent, updateEvent } from "@/lib/db/events";
import { updateApproval } from "@/lib/db/approvals";
import { createManpower } from "@/lib/db/manpower";
import { createProject } from "@/lib/db/projects";
import { upsertProfile } from "@/lib/db/profiles";

const OFFLINE_QUEUE_KEY = "offline_supabase_queue";

export interface OfflineFirebaseOperation {
  id: string;
  type: "setDoc" | "updateDoc";
  data: any;
  timestamp: number;
  collection: string;
  docId?: string;
}

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

async function executeOfflineOperation(
  operation: OfflineFirebaseOperation
): Promise<void> {
  const { type, collection: col, docId, data } = operation;
  const id = docId ?? data?.idServiciosAIT ?? data?.idDocFirestoreDB ?? data?.idApproval;

  switch (col) {
    case "ServiciosAIT":
      if (type === "setDoc") {
        await createServicioAit(data);
      } else if (id) {
        await updateServicioAit(String(id), data);
      }
      break;
    case "events":
      if (type === "setDoc") {
        await createEvent({ ...data, idDocFirestoreDB: id });
      } else if (id) {
        await updateEvent(String(id), data);
      }
      break;
    case "approvals":
      if (id) {
        await updateApproval(String(id), data);
      }
      break;
    case "manpower":
      await createManpower(data);
      break;
    case "proyectos":
      await createProject({
        projectName: data.projectName,
        projectType: data.projectType ?? "",
      });
      break;
    case "users":
      if (data?.uid) {
        await upsertProfile(String(data.uid), data);
      }
      break;
    default:
      throw new Error(`Unsupported offline collection: ${col}`);
  }
}

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
        await executeOfflineOperation(operation);
        console.log(`Operación procesada: ${operation.id}`);
        processedCount++;
      } catch (error) {
        console.error(`Error procesando operación ${operation.id}:`, error);
        failedOperations.push(operation);
      }
    }

    if (failedOperations.length > 0) {
      await StorageManager.setItem(
        OFFLINE_QUEUE_KEY,
        JSON.stringify(failedOperations)
      );
      console.log(
        `${failedOperations.length} operaciones fallaron y permanecen en cola`
      );
    } else {
      await StorageManager.removeItem(OFFLINE_QUEUE_KEY);
      console.log("Cola offline procesada y limpiada completamente");
    }

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

export const checkConnectivityAndProcess = async (): Promise<void> => {
  try {
    if (Platform.OS === "web") {
      if (navigator.onLine) {
        await processOfflineQueue();
      }
    } else {
      const networkState = await Network.getNetworkStateAsync();
      if (networkState.isConnected && networkState.isInternetReachable) {
        await processOfflineQueue();
      }
    }
  } catch (error) {
    console.error("Error verificando conectividad:", error);
  }
};

export const safeFirebaseOperation = async (
  operation: () => Promise<void>,
  fallbackData: OfflineFirebaseOperation
): Promise<boolean> => {
  try {
    let isOnline = false;

    if (Platform.OS === "web") {
      isOnline = navigator.onLine;
    } else {
      const networkState = await Network.getNetworkStateAsync();
      isOnline = !!(
        networkState.isConnected && networkState.isInternetReachable
      );
    }

    if (isOnline) {
      await operation();
      return true;
    } else {
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
    console.error("Error en operación, guardando offline:", error);
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

export const getOfflineQueueStatus = async (): Promise<{
  pendingOperations: number;
  operations: OfflineFirebaseOperation[];
}> => {
  const queueData = await StorageManager.getItem(OFFLINE_QUEUE_KEY);
  const operations = queueData ? JSON.parse(queueData) : [];

  return {
    pendingOperations: operations.length,
    operations,
  };
};

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

export const useConnectivityMonitor = (intervalMs: number = 30000) => {
  const startMonitoring = () => {
    checkConnectivityAndProcess();

    if (Platform.OS === "web") {
      const handleOnline = () => checkConnectivityAndProcess();

      window.addEventListener("online", handleOnline);

      const interval = setInterval(async () => {
        await checkConnectivityAndProcess();
      }, intervalMs);

      return () => {
        window.removeEventListener("online", handleOnline);
        clearInterval(interval);
      };
    } else {
      const interval = setInterval(async () => {
        await checkConnectivityAndProcess();
      }, intervalMs);

      return () => clearInterval(interval);
    }
  };

  return { startMonitoring };
};
