# MineTrackAI API Integration

Integración completa de la API MineTrackAI File Search en la aplicación React Native/Expo para sincronización automática de eventos de mantenimiento y consultas RAG mediante chat.

## 📋 Componentes Creados

### 1. Configuración API

- **`config/api-config.ts`**: Configuración centralizada de URLs, timeouts, rate limits y tipos de respuesta
  - Desarrollo: `http://localhost:8080/api/v1`
  - Producción: Actualizar con URL de Cloud Run

### 2. Servicios Core

- **`services/minetrackai-api.ts`**: Cliente API con métodos:
  - `uploadEvent(eventData)`: Subir nuevo evento al vector store
  - `syncEvent(firestoreId, eventData)`: Actualizar evento existente
  - `deleteEvent(firestoreId)`: Eliminar evento del vector store
  - `chatQuery(question, metadataFilter?)`: Consultas RAG en lenguaje natural
  - `getStoreStatus()`: Obtener estadísticas del vector store
  - Incluye retry logic exponencial y manejo de rate limit (429)

- **`services/sync-queue.ts`**: Sistema de cola offline
  - Almacenamiento cross-platform (AsyncStorage/localStorage)
  - Procesamiento automático con respeto a rate limits (5 req/min)
  - Reintentos configurables para operaciones fallidas

- **`services/minetrackai-sync.ts`**: Wrappers para auto-sync
  - `createEventWithSync()`: Firestore setDoc + API upload
  - `updateEventWithSync()`: Firestore updateDoc + API sync
  - `deleteEventWithSync()`: Firestore deleteDoc + API delete
  - Manejo automático de errores con fallback a cola

### 3. UI - Chat RAG

- **`app/(tabs)/chat/index.tsx`**: Pantalla de chat con:
  - Interfaz de mensajes usuario/asistente
  - Filtros rápidos (Completados, En Progreso, Pendientes, Todos)
  - Preguntas sugeridas para nuevos usuarios
  - Visualización de fuentes (sources) de respuestas
  - Integración completa con `chatQuery` API

### 4. Integración Auto-Sync

- **`app/(tabs)/post/Information.tsx`**: Modificado para auto-sync
  - Llamadas automáticas a `createEventWithSync` después de setDoc
  - Sincronización transparente sin bloquear UI
  - Fallback a cola si API falla

- **`app/_layout.tsx`**: Procesamiento automático de cola
  - Listener de reconexión (web: `window.online`, mobile: NetInfo)
  - Verificación periódica cada 2 minutos
  - Notificaciones de sincronización exitosa

- **`app/(tabs)/_layout.tsx`**: Añadida pestaña "Chat AI" en navegación

## 🚀 Configuración Inicial

### 1. Actualizar URL de Producción

Editar `config/api-config.ts`:

```typescript
BASE_URL: __DEV__
  ? 'http://localhost:8080/api/v1'
  : 'https://TU-URL-CLOUD-RUN.run.app/api/v1', // ⬅️ Actualizar aquí
```

### 2. Instalar Dependencias

Las dependencias ya están instaladas:

- `@react-native-async-storage/async-storage`
- `expo-network`
- `react-native-toast-message`

### 3. Variables de Entorno (Opcional)

Crear `.env` en la raíz del proyecto:

```env
MINETRACKAI_API_URL=http://localhost:8080/api/v1
MINETRACKAI_TIMEOUT=60000
MINETRACKAI_RETRY_ATTEMPTS=3
```

## 🧪 Testing y Validación

### Test 1: Crear Evento y Verificar Upload

1. Iniciar la API local:

   ```bash
   cd ../api-minetrackai
   npm run dev  # Puerto 8080
   ```

2. En la app, crear un nuevo evento de mantenimiento:
   - Ir a la pestaña "Publicar"
   - Llenar el formulario de información
   - Enviar

3. Verificar en logs de la app:

   ```
   ✓ Firestore setDoc successful: [ID]
   ✓ MineTrackAI upload successful: [ID]
   ```

4. Verificar en API:
   ```bash
   curl http://localhost:8080/api/v1/events/status
   ```
   Debe mostrar el evento recién creado.

### Test 2: Actualizar Evento y Verificar Sync

1. Editar un evento existente en la app
2. Verificar logs:
   ```
   ✓ Firestore updateDoc successful: [ID]
   ✓ MineTrackAI sync successful: [ID]
   ```

### Test 3: Chat RAG - Consultas en Lenguaje Natural

1. Ir a la pestaña "Chat AI"
2. Probar consultas:
   - "¿Qué mantenimientos están completados?"
   - "Muéstrame los servicios del área de minería"
   - "¿Cuáles son los eventos de esta semana?"

