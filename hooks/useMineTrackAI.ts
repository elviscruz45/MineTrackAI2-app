/**
 * useMineTrackAI Hook
 * React Hook personalizado para facilitar el uso de MineTrackAI API
 * Provee funcionalidad de sync y chat con manejo de estado integrado
 */

import { useState, useCallback } from "react";
import {
  chatQuery,
  getStoreStatus,
  MetadataFilter,
} from "@/services/minetrackai-api";
import type { ChatResponse, StoreStatusResponse } from "@/config/api-config";
import {
  createEventWithSync,
  updateEventWithSync,
  deleteEventWithSync,
  syncServiciosAITDocument,
  AutoSyncResult,
} from "@/services/minetrackai-sync";
import type { EventData } from "@/services/minetrackai-sync";
import {
  getSyncQueue,
  getQueueStats,
  processSyncQueue,
  SyncOperation,
} from "@/services/sync-queue";
import Toast from "react-native-toast-message";

export interface UseMineTrackAIReturn {
  // Chat functions
  sendChatQuery: (
    question: string,
    filter?: MetadataFilter,
  ) => Promise<ChatResponse | null>;
  chatLoading: boolean;
  chatError: string | null;

  // Sync functions
  createEvent: (
    docId: string,
    eventData: EventData,
  ) => Promise<AutoSyncResult | null>;
  updateEvent: (
    docId: string,
    updateData: Partial<EventData>,
    fullData?: EventData,
  ) => Promise<AutoSyncResult | null>;
  deleteEvent: (docId: string) => Promise<AutoSyncResult | null>;
  syncServiciosAIT: (servicioAITId: string) => Promise<AutoSyncResult | null>;
  syncLoading: boolean;
  syncError: string | null;

  // Queue management
  getQueue: () => Promise<SyncOperation[]>;
  processQueue: () => Promise<void>;
  getStats: () => Promise<any>;
  queueCount: number;

  // Store info
  getStatus: () => Promise<StoreStatusResponse | null>;
  storeStatus: StoreStatusResponse | null;
  statusLoading: boolean;
}

/**
 * Hook personalizado para MineTrackAI
 */
