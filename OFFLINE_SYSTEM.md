# Sistema de Cola Offline - MineTrackAI2-app

## Descripción

El sistema de cola offline permite que la aplicación funcione sin conexión a internet, guardando automáticamente las operaciones de Firebase en una cola local que se sincroniza cuando se restablece la conectividad. **Compatible con Web (localStorage) y Mobile (AsyncStorage)**.

## Características Principales

### 🔄 Sincronización Automática

- **Detección automática de conectividad**: Monitoreo continuo del estado de la red
  - Web: Utiliza `navigator.onLine` y eventos `online`/`offline`
  - Mobile: Utiliza `expo-network` para detección precisa
- **Cola persistente**: Las operaciones se guardan en localStorage (web) o AsyncStorage (mobile)
- **Procesamiento inteligente**: Solo sincroniza cuando hay conexión estable a internet
- **Reintentos automáticos**: Las operaciones fallidas se mantienen en cola para futuros intentos

### 📱 Indicador Visual

- **Estado en tiempo real**: Componente OfflineStatus muestra el estado de conectividad
- **Contador de pendientes**: Visualización del número de operaciones en cola
- **Códigos de color intuitivos**:
  - 🟢 Verde: Conectado y sincronizado
  - 🟠 Naranja: Conectado con operaciones pendientes
  - 🔴 Rojo: Sin conexión
- **Responsive**: Funciona tanto en web como en mobile

### 🛡️ Manejo de Errores

- **Fallback automático**: Si falla la operación online, se guarda offline
- **Notificaciones informativas**: Toast messages para informar al usuario
- **Limpieza inteligente**: Solo elimina operaciones exitosamente procesadas
- **Cross-platform**: Manejo consistente de errores en todas las plataformas

## Archivos Principales

### `/utils/offlineQueue.ts`

Módulo central que contiene todas las funciones para el manejo offline:

```typescript
// StorageManager - Abstracción para storage cross-platform
- getItem(): localStorage (web) o AsyncStorage (mobile)
- setItem(): localStorage (web) o AsyncStorage (mobile)
- removeItem(): localStorage (web) o AsyncStorage (mobile)

// Funciones principales
- queueFirebaseOperation(): Agrega operaciones a la cola
- processOfflineQueue(): Procesa operaciones cuando hay conexión
- safeFirebaseOperation(): Wrapper para operaciones Firebase
- checkConnectivityAndProcess(): Verifica conectividad y procesa
- getOfflineQueueStatus(): Obtiene estado actual de la cola
- clearOfflineQueue(): Limpia manualmente la cola
- useConnectivityMonitor(): Hook para monitoreo automático cross-platform
```

### `/components/OfflineStatus/OfflineStatus.tsx`

Componente visual para mostrar el estado de sincronización:

```typescript
// Props disponibles
interface OfflineStatusProps {
  showDetails?: boolean; // Mostrar texto descriptivo
  onPress?: () => void; // Acción personalizada al tocar
}
```

### `/app/(tabs)/post/Information.tsx`

Implementación en formularios con operaciones Firebase:

```typescript
// Operaciones offline implementadas
- setDoc() para collection "events"
- updateDoc() para collection "ServiciosAIT"
```

## Uso en Desarrollo

### Integrar en Nuevos Componentes

1. **Importar las utilidades**:

```typescript
import {
  safeFirebaseOperation,
  OfflineFirebaseOperation,
} from "@/utils/offlineQueue";
```

2. **Reemplazar operaciones Firebase**:

```typescript
// En lugar de esto:
await setDoc(doc(db, "collection", "docId"), data);

// Usar esto:
const operation = async () => {
  await setDoc(doc(db, "collection", "docId"), data);
};

const fallbackData: OfflineFirebaseOperation = {
  id: `setDoc-collection-${docId}`,
  type: "setDoc",
  data: data,
  timestamp: Date.now(),
  collection: "collection",
  docId: docId,
};

const isOnline = await safeFirebaseOperation(operation, fallbackData);
```

3. **Agregar monitoreo de conectividad**:

```typescript
import { useConnectivityMonitor } from "@/utils/offlineQueue";

const { startMonitoring } = useConnectivityMonitor();

useEffect(() => {
  const stopMonitoring = startMonitoring();
  return stopMonitoring;
}, []);
```