3. Verificar:
   - Respuesta con contenido relevante
   - Fuentes (sources) mostradas como chips clicables
   - Filtros rápidos funcionando

### Test 4: Modo Offline - Queue System

1. Simular modo offline:
   - Web: Desactivar red en DevTools (Network tab → Offline)
   - Mobile: Activar modo avión

2. Crear/actualizar eventos → Debe aparecer:

   ```
   📱 Sin conexión, guardando offline
   ```

3. Reconectar a internet

4. Verificar auto-sync:

   ```
   🌐 Network reconnected - processing MineTrackAI queue...
   ✓ Successfully processed: upload - [ID]
   Toast: "X eventos sincronizados con MineTrackAI"
   ```

5. Verificar en API que los eventos se subieron:
   ```bash
   curl http://localhost:8080/api/v1/events/status
   ```

### Test 5: Rate Limit Handling

1. Crear 10+ eventos rápidamente
2. Observar en logs:
   ```
   Rate limit alcanzado (429). Reintentando en [delay]ms...
   ```
3. Verificar que los eventos se encolan automáticamente
4. Verificar procesamiento gradual (5 requests/minuto)

### Test 6: Error Recovery

1. Detener la API (simular server down)
2. Crear eventos en la app
3. Verificar encolamiento:
   ```
   ⚠ MineTrackAI upload failed: Error de red
   ↻ Queued for sync: upload [ID]
   ```
4. Reiniciar API
5. Verificar auto-recovery en siguiente ciclo (2 min o al reconectar)

## 📊 Monitoreo

### Verificar Estado de la Cola

```typescript
import { getQueueStats } from "@/services/sync-queue";

const stats = await getQueueStats();
console.log("Queue stats:", stats);
// Output: { total: 5, byType: { upload: 3, sync: 2, delete: 0 }, oldestTimestamp: ... }
```

### Limpiar Cola Manualmente (Solo Debug)

```typescript
import { clearSyncQueue } from "@/services/sync-queue";
await clearSyncQueue();
```

### Ver Logs de Sync

Los logs incluyen emojis para fácil identificación:

- ✓ Operación exitosa
- ⚠ Advertencia/fallback a queue
- ❌ Error
- 🌐 Online/network
- 📱 Offline
- ↻ Encolado

## 🔧 Troubleshooting

### Error: "Cannot connect to API"

- Verificar que la API esté corriendo en `localhost:8080`
- Verificar firewall/antivirus
- En mobile: Usar IP local en lugar de localhost

### Events no aparecen en Chat

- Verificar que los eventos se hayan subido: `/api/v1/events/status`
- Verificar estructura de datos en Firestore (campos requeridos)
- Revisar logs de la API para errores de vector store

### Queue no se procesa

- Verificar conectividad a internet
- Verificar logs de `processSyncQueue()`
- Reiniciar la app para forzar nuevo ciclo

### Rate Limit constante

- Reducir frecuencia de operaciones
- Aumentar `DELAY_BETWEEN_REQUESTS` en `api-config.ts`
- Considerar batch processing

## 🎯 Próximos Pasos

1. **Producción**: Actualizar URL en `api-config.ts` con Cloud Run
2. **Analytics**: Agregar tracking de sync success rate
3. **UI Enhancements**:
   - Indicador visual de queue pending
   - Progress bar para sync masivo
4. **Optimizaciones**:
   - Batch upload para múltiples eventos
   - Compression de event data
5. **Features**:
   - Export chat history
   - Voice input para queries
   - Push notifications para respuestas largas

## 📝 Notas Importantes

- **Rate Limit**: La API tiene límite de 5 requests/minuto - respetado automáticamente
- **Timeout**: 60 segundos por request (configurable)
- **Retry Logic**: 3 intentos con backoff exponencial
- **Storage**: Cola usa AsyncStorage (mobile) / localStorage (web)
- **Network Detection**: `expo-network` (mobile) / `navigator.onLine` (web)

## 🐛 Debugging

### Habilitar logs detallados

Los logs ya están configurados. Para más detalle:

```typescript
// En cualquier archivo de servicio
console.log("DEBUG:", JSON.stringify(data, null, 2));
```

### Verificar AsyncStorage/localStorage

```typescript
// Mobile
import AsyncStorage from "@react-native-async-storage/async-storage";
const queue = await AsyncStorage.getItem("minetrackai_sync_queue");
console.log(JSON.parse(queue || "[]"));

// Web
console.log(JSON.parse(localStorage.getItem("minetrackai_sync_queue") || "[]"));
```

---

**Desarrollado por:** Elvis Cruz  
**Fecha:** Enero 2026  
**Versión:** 1.0.0