export function useMineTrackAI(): UseMineTrackAIReturn {
  // Chat state
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);

  // Sync state
  const [syncLoading, setSyncLoading] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  // Queue state
  const [queueCount, setQueueCount] = useState(0);

  // Store status state
  const [storeStatus, setStoreStatus] = useState<StoreStatusResponse | null>(
    null,
  );
  const [statusLoading, setStatusLoading] = useState(false);

  /**
   * Enviar consulta de chat
   */
  const sendChatQuery = useCallback(
    async (
      question: string,
      filter?: MetadataFilter,
    ): Promise<ChatResponse | null> => {
      setChatLoading(true);
      setChatError(null);

      try {
        const response = await chatQuery(question, filter);
        return response;
      } catch (error: any) {
        const errorMessage = error.message || "Error al procesar consulta";
        setChatError(errorMessage);
        Toast.show({
          type: "error",
          text1: "Error en Chat",
          text2: errorMessage,
          position: "top",
        });
        return null;
      } finally {
        setChatLoading(false);
      }
    },
    [],
  );

  /**
   * Crear evento con auto-sync
   */
  const createEvent = useCallback(
    async (
      docId: string,
      eventData: EventData,
    ): Promise<AutoSyncResult | null> => {
      setSyncLoading(true);
      setSyncError(null);

      try {
        const result = await createEventWithSync("events", docId, eventData);

        if (result.apiSuccess) {
          Toast.show({
            type: "success",
            text1: "Evento Sincronizado",
            text2: "Datos enviados a MineTrackAI",
            position: "top",
            visibilityTime: 2000,
          });
        } else if (result.queuedForSync) {
          Toast.show({
            type: "info",
            text1: "Evento Encolado",
            text2: "Se sincronizará cuando haya conexión",
            position: "top",
          });
        }

        return result;
      } catch (error: any) {
        const errorMessage = error.message || "Error al crear evento";
        setSyncError(errorMessage);
        return null;
      } finally {
        setSyncLoading(false);
      }
    },
    [],
  );

  /**
   * Actualizar evento con auto-sync
   */
  const updateEvent = useCallback(
    async (
      docId: string,
      updateData: Partial<EventData>,
      fullData?: EventData,
    ): Promise<AutoSyncResult | null> => {
      setSyncLoading(true);
      setSyncError(null);

      try {
        const result = await updateEventWithSync(
          "events",
          docId,
          updateData,
          fullData,
        );

        if (result.apiSuccess) {
          Toast.show({
            type: "success",
            text1: "Evento Actualizado",
            text2: "Cambios sincronizados con MineTrackAI",
            position: "top",
            visibilityTime: 2000,
          });
        } else if (result.queuedForSync) {
          Toast.show({
            type: "info",
            text1: "Actualización Encolada",
            text2: "Se sincronizará cuando haya conexión",
            position: "top",
          });
        }

        return result;
      } catch (error: any) {
        const errorMessage = error.message || "Error al actualizar evento";
        setSyncError(errorMessage);
        return null;
      } finally {
        setSyncLoading(false);
      }
    },
    [],
  );

  /**
   * Eliminar evento con auto-sync
   */
  const deleteEvent = useCallback(
    async (docId: string): Promise<AutoSyncResult | null> => {
      setSyncLoading(true);
      setSyncError(null);

      try {
        const result = await deleteEventWithSync("events", docId);

        if (result.apiSuccess) {
          Toast.show({
            type: "success",
            text1: "Evento Eliminado",
            text2: "Eliminado del vector store",
            position: "top",
            visibilityTime: 2000,
          });
        } else if (result.queuedForSync) {
          Toast.show({
            type: "info",
            text1: "Eliminación Encolada",
            text2: "Se procesará cuando haya conexión",
            position: "top",
          });
        }

        return result;
      } catch (error: any) {
        const errorMessage = error.message || "Error al eliminar evento";
        setSyncError(errorMessage);
        return null;
      } finally {
        setSyncLoading(false);
      }
    },
    [],
  );

  /**
   * Sincronizar documento ServiciosAIT completo
   * Elimina versión anterior y sube la nueva
   */
  const syncServiciosAIT = useCallback(
    async (servicioAITId: string): Promise<AutoSyncResult | null> => {
      setSyncLoading(true);
      setSyncError(null);

      try {
        const result = await syncServiciosAITDocument(servicioAITId);

        if (result.apiSuccess) {
          Toast.show({
            type: "success",
            text1: "ServiciosAIT Sincronizado",
            text2: "Documento actualizado en MineTrackAI",
            position: "top",
            visibilityTime: 2000,
          });
        } else if (result.queuedForSync) {
          Toast.show({
            type: "info",
            text1: "Sincronización Encolada",
            text2: "Se procesará cuando haya conexión",
            position: "top",
          });
        }

        return result;
      } catch (error: any) {
        const errorMessage =
          error.message || "Error al sincronizar ServiciosAIT";
        setSyncError(errorMessage);
        return null;
      } finally {
        setSyncLoading(false);
      }
    },
    [],
  );

  /**
   * Obtener cola de sincronización
   */
  const getQueue = useCallback(async (): Promise<SyncOperation[]> => {
    try {
      const queue = await getSyncQueue();
      setQueueCount(queue.length);
      return queue;
    } catch (error) {
      console.error("Error getting queue:", error);
      return [];
    }
  }, []);

  /**
   * Procesar cola manualmente
   */
  const processQueue = useCallback(async (): Promise<void> => {
    try {
      const result = await processSyncQueue();

      if (result.processed > 0) {
        Toast.show({
          type: "success",
          text1: "Cola Procesada",
          text2: `${result.processed} operaciones sincronizadas`,
          position: "top",
        });
      }

      if (result.remaining > 0) {
        Toast.show({
          type: "warning",
          text1: "Operaciones Pendientes",
          text2: `${result.remaining} operaciones aún en cola`,
          position: "top",
        });
      }

      setQueueCount(result.remaining);
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Error Procesando Cola",
        text2: error.message || "Intente nuevamente",
        position: "top",
      });
    }
  }, []);

  /**
   * Obtener estadísticas de la cola
   */
  const getStats = useCallback(async () => {
    try {
      const stats = await getQueueStats();
      setQueueCount(stats.total);
      return stats;
    } catch (error) {
      console.error("Error getting stats:", error);
      return null;
    }
  }, []);

  /**
   * Obtener estado del vector store
   */
  const getStatus =
    useCallback(async (): Promise<StoreStatusResponse | null> => {
      setStatusLoading(true);

      try {
        const status = await getStoreStatus();
        setStoreStatus(status);
        return status;
      } catch (error: any) {
        Toast.show({
          type: "error",
          text1: "Error Obteniendo Estado",
          text2: error.message || "No se pudo conectar a la API",
          position: "top",
        });
        return null;
      } finally {
        setStatusLoading(false);
      }
    }, []);

  return {
    // Chat
    sendChatQuery,
    chatLoading,
    chatError,

    // Sync
    createEvent,
    updateEvent,
    deleteEvent,
    syncServiciosAIT,
    syncLoading,
    syncError,

    // Queue
    getQueue,
    processQueue,
    getStats,
    queueCount,

    // Store
    getStatus,
    storeStatus,
    statusLoading,
  };
}

/**
 * Ejemplo de uso:
 *
 * function MyComponent() {
 *   const { sendChatQuery, chatLoading, createEvent } = useMineTrackAI();
 *
 *   const handleChat = async () => {
 *     const response = await sendChatQuery('¿Qué servicios están completados?');
 *     if (response) {
 *       console.log(response.answer);
 *     }
 *   };
 *
 *   const handleCreate = async () => {
 *     const result = await createEvent('doc-123', eventData);
 *     console.log('Sync result:', result);
 *   };
 *
 *   return (
 *     <View>
 *       <Button onPress={handleChat} disabled={chatLoading} />
 *     </View>
 *   );
 * }
 */
