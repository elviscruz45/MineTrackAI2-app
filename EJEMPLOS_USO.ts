// /**
//  * EJEMPLOS DE USO - MineTrackAI Integration
//  * Este archivo contiene ejemplos prácticos de cómo usar los servicios de MineTrackAI
//  */

// // ============================================================================
// // EJEMPLO 1: Auto-Sync al Crear Evento
// // ============================================================================

// import { createEventWithSync } from '@/services/minetrackai-sync';
// import type { EventData } from '@/services/minetrackai-sync';

// async function ejemploCrearEvento() {
//   const eventData: EventData = {
//     idDocFirestoreDB: 'event-123',
//     titulo: 'Mantenimiento preventivo bomba #5',
//     comentarios: 'Revisión general y cambio de filtros',
//     nombrePerfil: 'Juan Pérez',
//     emailPerfil: 'juan.perez@example.com',
//     fechaPostFormato: '2026-01-30',
//     porcentajeAvance: '50',
//     etapa: 'En Progreso',
//     visibilidad: 'Público',
//     NombreServicio: 'Mantenimiento Bombas',
//     NumeroAIT: 'AIT-001',
//     TipoServicio: 'Preventivo',
//     AreaServicio: 'Minería',
//     EmpresaMinera: 'MineCorp',
//   };

//   try {
//     const result = await createEventWithSync('events', 'event-123', eventData);

//     if (result.firestoreSuccess && result.apiSuccess) {
//       console.log('✅ Evento guardado en Firestore y sincronizado con MineTrackAI');
//     } else if (result.firestoreSuccess && result.queuedForSync) {
//       console.log('✅ Evento guardado en Firestore');
//       console.log('📱 Sincronización encolada para cuando haya conexión');
//     }
//   } catch (error) {
//     console.error('❌ Error al crear evento:', error);
//   }
// }

// // ============================================================================
// // EJEMPLO 2: Auto-Sync al Actualizar Evento
// // ============================================================================

// import { updateEventWithSync } from '@/services/minetrackai-sync';

// async function ejemploActualizarEvento() {
//   const updateData = {
//     porcentajeAvance: '100',
//     etapa: 'Completado',
//   };

//   // Opción 1: Solo datos parciales
//   const result1 = await updateEventWithSync('events', 'event-123', updateData);

//   // Opción 2: Con datos completos del evento para mejor sync
//   const fullEventData: EventData = {
//     // ... todos los campos del evento actualizado
//     idDocFirestoreDB: 'event-123',
//     titulo: 'Mantenimiento preventivo bomba #5',
//     porcentajeAvance: '100',
//     etapa: 'Completado',
//     // ... resto de campos
//   };

//   const result2 = await updateEventWithSync(
//     'events',
//     'event-123',
//     updateData,
//     fullEventData // Mejor para RAG search
//   );

//   console.log('Sync result:', result2);
// }

// // ============================================================================
// // EJEMPLO 3: Eliminar Evento con Sync
// // ============================================================================

// import { deleteEventWithSync } from '@/services/minetrackai-sync';

// async function ejemploEliminarEvento() {
//   try {
//     const result = await deleteEventWithSync('events', 'event-123');

//     if (result.firestoreSuccess && result.apiSuccess) {
//       console.log('✅ Evento eliminado de Firestore y MineTrackAI');
//     }
//   } catch (error) {
//     console.error('❌ Error al eliminar:', error);
//   }
// }

// // ============================================================================
// // EJEMPLO 4: Chat RAG - Consultas Simples
// // ============================================================================

// import { chatQuery } from '@/services/minetrackai-api';

// async function ejemploChatSimple() {
//   try {
//     const response = await chatQuery('¿Qué mantenimientos están completados?');

//     console.log('Respuesta:', response.answer);
//     console.log('Fuentes encontradas:', response.sources.length);

//     response.sources.forEach((source, index) => {
//       console.log(`Fuente ${index + 1}:`, source.filename);
//       console.log('Contenido:', source.content);
//     });
//   } catch (error) {
//     console.error('Error en chat:', error);
//   }
// }

// // ============================================================================
// // EJEMPLO 5: Chat RAG - Con Filtros de Metadata
// // ============================================================================

// import type { MetadataFilter } from '@/services/minetrackai-api';