### Agregar Indicador Visual

```typescript
import OfflineStatus from "@/components/OfflineStatus/OfflineStatus";

// En el render:
<OfflineStatus showDetails={true} />;
```

## Configuración

### Intervalo de Monitoreo

```typescript
// En useConnectivityMonitor (default: 30 segundos)
const { startMonitoring } = useConnectivityMonitor(15000); // 15 segundos
```

### Personalizar Notificaciones

Las notificaciones se pueden personalizar en `/utils/offlineQueue.ts`:

```typescript
Toast.show({
  type: "success",
  text1: "Título personalizado",
  text2: "Mensaje personalizado",
  position: "top",
  visibilityTime: 4000,
});
```

## Consideraciones de Rendimiento

### Storage Cross-Platform

- **Web (localStorage)**:
  - Límite de ~5-10MB dependiendo del navegador
  - Síncrono pero wrapeado en async para consistencia
  - Persistencia entre sesiones del navegador
- **Mobile (AsyncStorage)**:
  - Límite de ~6MB en iOS, ilimitado en Android
  - Operaciones asíncronas nativas
  - Persistencia entre sesiones de la app

### Network Monitoring Cross-Platform

- **Web**:
  - Usa `navigator.onLine` para estado básico
  - Eventos `online`/`offline` para respuesta inmediata
  - Fallback con polling para casos edge
- **Mobile**:
  - Usa `expo-network` para detección precisa
  - Verifica tanto conexión como acceso a internet
  - Intervalos configurables para balance batería/responsividad

### Memoria

- **Lazy loading**: Solo carga operaciones cuando es necesario
- **Limpieza automática**: Elimina operaciones procesadas exitosamente
- **Manejo de errores**: Evita acumulación de operaciones fallidas indefinidamente
- **Platform-specific optimizations**: Aprovecha las fortalezas de cada plataforma

## Debugging

### Logs de Consola

```bash
# Monitoreo de operaciones
"Operación agregada a la cola offline: setDoc-events-123"
"Procesando 3 operaciones offline..."
"Operación procesada: setDoc-events-123"
"Cola offline procesada y limpiada"

# Errores
"Error procesando operación setDoc-events-123: [error details]"
"Error verificando conectividad: [error details]"
```

### AsyncStorage Debug

```typescript
// Verificar cola manualmente
import { getOfflineQueueStatus } from "@/utils/offlineQueue";

const status = await getOfflineQueueStatus();
console.log(`Operaciones pendientes: ${status.pendingOperations}`);
console.log("Operaciones:", status.operations);
```

### React Native Debugger

El estado de la cola es visible en React Native Debugger bajo AsyncStorage con la clave `offline_firebase_queue`.

## Limitaciones Conocidas

1. **arrayUnion() offline**: Las operaciones con arrayUnion() pueden crear duplicados si se procesan múltiples veces
2. **Conflictos concurrentes**: No maneja conflictos si los mismos datos se modifican online y offline
3. **Tamaño de datos**: Operaciones muy grandes pueden exceder límites de AsyncStorage
4. **Dependencias de red**: Requiere expo-network y puede no funcionar en algunos emuladores

## Roadmap Futuro

- [ ] **Resolución de conflictos**: Sistema para manejar conflictos de datos
- [ ] **Compresión de datos**: Reducir tamaño de operaciones en AsyncStorage
- [ ] **Priorización de cola**: Procesar operaciones críticas primero
- [ ] **Métricas de sincronización**: Dashboard con estadísticas de offline/online
- [ ] **Sync incremental**: Solo sincronizar cambios delta
- [ ] **Backup de cola**: Respaldo automático de operaciones críticas

## Soporte

Para problemas o mejoras relacionadas con el sistema offline, revisar:

1. **Logs de console**: Verificar errores en tiempo real
2. **AsyncStorage**: Inspeccionar cola de operaciones
3. **Network state**: Confirmar estado de conectividad
4. **Toast notifications**: Revisar mensajes de estado al usuario

---

**Nota**: Este sistema está diseñado para garantizar que ninguna operación crítica se pierda debido a problemas de conectividad, proporcionando una experiencia de usuario robusta y confiable en entornos con conectividad intermitente como sitios mineros.
