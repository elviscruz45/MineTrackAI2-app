/**
 * MineTrackAI API Service
 * Servicio centralizado para la integración con MineTrackAI File Search API
 * Maneja upload, sync, delete de eventos y consultas RAG mediante chat
 */

import {
  API_CONFIG,
  buildApiUrl,
  ApiResponse,
  UploadEventResponse,
  ChatResponse,
  StoreStatusResponse,
} from "../config/api-config";

/**
 * Error personalizado para errores de API
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public isRateLimit: boolean = false,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Delay helper para retry logic
 */
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Calcula el delay exponencial para reintentos
 */
const getExponentialDelay = (attempt: number): number => {
  const exponentialDelay = API_CONFIG.RETRY_DELAY * Math.pow(2, attempt);
  return Math.min(exponentialDelay, API_CONFIG.MAX_RETRY_DELAY);
};

/**
 * Wrapper de fetch con manejo de errores, timeout y retry logic
 */
async function fetchWithRetry<T = any>(
  url: string,
  options: RequestInit = {},
  retryCount: number = 0,
): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

  //-------------aqui es donde trae del backend la info de minetrackai api
  console.log("===========>", "Fetching URL:", url);
  console.log("===========>", "options:", options);
  console.log("===========>", "headers", options.headers);
  console.log("===========>", "signal", controller.signal);
  console.log("===========>", "TOTAL", {
    ...options,
    signal: controller.signal,
    headers: {
      ...API_CONFIG.HEADERS,
      ...options.headers,
    },
  });

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        ...API_CONFIG.HEADERS,
        ...options.headers,
      },
    });
    //---------------aqui es donde trae del backend la info de minetrackai api

    clearTimeout(timeoutId);

    // Manejar rate limit (429)
    if (response.status === 429) {
      if (retryCount < API_CONFIG.RETRY_ATTEMPTS) {
        const retryDelay = getExponentialDelay(retryCount);
        console.warn(
          `Rate limit alcanzado (429). Reintentando en ${retryDelay}ms... (Intento ${retryCount + 1}/${API_CONFIG.RETRY_ATTEMPTS})`,
        );
        await delay(retryDelay);
        return fetchWithRetry<T>(url, options, retryCount + 1);
      } else {
        throw new ApiError(
          "Rate limit excedido. Intente nuevamente en unos minutos.",
          429,
          true,
        );
      }
    }

    // Manejar errores de servidor
    if (!response.ok) {
      let errorMessage = `Error HTTP ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.message || errorMessage;
      } catch {
        // Si no puede parsear JSON, usar mensaje por defecto
      }

      // Reintentar errores 5xx
      if (response.status >= 500 && retryCount < API_CONFIG.RETRY_ATTEMPTS) {
        const retryDelay = getExponentialDelay(retryCount);
        console.warn(
          `Error del servidor (${response.status}). Reintentando en ${retryDelay}ms... (Intento ${retryCount + 1}/${API_CONFIG.RETRY_ATTEMPTS})`,
        );
        await delay(retryDelay);
        return fetchWithRetry<T>(url, options, retryCount + 1);
      }

      throw new ApiError(errorMessage, response.status);
    }

    const data = await response.json();
    return data as T;
  } catch (error) {
    clearTimeout(timeoutId);

    // Si es un error de timeout
    if (error instanceof Error && error.name === "AbortError") {
      if (retryCount < API_CONFIG.RETRY_ATTEMPTS) {
        const retryDelay = getExponentialDelay(retryCount);
        console.warn(
          `Timeout. Reintentando en ${retryDelay}ms... (Intento ${retryCount + 1}/${API_CONFIG.RETRY_ATTEMPTS})`,
        );
        await delay(retryDelay);
        return fetchWithRetry<T>(url, options, retryCount + 1);
      }
      throw new ApiError("Request timeout. Por favor intente nuevamente.");
    }

    // Propagar ApiError sin modificar
    if (error instanceof ApiError) {
      throw error;
    }

    // Errores de red
    if (error instanceof Error) {
      throw new ApiError(
        `Error de red: ${error.message}. Verifique su conexión a internet.`,
      );
    }

    throw new ApiError("Error desconocido al realizar la petición");
  }
}

/**
 * Formato de datos de evento para la API
 */
export interface EventData {
  // Datos del servicio (ServiciosAIT)
  idServiciosAIT?: string;
  NombreServicio?: string;
  NumeroAIT?: string;
  TipoServicio?: string;
  AreaServicio?: string;
  EmpresaMinera?: string;

  // Datos del evento individual
  idDocFirestoreDB?: string;
  titulo?: string;
  comentarios?: string;
  nombrePerfil?: string;
  emailPerfil?: string;
  fechaPostFormato?: string;
  porcentajeAvance?: string;
  etapa?: string;
  visibilidad?: string;

  // Cualquier otro campo relevante
  [key: string]: any;
}

/**
 * Filtros de metadata para búsqueda
 */
export interface MetadataFilter {
  estado?: string; // "Completado", "En Progreso", etc.
  tecnico?: string; // Nombre del técnico
  area?: string; // Área del servicio
  fechaDesde?: string; // ISO date string
  fechaHasta?: string; // ISO date string
  [key: string]: string | undefined;
}

/**
 * Upload de un nuevo evento a la API MineTrackAI
 */
export async function uploadEvent(
  eventData: EventData,
): Promise<UploadEventResponse> {
  try {
    console.log("Uploading event to MineTrackAI:", eventData.idServiciosAIT);
    console.log("Uploading event to MineTrackAI:", eventData);

    const url = buildApiUrl(API_CONFIG.ENDPOINTS.UPLOAD_EVENT);
    const response = await fetchWithRetry<UploadEventResponse>(url, {
      method: "POST",
      body: JSON.stringify({
        eventId: eventData.idServiciosAIT,
        data: eventData,
      }),
    });

    console.log("Event uploaded successfully:", response.eventId);
    return response;
  } catch (error) {
    console.error("Error uploading event:", error);
    throw error;
  }
}

/**
 * Sincronizar (actualizar) un evento existente
 */
export async function syncEvent(
  firestoreId: string,
  eventData: EventData,
): Promise<UploadEventResponse> {
  try {
    console.log("Syncing event with MineTrackAI:", eventData.idServiciosAIT);

    const url = buildApiUrl(API_CONFIG.ENDPOINTS.SYNC_EVENT(firestoreId));
    const response = await fetchWithRetry<UploadEventResponse>(url, {
      method: "PUT",
      body: JSON.stringify(eventData),
    });

    console.log("Event synced successfully:", response.eventId);
    return response;
  } catch (error) {
    console.error("Error syncing event:", error);
    throw error;
  }
}

/**
 * Eliminar un evento del vector store
 */
export async function deleteEvent(firestoreId: string): Promise<ApiResponse> {
  try {
    console.log("Deleting event from MineTrackAI:", firestoreId);

    const url = buildApiUrl(API_CONFIG.ENDPOINTS.DELETE_EVENT(firestoreId));
    const response = await fetchWithRetry<ApiResponse>(url, {
      method: "DELETE",
    });

    console.log("Event deleted successfully:", firestoreId);
    return response;
  } catch (error) {
    console.error("Error deleting event:", error);
    throw error;
  }
}

/**
 * Realizar consulta en lenguaje natural mediante chat RAG
 */
export async function chatQuery(
  question: string,
  metadataFilter?: MetadataFilter,
): Promise<ChatResponse> {
  try {
    console.log("Sending chat query to MineTrackAI:", question);

    const url = buildApiUrl(API_CONFIG.ENDPOINTS.CHAT);
    const response = await fetchWithRetry<ChatResponse>(url, {
      method: "POST",
      body: JSON.stringify({
        question,
        metadata_filter: metadataFilter,
      }),
    });

    console.log(
      "Chat query successful, sources count:",
      response.sources?.length || 0,
    );
    return response;
  } catch (error) {
    console.error("Error in chat query:", error);
    throw error;
  }
}

/**
 * Obtener estado del vector store
 */
export async function getStoreStatus(): Promise<StoreStatusResponse> {
  try {
    console.log("Fetching vector store status...");

    const url = buildApiUrl(API_CONFIG.ENDPOINTS.STORE_STATUS);
    const response = await fetchWithRetry<StoreStatusResponse>(url, {
      method: "GET",
    });

    console.log("Store status:", response.status);
    return response;
  } catch (error) {
    console.error("Error fetching store status:", error);
    throw error;
  }
}

/**
 * Helper para verificar si un error es de rate limit
 */
export function isRateLimitError(error: any): boolean {
  return error instanceof ApiError && error.isRateLimit;
}

/**
 * Helper para verificar si un error es de red/offline
 */
export function isNetworkError(error: any): boolean {
  if (error instanceof ApiError) {
    return (
      error.message.includes("Error de red") ||
      error.message.includes("timeout")
    );
  }
  return false;
}
