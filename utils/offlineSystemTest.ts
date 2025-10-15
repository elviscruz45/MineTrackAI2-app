// Test para verificar funcionalidad offline en web
// Este archivo puede ser usado para testing manual

import { Platform } from "react-native";
import {
  queueFirebaseOperation,
  processOfflineQueue,
  getOfflineQueueStatus,
  clearOfflineQueue,
  OfflineFirebaseOperation,
} from "../utils/offlineQueue";

export const testOfflineSystem = async () => {
  console.log("🧪 Iniciando pruebas del sistema offline...");
  console.log(`📱 Plataforma: ${Platform.OS}`);

  try {
    // Test 1: Verificar estado inicial
    console.log("\n📋 Test 1: Estado inicial de la cola");
    const initialStatus = await getOfflineQueueStatus();
    console.log(
      `   Operaciones pendientes: ${initialStatus.pendingOperations}`
    );

    // Test 2: Agregar operación de prueba
    console.log("\n📋 Test 2: Agregar operación de prueba");
    const testOperation: OfflineFirebaseOperation = {
      id: `test-${Date.now()}`,
      type: "setDoc",
      data: { test: true, timestamp: new Date().toISOString() },
      timestamp: Date.now(),
      collection: "test",
      docId: `test-doc-${Date.now()}`,
    };

    await queueFirebaseOperation(testOperation);
    console.log("   ✅ Operación agregada exitosamente");

    // Test 3: Verificar que se agregó
    console.log("\n📋 Test 3: Verificar operación en cola");
    const statusAfterAdd = await getOfflineQueueStatus();
    console.log(
      `   Operaciones pendientes: ${statusAfterAdd.pendingOperations}`
    );

    if (statusAfterAdd.pendingOperations > initialStatus.pendingOperations) {
      console.log("   ✅ Operación correctamente agregada a la cola");
    } else {
      console.log("   ❌ Error: Operación no se agregó correctamente");
    }

    // Test 4: Verificar storage según plataforma
    console.log("\n📋 Test 4: Verificar storage específico de plataforma");
    if (Platform.OS === "web") {
      const webData = localStorage.getItem("offline_firebase_queue");
      if (webData) {
        const operations = JSON.parse(webData);
        console.log(
          `   ✅ localStorage: ${operations.length} operaciones encontradas`
        );
      } else {
        console.log("   ❌ localStorage: No se encontraron datos");
      }
    } else {
      console.log("   📱 Mobile: Usando AsyncStorage (verificación manual)");
    }

    // Test 5: Detectar conectividad
    console.log("\n📋 Test 5: Detectar estado de conectividad");
    if (Platform.OS === "web") {
      console.log(`   🌐 Web - navigator.onLine: ${navigator.onLine}`);
      console.log(
        `   🌐 Web - Connection type: ${
          (navigator as any).connection?.effectiveType || "unknown"
        }`
      );
    } else {
      console.log("   📱 Mobile: Usar expo-network para verificación completa");
    }

    // Test 6: Limpiar cola de prueba (opcional)
    console.log("\n📋 Test 6: Limpiar cola de prueba");
    console.log(
      "   ⚠️  Para limpiar la cola manualmente, ejecutar: clearOfflineQueue()"
    );

    console.log("\n🎉 Pruebas completadas exitosamente!");
  } catch (error) {
    console.error("❌ Error durante las pruebas:", error);
  }
};

// Función para monitoring en tiempo real (solo para debug)
export const startDebugMonitoring = () => {
  console.log("🔄 Iniciando monitoring de debug...");

  const interval = setInterval(async () => {
    const status = await getOfflineQueueStatus();
    const connectivity =
      Platform.OS === "web" ? navigator.onLine : "checking...";

    console.log(
      `📊 Debug Status - Pendientes: ${status.pendingOperations}, Online: ${connectivity}`
    );
  }, 5000);

  // Cleanup después de 30 segundos
  setTimeout(() => {
    clearInterval(interval);
    console.log("🛑 Debug monitoring finalizado");
  }, 30000);

  return () => clearInterval(interval);
};

// Función para simular condiciones offline (solo web)
export const simulateOfflineCondition = () => {
  if (Platform.OS !== "web") {
    console.log("❌ Simulación offline solo disponible en web");
    return;
  }

  console.log("🔌 Simulando condición offline...");

  // Override navigator.onLine temporalmente
  Object.defineProperty(navigator, "onLine", {
    writable: true,
    value: false,
  });

  console.log(`📡 Estado simulado - navigator.onLine: ${navigator.onLine}`);

  // Restaurar después de 10 segundos
  setTimeout(() => {
    Object.defineProperty(navigator, "onLine", {
      writable: true,
      value: true,
    });
    console.log("🔌 Condición online restaurada");
  }, 10000);
};

// Exportar funciones para uso en consola del navegador
if (Platform.OS === "web") {
  (window as any).testOfflineSystem = testOfflineSystem;
  (window as any).startDebugMonitoring = startDebugMonitoring;
  (window as any).simulateOfflineCondition = simulateOfflineCondition;
  (window as any).clearOfflineQueue = clearOfflineQueue;

  console.log(`
🚀 Sistema Offline Debug Cargado!

Funciones disponibles en consola:
- testOfflineSystem()          : Ejecutar suite de pruebas
- startDebugMonitoring()       : Monitoring en tiempo real
- simulateOfflineCondition()   : Simular offline (solo web)
- clearOfflineQueue()          : Limpiar cola manualmente

Para más detalles, revisar la documentación en OFFLINE_SYSTEM.md
  `);
}
