# 🔄 Actualización: Sincronización de Documentos ServiciosAIT Completos

## 📝 Cambios Realizados

Se ha modificado la integración de MineTrackAI para sincronizar **documentos ServiciosAIT completos** en lugar de eventos individuales. Esto asegura que solo exista la versión más actualizada en Google File Search.

## 🎯 Comportamiento Nuevo

### Antes ❌

- Se sincronizaban eventos individuales de la colección "events"
- Múltiples versiones del mismo documento podían existir
- No se eliminaban versiones anteriores

### Ahora ✅

- Se sincroniza el documento completo de la colección "ServiciosAIT"
- Cada actualización **elimina la versión anterior** del vector store
- Luego **sube la nueva versión actualizada**
- Solo existe la **versión más reciente** en Google File Search

## 🔧 Archivos Modificados

### 1. `services/minetrackai-sync.ts`

**Nueva función agregada:**

```typescript
syncServiciosAITDocument(servicioAITId: string)
```

**Proceso:**

1. Obtiene el documento completo actualizado de Firestore
2. Elimina la versión anterior del vector store (si existe)
3. Sube la nueva versión actualizada
4. Si falla, encola para retry automático

### 2. `app/(tabs)/post/Information.tsx`

**Cambio en el flujo de sincronización:**

**Antes:**

```typescript
// Sincronizaba eventos individuales
await createEventWithSync("events", uniqueID, newData);
```

**Ahora:**

```typescript
// Sincroniza el documento ServiciosAIT completo
await syncServiciosAITDocument(props.actualServiceAIT?.idServiciosAIT);
```

### 3. `services/sync-queue.ts`

**Mejorado el procesamiento de operaciones de tipo "sync":**

- Primero elimina la versión anterior
- Luego sube la versión actualizada
- Asegura que solo exista una versión en el vector store

### 4. `hooks/useMineTrackAI.ts`

**Nueva función agregada:**

```typescript
syncServiciosAIT(servicioAITId: string)
```

## 📊 Flujo de Sincronización Actualizado

```
Usuario Crea/Actualiza Evento
         │
         ▼
  ┌──────────────────────┐
  │ Firestore updateDoc  │  ← Actualiza ServiciosAIT
  │    (ServiciosAIT)    │
  └──────────┬───────────┘
             │
             ▼
  ┌──────────────────────────────┐
  │ syncServiciosAITDocument()   │
  └──────────┬───────────────────┘
             │
             ├─── 1. Obtener documento completo de Firestore
             │
             ├─── 2. Eliminar versión anterior del vector store
             │         │
             │         ├─ Éxito → Continuar
             │         └─ No existe → Continuar
             │
             ├─── 3. Subir nueva versión actualizada
             │         │
             │         ├─ Éxito → ✅ Sincronizado
             │         └─ Error → 📱 Encolar para retry
             │
             ▼
    ✅ Solo existe versión más reciente
       en Google File Search
```

## 🚀 Uso Actualizado

### Opción 1: Sincronización Automática

```typescript
// En Information.tsx - ya está integrado
// Al crear/actualizar un evento, automáticamente sincroniza el documento completo
```

### Opción 2: Sincronización Manual con Hook

```typescript
import { useMineTrackAI } from '@/hooks/useMineTrackAI';

function MyComponent() {
  const { syncServiciosAIT, syncLoading } = useMineTrackAI();

  const handleSync = async () => {
    const result = await syncServiciosAIT('servicio-ait-id-123');

    if (result?.apiSuccess) {
      console.log('✅ Documento sincronizado');
    } else if (result?.queuedForSync) {
      console.log('📱 Encolado para sync posterior');
    }
  };

  return <Button onPress={handleSync} loading={syncLoading} />;
}
```

### Opción 3: Sincronización Directa

```typescript
import { syncServiciosAITDocument } from "@/services/minetrackai-sync";

const result = await syncServiciosAITDocument("servicio-ait-id-123");
```

## 🔍 Qué se Sincroniza Ahora

El documento completo de **ServiciosAIT** incluye:

```typescript
{
  idServiciosAIT: string,
  NombreServicio: string,
  NumeroAIT: string,
  TipoServicio: string,
  AreaServicio: string,
  EmpresaMinera: string,
  LastEventPosted: Date,
  AvanceEjecucion: string,
  AvanceAdministrativoTexto: string,
  events: Array<EventSchema>, // ← Todos los eventos del servicio
  pdfFile: Array<PdfFile>,
  aprobacion: Array<string>,
  // ... todos los demás campos
}
```

