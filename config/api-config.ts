/**
 * MineTrackAI API Configuration
 * Configuración centralizada para la integración con MineTrackAI File Search API
 */

// Determinar entorno según variables de entorno o configuración de Expo
const __DEV__ = process.env.NODE_ENV === "development";

/**
 * Configuración de URLs de la API
 */

export const API_CONFIG = {
  // URL base de la API según el entorno
  BASE_URL: __DEV__
    ? "http://localhost:8080/api/v1"
    : "https://api-minetrackai-xxx.run.app/api/v1", // Actualizar con URL real de producción

  // Endpoints específicos
  ENDPOINTS: {
    // Events endpoints
    UPLOAD_EVENT: "/events", // POST - crear nuevo
    SYNC_EVENT: (id: string) => `/events/${id}`, // PUT - actualizar existente
    DELETE_EVENT: (id: string) => `/events/${id}`, // DELETE - eliminar
    BATCH_UPLOAD: "/events/batch", // POST - subir múltiples
    STORE_STATUS: "/events/status", // GET - estado del store

    // Chat endpoints
    CHAT: "/chat", // POST - query RAG
    CHAT_HEALTH: "/chat/health", // GET - health check
  },

  // Configuración de timeouts y reintentos
  TIMEOUT: 60000, // 60 segundos
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 segundo inicial
  MAX_RETRY_DELAY: 10000, // 10 segundos máximo

  // Rate limiting - respetar límites de la API
  RATE_LIMIT: {
    REQUESTS_PER_MINUTE: 5,
    DELAY_BETWEEN_REQUESTS: 12000, // 12 segundos entre requests (5 por minuto)
  },

  // Headers por defecto
  HEADERS: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
} as const;

/**
 * Helper para construir URLs completas
 */
export const buildApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

/**
 * Tipos de respuesta de la API
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface UploadEventResponse {
  success: boolean;
  message: string;
  eventId: string;
  vectorStoreFileId?: string;
}

export interface ChatResponse {
  success: boolean;
  answer: string;
  sources: Array<{
    filename: string;
    content: string;
  }>;
  error?: string;
}

export interface StoreStatusResponse {
  success: boolean;
  status: {
    id: string;
    name: string;
    fileCount: number;
    usageBytes: number;
  };
}
