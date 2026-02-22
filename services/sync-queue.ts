/**
 * MineTrackAI Sync Queue Service
 * Gestiona la cola de sincronización offline para la API MineTrackAI
 * Guarda operaciones pendientes cuando la API falla o no hay conexión
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import {
  uploadEvent,
  syncEvent,
  deleteEvent,
  EventData,
  ApiError,
  isRateLimitError,
  isNetworkError,
} from "./minetrackai-api";
import { API_CONFIG } from "../config/api-config";

const SYNC_QUEUE_KEY = "minetrackai_sync_queue";

/**
 * Tipos de operaciones de sincronización
 */
export type SyncOperationType = "upload" | "sync" | "delete";

/**
 * Operación en la cola de sincronización
 */
export interface SyncOperation {
  id: string; // ID único de la operación
  type: SyncOperationType;
  firestoreId: string;
  eventData?: EventData;
  timestamp: number;
  retryCount: number;
  lastError?: string;
}

/**
 * Storage manager cross-platform (AsyncStorage mobile, localStorage web)
 */
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
 * Obtener la cola de sincronización actual
 */
export async function getSyncQueue(): Promise<SyncOperation[]> {
  try {
    const queueData = await StorageManager.getItem(SYNC_QUEUE_KEY);
    if (!queueData) return [];
    return JSON.parse(queueData);
  } catch (error) {
    console.error("Error reading sync queue:", error);
    return [];
  }
}

/**
 * Guardar la cola de sincronización
 */
async function saveSyncQueue(queue: SyncOperation[]): Promise<void> {
  try {
    await StorageManager.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
  } catch (error) {
    console.error("Error saving sync queue:", error);
    throw error;
  }
}

/**
 * Agregar una operación a la cola
 */
export async function addToSyncQueue(
  operation: Omit<SyncOperation, "timestamp" | "retryCount">,
): Promise<void> {
  try {
    const queue = await getSyncQueue();

    // Verificar si ya existe una operación pendiente para este ID
    const existingIndex = queue.findIndex(
      (op) =>
        op.firestoreId === operation.firestoreId && op.type === operation.type,
    );

    if (existingIndex !== -1) {
      // Actualizar la operación existente
      queue[existingIndex] = {
        ...operation,
        timestamp: Date.now(),
        retryCount: queue[existingIndex].retryCount,
      };
      console.log(
        `Updated existing sync operation: ${operation.type} - ${operation.firestoreId}`,
      );
    } else {
      // Agregar nueva operación
      queue.push({
        ...operation,
        timestamp: Date.now(),
        retryCount: 0,
      });
      console.log(
        `Added to sync queue: ${operation.type} - ${operation.firestoreId}`,
      );
    }

    await saveSyncQueue(queue);
  } catch (error) {
    console.error("Error adding to sync queue:", error);
    throw error;
  }
}

/**
 * Remover una operación de la cola
 */
async function removeFromQueue(operationId: string): Promise<void> {
  try {
    const queue = await getSyncQueue();
    const filteredQueue = queue.filter((op) => op.id !== operationId);
    await saveSyncQueue(filteredQueue);
    console.log(`Removed from sync queue: ${operationId}`);
  } catch (error) {
    console.error("Error removing from sync queue:", error);
  }
}

/**
 * Actualizar el contador de reintentos de una operación
 */
async function updateRetryCount(
  operationId: string,
  error: string,
): Promise<void> {
  try {
    const queue = await getSyncQueue();
    const operation = queue.find((op) => op.id === operationId);

    if (operation) {
      operation.retryCount++;
      operation.lastError = error;
      await saveSyncQueue(queue);
    }
  } catch (error) {
    console.error("Error updating retry count:", error);
  }
}

/**
 * Delay helper para respetar rate limit
 */
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Procesar una operación individual
 */