// async function ejemploChatConFiltros() {
//   // Filtrar solo eventos completados
//   const filter1: MetadataFilter = {
//     estado: 'Completado',
//   };

//   const response1 = await chatQuery(
//     '¿Cuántos servicios hay?',
//     filter1
//   );

//   // Filtrar por técnico específico
//   const filter2: MetadataFilter = {
//     tecnico: 'Juan Pérez',
//   };

//   const response2 = await chatQuery(
//     '¿Qué trabajos realizó?',
//     filter2
//   );

//   // Filtrar por rango de fechas
//   const filter3: MetadataFilter = {
//     fechaDesde: '2026-01-01',
//     fechaHasta: '2026-01-31',
//   };

//   const response3 = await chatQuery(
//     'Resume los mantenimientos de este mes',
//     filter3
//   );

//   // Múltiples filtros
//   const filter4: MetadataFilter = {
//     area: 'Minería',
//     estado: 'En Progreso',
//   };

//   const response4 = await chatQuery(
//     '¿Qué servicios están activos en minería?',
//     filter4
//   );
// }

// // ============================================================================
// // EJEMPLO 6: Uso del Hook useMineTrackAI
// // ============================================================================

// import { useMineTrackAI } from '@/hooks/useMineTrackAI';
// import React from 'react';
// import { View, Button, Text, ActivityIndicator } from 'react-native';

// function EjemploComponenteConHook() {
//   const {
//     sendChatQuery,
//     chatLoading,
//     chatError,
//     createEvent,
//     syncLoading,
//     processQueue,
//     queueCount,
//     getStatus,
//     storeStatus,
//   } = useMineTrackAI();

//   const handleSearch = async () => {
//     const response = await sendChatQuery('¿Qué servicios están pendientes?');
//     if (response) {
//       console.log('Respuesta:', response.answer);
//     }
//   };

//   const handleCreateEvent = async () => {
//     const eventData: EventData = {
//       // ... datos del evento
//     };

//     const result = await createEvent('new-event-id', eventData);
//     console.log('Creado:', result?.firestoreSuccess);
//   };

//   const handleForceSync = async () => {
//     await processQueue();
//   };

//   const handleCheckStatus = async () => {
//     await getStatus();
//   };

//   return (
//     <View>
//       <Button title="Buscar" onPress={handleSearch} disabled={chatLoading} />
//       {chatLoading && <ActivityIndicator />}
//       {chatError && <Text>Error: {chatError}</Text>}

//       <Button title="Crear Evento" onPress={handleCreateEvent} disabled={syncLoading} />

//       <Button title="Sincronizar Cola" onPress={handleForceSync} />
//       <Text>Eventos en cola: {queueCount}</Text>

//       <Button title="Ver Estado" onPress={handleCheckStatus} />
//       {storeStatus && (
//         <Text>
//           Vector Store: {storeStatus.status.fileCount} archivos,
//           {Math.round(storeStatus.status.usageBytes / 1024)} KB
//         </Text>
//       )}
//     </View>
//   );
// }

// // ============================================================================
// // EJEMPLO 7: Verificar Estado de la Cola
// // ============================================================================

// import { getSyncQueue, getQueueStats } from '@/services/sync-queue';

// async function ejemploVerificarCola() {
//   // Obtener todas las operaciones en cola
//   const queue = await getSyncQueue();
//   console.log('Operaciones pendientes:', queue.length);

//   queue.forEach(op => {
//     console.log(`${op.type} - ${op.firestoreId} - Reintentos: ${op.retryCount}`);
//   });

//   // Obtener estadísticas
//   const stats = await getQueueStats();
//   console.log('Total en cola:', stats.total);
//   console.log('Por tipo:', stats.byType);
//   console.log('Más antigua:', new Date(stats.oldestTimestamp!));
// }

// // ============================================================================
// // EJEMPLO 8: Procesamiento Manual de Cola
// // ============================================================================

// import { processSyncQueue } from '@/services/sync-queue';

// async function ejemploProcesarColaManual() {
//   const result = await processSyncQueue();

//   console.log(`✅ Procesadas: ${result.processed}`);
//   console.log(`❌ Fallidas: ${result.failed}`);
//   console.log(`📋 Restantes: ${result.remaining}`);
// }

// // ============================================================================
// // EJEMPLO 9: Obtener Estado del Vector Store
// // ============================================================================