## 📱 Sistema Offline

La cola offline sigue funcionando igual:

- Si no hay conexión → se encola
- Al reconectar → procesa automáticamente
- Respeta rate limit (5 requests/minuto)

**Nuevo comportamiento en cola:**

- Para operaciones de tipo "sync":
  1. Elimina versión anterior
  2. Sube versión nueva
  3. Asegura solo una versión en el vector store

## 🧪 Testing

### Test 1: Crear Evento y Verificar Sync

1. Crear un evento nuevo en la app
2. Verificar logs:
   ```
   ✅ Firestore updateDoc successful
   🗑️ Deleted old version from vector store
   ✅ ServiciosAIT uploaded successfully
   ```
3. Consultar API: `GET /api/v1/events/status`
4. Debe mostrar el documento ServiciosAIT actualizado

### Test 2: Actualizar Evento Múltiples Veces

1. Crear evento inicial
2. Actualizar 3 veces seguidas
3. Verificar en vector store:
   - Solo existe 1 versión del documento
   - Es la versión más reciente
   - Contiene todos los eventos actualizados

### Test 3: Chat RAG con Datos Actualizados

1. Crear/actualizar un evento
2. Esperar sincronización
3. Ir a Chat AI y preguntar sobre el servicio
4. Debe devolver información actualizada

### Test 4: Modo Offline

1. Desactivar red
2. Crear/actualizar evento
3. Verificar toast: "Sincronización encolada"
4. Reconectar
5. Verificar que se procesa correctamente

## ⚠️ Puntos Importantes

1. **Un documento por ServiciosAIT**: Solo existe una versión del documento en el vector store
2. **Actualizaciones incrementales**: Cada evento nuevo actualiza el documento completo
3. **Eliminación segura**: Si la versión anterior no existe, continúa con el upload
4. **Queue resiliente**: Si falla, se encola para retry automático
5. **ID único**: El `idServiciosAIT` se usa como identificador en el vector store

## 🎯 Ventajas del Nuevo Enfoque

✅ **Consistencia**: Solo una versión del documento en el vector store  
✅ **Actualizado**: Siempre la versión más reciente disponible  
✅ **Completo**: Incluye todos los eventos del servicio  
✅ **Eficiente**: Elimina duplicados automáticamente  
✅ **RAG Mejorado**: Búsquedas devuelven información actualizada

## 🔄 Migración de Datos Existentes

Si ya hay datos antiguos en el vector store:

```typescript
// Script de limpieza (ejecutar una vez)
import { deleteEvent } from '@/services/minetrackai-api';
import { syncServiciosAITDocument } from '@/services/minetrackai-sync';

async function migrateToNewSync() {
  // 1. Eliminar eventos individuales antiguos (si los hay)
  const oldEventIds = ['event-1', 'event-2', ...];
  for (const id of oldEventIds) {
    await deleteEvent(id);
  }

  // 2. Sincronizar documentos ServiciosAIT actuales
  const servicioAITIds = ['ait-1', 'ait-2', ...];
  for (const id of servicioAITIds) {
    await syncServiciosAITDocument(id);
    await new Promise(resolve => setTimeout(resolve, 12000)); // Rate limit
  }
}
```

## 📝 Logs de Referencia

**Éxito completo:**

```
✓ Firestore updateDoc successful: ait-123
🔄 Syncing ServiciosAIT document: ait-123
🗑️ Deleted old version from vector store: ait-123
✅ ServiciosAIT uploaded successfully: ait-123
```

**Primera vez (no hay versión anterior):**

```
✓ Firestore updateDoc successful: ait-456
🔄 Syncing ServiciosAIT document: ait-456
⚠️ Could not delete old version (may not exist)
✅ ServiciosAIT uploaded successfully: ait-456
```

**Sin conexión:**

```
✓ Firestore updateDoc successful: ait-789
⚠️ MineTrackAI upload failed: Error de red
↻ Queued for sync: ServiciosAIT ait-789
```

---

**Fecha de actualización:** Enero 31, 2026  
**Versión:** 2.0  
**Estado:** ✅ Implementado y Probado
