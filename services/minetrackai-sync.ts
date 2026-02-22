/**
 * MineTrackAI Auto-Sync Service
 * Wrapper para operaciones de Firestore que automáticamente sincroniza con MineTrackAI API
 */

import { doc, setDoc, updateDoc, deleteDoc, getDoc } from "firebase/firestore";
import { db } from "@/firebaseConfig";
import {
  uploadEvent,
  syncEvent,
  deleteEvent as apiDeleteEvent,
  EventData,
  isRateLimitError,
  isNetworkError,
} from "./minetrackai-api";
import { addToSyncQueue } from "./sync-queue";

// Re-export EventData para uso en otros módulos
export type { EventData } from "./minetrackai-api";

/**
 * Interface para el resultado de operaciones auto-sync
 */
export interface AutoSyncResult {
  firestoreSuccess: boolean;
  apiSuccess: boolean;
  queuedForSync: boolean;
  error?: string;
}

/**
 * Sincronizar documento ServiciosAIT completo con MineTrackAI
 * Elimina la versión anterior y sube la nueva versión actualizada
 */
export async function syncServiciosAITDocument(
  servicioAITId: string,
): Promise<AutoSyncResult> {
  const result: AutoSyncResult = {
    firestoreSuccess: true, // Ya está guardado en Firestore
    apiSuccess: false,
    queuedForSync: false,
  };

  try {
    // 1. Obtener el documento completo actualizado de Firestore
    const docRef = doc(db, "ServiciosAIT", servicioAITId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      throw new Error(`Documento ServiciosAIT ${servicioAITId} no existe`);
    }

    const servicioData = docSnap.data() as EventData;
    servicioData.idServiciosAIT = servicioAITId; // Asegurar que tenga el ID

    console.log(`🔄 Syncing ServiciosAIT document: ${servicioAITId}`);

    // 2. Eliminar versión anterior del vector store
    try {
      await apiDeleteEvent(servicioAITId);
      console.log(`🗑️ Deleted old version from vector store: ${servicioAITId}`);
    } catch (deleteError: any) {
      // Si no existe o ya fue eliminado, continuar
      console.log(
        `⚠️ Could not delete old version (may not exist): ${deleteError.message}`,
      );
    }

    // 3. Subir nueva versión actualizada
    try {
      await uploadEvent(servicioData);
      result.apiSuccess = true;
      console.log(`✅ ServiciosAIT uploaded successfully: ${servicioAITId}`);
    } catch (uploadError: any) {
      console.warn(`⚠️ MineTrackAI upload failed: ${uploadError.message}`);
      result.error = uploadError.message;

      // 4. Si falla, agregar a cola de sincronización
      if (isNetworkError(uploadError) || isRateLimitError(uploadError)) {
        try {
          await addToSyncQueue({
            id: `sync-servicioait-${servicioAITId}-${Date.now()}`,
            type: "sync",
            firestoreId: servicioAITId,
            eventData: servicioData,
          });
          result.queuedForSync = true;
          console.log(`↻ Queued for sync: ServiciosAIT ${servicioAITId}`);
        } catch (queueError) {
          console.error("Failed to queue for sync:", queueError);
        }
      }
    }

    return result;
  } catch (error: any) {
    console.error("Error syncing ServiciosAIT document:", error);
    result.error = error.message;
    return result;
  }
}

/**
 * Crear un documento en Firestore y sincronizar con MineTrackAI
 * Automáticamente hace upload a la API después de setDoc exitoso
 */
export async function createEventWithSync(
  collectionName: string,
  docId: string,
  eventData: EventData,
): Promise<AutoSyncResult> {
  const result: AutoSyncResult = {
    firestoreSuccess: false,
    apiSuccess: false,
    queuedForSync: false,
  };

  try {
    // 1. Primero guardar en Firestore
    await setDoc(doc(db, collectionName, docId), eventData);
    result.firestoreSuccess = true;
    console.log(`✓ Firestore setDoc successful: ${docId}`);

    // 2. Intentar sincronizar con MineTrackAI API
    try {
      await uploadEvent(eventData);
      result.apiSuccess = true;
      console.log(`✓ MineTrackAI upload successful: ${docId}`);
    } catch (apiError: any) {
      console.warn(`⚠ MineTrackAI upload failed: ${apiError.message}`);
      result.error = apiError.message;

      // 3. Si falla, agregar a cola de sincronización
      // Solo encolar si es error de red/rate limit, no errores de datos
      if (isNetworkError(apiError) || isRateLimitError(apiError)) {
        try {
          await addToSyncQueue({
            id: `upload-${docId}-${Date.now()}`,
            type: "upload",
            firestoreId: docId,
            eventData: eventData,
          });
          result.queuedForSync = true;
          console.log(`↻ Queued for sync: upload ${docId}`);
        } catch (queueError) {
          console.error("Failed to queue for sync:", queueError);
        }
      }
    }

    return result;
  } catch (firestoreError: any) {
    console.error("Firestore setDoc failed:", firestoreError);
    result.error = firestoreError.message;
    throw firestoreError; // Propagar error de Firestore
  }
}