// import { getStoreStatus } from '@/services/minetrackai-api';

// async function ejemploEstadoVectorStore() {
//   try {
//     const status = await getStoreStatus();

//     console.log('ID del Store:', status.status.id);
//     console.log('Nombre:', status.status.name);
//     console.log('Archivos:', status.status.fileCount);
//     console.log('Tamaño:', Math.round(status.status.usageBytes / 1024), 'KB');
//   } catch (error) {
//     console.error('Error obteniendo estado:', error);
//   }
// }

// // ============================================================================
// // EJEMPLO 10: Integración en Componente Existente
// // ============================================================================

// import { useEffect } from 'react';

// function ComponenteExistente() {
//   const { getQueue, queueCount } = useMineTrackAI();

//   // Verificar cola al montar componente
//   useEffect(() => {
//     async function checkQueue() {
//       const queue = await getQueue();
//       console.log('Operaciones pendientes:', queue.length);
//     }

//     checkQueue();
//   }, []);

//   return (
//     <View>
//       {queueCount > 0 && (
//         <View style={{ backgroundColor: 'orange', padding: 10 }}>
//           <Text>⚠️ {queueCount} eventos pendientes de sincronización</Text>
//         </View>
//       )}
//       {/* ... resto del componente */}
//     </View>
//   );
// }

// // ============================================================================
// // EJEMPLO 11: Manejo de Errores Personalizado
// // ============================================================================

// import { ApiError, isRateLimitError, isNetworkError } from '@/services/minetrackai-api';

// async function ejemploManejoErrores() {
//   try {
//     await chatQuery('Mi pregunta');
//   } catch (error) {
//     if (error instanceof ApiError) {
//       if (isRateLimitError(error)) {
//         console.log('⏳ Rate limit alcanzado, se reintentará automáticamente');
//       } else if (isNetworkError(error)) {
//         console.log('📡 Sin conexión, se encolará automáticamente');
//       } else {
//         console.error('Error de API:', error.message);
//       }
//     } else {
//       console.error('Error desconocido:', error);
//     }
//   }
// }

// // ============================================================================
// // EJEMPLO 12: Batch Processing (Múltiples Eventos)
// // ============================================================================

// import { batchSyncEvents } from '@/services/minetrackai-sync';

// async function ejemploBatchSync() {
//   const operations = [
//     {
//       type: 'create' as const,
//       collection: 'events',
//       docId: 'event-1',
//       data: { /* ... */ } as EventData,
//     },
//     {
//       type: 'update' as const,
//       collection: 'events',
//       docId: 'event-2',
//       data: { porcentajeAvance: '100' } as EventData,
//     },
//     {
//       type: 'delete' as const,
//       collection: 'events',
//       docId: 'event-3',
//     },
//   ];

//   const results = await batchSyncEvents(operations);

//   results.forEach((result, index) => {
//     console.log(`Operación ${index + 1}:`,
//       result.firestoreSuccess ? '✅' : '❌',
//       result.apiSuccess ? 'Sincronizado' : result.queuedForSync ? 'Encolado' : 'Error'
//     );
//   });
// }

// // ============================================================================
// // NOTAS IMPORTANTES
// // ============================================================================

// /*
// 1. RATE LIMITING
//    - La API tiene límite de 5 requests/minuto
//    - El sistema maneja esto automáticamente
//    - Los errores 429 se reintenta con backoff exponencial

// 2. OFFLINE QUEUE
//    - Las operaciones fallidas se encolan automáticamente
//    - Se procesan al reconectar (web: window.online, mobile: NetInfo)
//    - También se procesan cada 2 minutos automáticamente

// 3. TIMEOUTS
//    - Cada request tiene timeout de 60 segundos
//    - Después de 3 reintentos, se considera fallido
//    - Los fallos se encolan para retry posterior

// 4. LOGS
//    - Todos los servicios logean con emojis para fácil identificación
//    - ✅ = Éxito, ⚠️ = Advertencia, ❌ = Error
//    - 🌐 = Online, 📱 = Offline, ↻ = Encolado

// 5. PRODUCCIÓN
//    - Actualizar URL en config/api-config.ts antes de deployar
//    - Monitorear logs de sincronización
//    - Considerar analytics para tracking de uso
// */