async function processOperation(operation: SyncOperation): Promise<boolean> {
  try {
    console.log(
      `Processing sync operation: ${operation.type} - ${operation.firestoreId}`,
    );

    switch (operation.type) {
      case "upload":
        if (operation.eventData) {
          await uploadEvent(operation.eventData);
        }
        break;

      case "sync":
        if (operation.eventData) {
          // Para operaciones de sync, primero eliminar y luego re-subir
          // Esto asegura que solo existe la versión más reciente
          try {
            await deleteEvent(operation.firestoreId);
            console.log(`🗑️ Deleted old version: ${operation.firestoreId}`);
          } catch (deleteError) {
            // Si no existe, continuar con upload
            console.log(`⚠️ Old version not found, proceeding with upload`);
          }

          // Subir nueva versión
          await uploadEvent(operation.eventData);
        }
        break;

      case "delete":
        await deleteEvent(operation.firestoreId);
        break;
    }

    console.log(
      `✓ Successfully processed: ${operation.type} - ${operation.firestoreId}`,
    );
    return true;
  } catch (error) {
    if (error instanceof ApiError) {
      console.error(
        `✗ Failed to process ${operation.type} - ${operation.firestoreId}:`,
        error.message,
      );

      // Si es rate limit, mantener en cola para retry
      if (isRateLimitError(error)) {
        await updateRetryCount(operation.id, error.message);
        return false;
      }

      // Si es error de red, mantener en cola
      if (isNetworkError(error)) {
        await updateRetryCount(operation.id, error.message);
        return false;
      }

      // Para otros errores, incrementar retry count
      await updateRetryCount(operation.id, error.message);

      // Si superó el límite de reintentos, eliminar de la cola
      if (operation.retryCount >= API_CONFIG.RETRY_ATTEMPTS) {
        console.warn(
          `Operation exceeded retry limit, removing: ${operation.id}`,
        );
        return true; // Retornar true para remover de la cola
      }

      return false;
    }

    console.error(`Unexpected error processing operation:`, error);
    await updateRetryCount(operation.id, String(error));
    return false;
  }
}

/**
 * Procesar toda la cola de sincronización
 * Respeta rate limit de 5 requests por minuto
 */
export async function processSyncQueue(): Promise<{
  processed: number;
  failed: number;
  remaining: number;
}> {
  const queue = await getSyncQueue();

  if (queue.length === 0) {
    console.log("Sync queue is empty, nothing to process");
    return { processed: 0, failed: 0, remaining: 0 };
  }

  console.log(`Processing sync queue: ${queue.length} operations pending`);

  let processedCount = 0;
  let failedCount = 0;
  const operationsToRemove: string[] = [];

  // Procesar operaciones respetando rate limit
  for (let i = 0; i < queue.length; i++) {
    const operation = queue[i];

    // Procesar la operación
    const success = await processOperation(operation);

    if (success) {
      operationsToRemove.push(operation.id);
      processedCount++;
    } else {
      failedCount++;
    }

    // Esperar entre requests para respetar rate limit (excepto en la última iteración)
    if (i < queue.length - 1) {
      await delay(API_CONFIG.RATE_LIMIT.DELAY_BETWEEN_REQUESTS);
    }
  }

  // Remover operaciones exitosas de la cola
  const updatedQueue = queue.filter(
    (op) => !operationsToRemove.includes(op.id),
  );
  await saveSyncQueue(updatedQueue);

  const result = {
    processed: processedCount,
    failed: failedCount,
    remaining: updatedQueue.length,
  };

  console.log("Sync queue processing complete:", result);
  return result;
}

/**
 * Limpiar toda la cola de sincronización
 */
export async function clearSyncQueue(): Promise<void> {
  try {
    await StorageManager.removeItem(SYNC_QUEUE_KEY);
    console.log("Sync queue cleared");
  } catch (error) {
    console.error("Error clearing sync queue:", error);
  }
}

/**
 * Obtener estadísticas de la cola
 */
export async function getQueueStats(): Promise<{
  total: number;
  byType: Record<SyncOperationType, number>;
  oldestTimestamp: number | null;
}> {
  const queue = await getSyncQueue();

  const stats = {
    total: queue.length,
    byType: {
      upload: 0,
      sync: 0,
      delete: 0,
    } as Record<SyncOperationType, number>,
    oldestTimestamp:
      queue.length > 0 ? Math.min(...queue.map((op) => op.timestamp)) : null,
  };

  queue.forEach((op) => {
    stats.byType[op.type]++;
  });

  return stats;
}