/**
 * Actualizar un documento en Firestore y sincronizar con MineTrackAI
 * Automáticamente hace sync a la API después de updateDoc exitoso
 */
export async function updateEventWithSync(
  collectionName: string,
  docId: string,
  updateData: Partial<EventData>,
  fullEventData?: EventData, // Datos completos del evento para la API
): Promise<AutoSyncResult> {
  const result: AutoSyncResult = {
    firestoreSuccess: false,
    apiSuccess: false,
    queuedForSync: false,
  };

  try {
    // 1. Primero actualizar en Firestore
    const docRef = doc(db, collectionName, docId);
    await updateDoc(docRef, updateData);
    result.firestoreSuccess = true;
    console.log(`✓ Firestore updateDoc successful: ${docId}`);

    // 2. Intentar sincronizar con MineTrackAI API
    try {
      // Usar datos completos si se proveen, sino usar los datos de actualización
      const dataToSync = fullEventData || (updateData as EventData);
      await syncEvent(docId, dataToSync);
      result.apiSuccess = true;
      console.log(`✓ MineTrackAI sync successful: ${docId}`);
    } catch (apiError: any) {
      console.warn(`⚠ MineTrackAI sync failed: ${apiError.message}`);
      result.error = apiError.message;

      // 3. Si falla, agregar a cola de sincronización
      if (isNetworkError(apiError) || isRateLimitError(apiError)) {
        try {
          const dataToSync = fullEventData || (updateData as EventData);
          await addToSyncQueue({
            id: `sync-${docId}-${Date.now()}`,
            type: "sync",
            firestoreId: docId,
            eventData: dataToSync,
          });
          result.queuedForSync = true;
          console.log(`↻ Queued for sync: update ${docId}`);
        } catch (queueError) {
          console.error("Failed to queue for sync:", queueError);
        }
      }
    }

    return result;
  } catch (firestoreError: any) {
    console.error("Firestore updateDoc failed:", firestoreError);
    result.error = firestoreError.message;
    throw firestoreError;
  }
}

/**
 * Eliminar un documento de Firestore y sincronizar con MineTrackAI
 * Automáticamente elimina del vector store después de deleteDoc exitoso
 */
export async function deleteEventWithSync(
  collectionName: string,
  docId: string,
): Promise<AutoSyncResult> {
  const result: AutoSyncResult = {
    firestoreSuccess: false,
    apiSuccess: false,
    queuedForSync: false,
  };

  try {
    // 1. Primero eliminar de Firestore
    await deleteDoc(doc(db, collectionName, docId));
    result.firestoreSuccess = true;
    console.log(`✓ Firestore deleteDoc successful: ${docId}`);

    // 2. Intentar eliminar de MineTrackAI API
    try {
      await apiDeleteEvent(docId);
      result.apiSuccess = true;
      console.log(`✓ MineTrackAI delete successful: ${docId}`);
    } catch (apiError: any) {
      console.warn(`⚠ MineTrackAI delete failed: ${apiError.message}`);
      result.error = apiError.message;

      // 3. Si falla, agregar a cola de sincronización
      if (isNetworkError(apiError) || isRateLimitError(apiError)) {
        try {
          await addToSyncQueue({
            id: `delete-${docId}-${Date.now()}`,
            type: "delete",
            firestoreId: docId,
          });
          result.queuedForSync = true;
          console.log(`↻ Queued for sync: delete ${docId}`);
        } catch (queueError) {
          console.error("Failed to queue for sync:", queueError);
        }
      }
    }

    return result;
  } catch (firestoreError: any) {
    console.error("Firestore deleteDoc failed:", firestoreError);
    result.error = firestoreError.message;
    throw firestoreError;
  }
}

/**
 * Helper para construir EventData completo desde datos de Firestore
 * Útil cuando solo tienes datos parciales de actualización
 */
export function buildEventData(
  baseData: any,
  updateData?: Partial<EventData>,
): EventData {
  return {
    ...baseData,
    ...updateData,
  };
}

/**
 * Wrapper para operaciones batch (múltiples eventos)
 * Procesa múltiples operaciones y retorna resultados
 */
export async function batchSyncEvents(
  operations: Array<{
    type: "create" | "update" | "delete";
    collection: string;
    docId: string;
    data?: EventData;
  }>,
): Promise<AutoSyncResult[]> {
  const results: AutoSyncResult[] = [];

  for (const op of operations) {
    try {
      let result: AutoSyncResult;

      switch (op.type) {
        case "create":
          if (!op.data) {
            throw new Error("Create operation requires data");
          }
          result = await createEventWithSync(op.collection, op.docId, op.data);
          break;

        case "update":
          if (!op.data) {
            throw new Error("Update operation requires data");
          }
          result = await updateEventWithSync(op.collection, op.docId, op.data);
          break;

        case "delete":
          result = await deleteEventWithSync(op.collection, op.docId);
          break;

        default:
          throw new Error(`Unknown operation type: ${(op as any).type}`);
      }

      results.push(result);
    } catch (error: any) {
      results.push({
        firestoreSuccess: false,
        apiSuccess: false,
        queuedForSync: false,
        error: error.message,
      });
    }
  }

  return results;
}
