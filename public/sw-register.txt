// Service Worker Registration Helper
// Este archivo puede ser importado en tu aplicación principal

(function () {
  "use strict";

  // Registrar Service Worker
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () {
      navigator.serviceWorker
        .register("/sw.js")
        .then(function (registration) {
          console.log("✅ SW registered successfully:", registration.scope);

          // Manejar actualizaciones del SW
          registration.addEventListener("updatefound", function () {
            const newWorker = registration.installing;
            console.log("🔄 New SW version found, installing...");

            newWorker.addEventListener("statechange", function () {
              if (newWorker.state === "installed") {
                if (navigator.serviceWorker.controller) {
                  // Nuevo SW disponible, mostrar notificación de actualización
                  console.log("🆕 New SW ready to take control");
                  showUpdateNotification(registration);
                } else {
                  // Primer SW instalado
                  console.log("🎉 SW installed for the first time");
                  showInstallNotification();
                }
              }
            });
          });

          // Escuchar mensajes del SW
          navigator.serviceWorker.addEventListener("message", function (event) {
            console.log("📨 Message from SW:", event.data);
          });
        })
        .catch(function (error) {
          console.error("❌ SW registration failed:", error);
        });
    });

    // Escuchar cambios en el controlador del SW
    navigator.serviceWorker.addEventListener("controllerchange", function () {
      console.log("🔄 SW controller changed, reloading page...");
      window.location.reload();
    });
  } else {
    console.log("❌ Service Worker not supported");
  }

  // Mostrar notificación de actualización
  function showUpdateNotification(registration) {
    // Crear elemento de notificación
    const notification = document.createElement("div");
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: #007AFF;
      color: white;
      padding: 16px 24px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      z-index: 10000;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      max-width: 400px;
      text-align: center;
    `;

    notification.innerHTML = `
      <div style="margin-bottom: 12px;">
        <strong>🆕 Nueva versión disponible</strong>
      </div>
      <div style="margin-bottom: 16px;">
        Hay mejoras disponibles para MineTrack AI
      </div>
      <button id="update-btn" style="
        background: white;
        color: #007AFF;
        border: none;
        padding: 8px 16px;
        border-radius: 4px;
        cursor: pointer;
        font-weight: 500;
        margin-right: 8px;
      ">Actualizar</button>
      <button id="dismiss-btn" style="
        background: transparent;
        color: white;
        border: 1px solid white;
        padding: 8px 16px;
        border-radius: 4px;
        cursor: pointer;
      ">Después</button>
    `;

    document.body.appendChild(notification);

    // Manejar clic en actualizar
    document
      .getElementById("update-btn")
      .addEventListener("click", function () {
        if (registration.waiting) {
          registration.waiting.postMessage({ type: "SKIP_WAITING" });
        }
        notification.remove();
      });

    // Manejar clic en descartar
    document
      .getElementById("dismiss-btn")
      .addEventListener("click", function () {
        notification.remove();
      });

    // Auto-remover después de 10 segundos
    setTimeout(() => {
      if (document.body.contains(notification)) {
        notification.remove();
      }
    }, 10000);
  }

  // Mostrar notificación de primera instalación
  function showInstallNotification() {
    console.log("🎉 PWA installed successfully");

    // Opcional: mostrar mensaje de bienvenida
    const notification = document.createElement("div");
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: #4CAF50;
      color: white;
      padding: 16px 24px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      z-index: 10000;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      max-width: 400px;
      text-align: center;
    `;

    notification.innerHTML = `
      <div><strong>✅ MineTrack AI instalado</strong></div>
      <div style="margin-top: 8px; font-size: 12px;">
        Ahora puedes usar la aplicación sin conexión
      </div>
    `;

    document.body.appendChild(notification);

    // Auto-remover después de 5 segundos
    setTimeout(() => {
      if (document.body.contains(notification)) {
        notification.remove();
      }
    }, 5000);
  }

  // Funciones de utilidad para gestionar caché
  window.swUtils = {
    // Limpiar todas las cachés
    clearCache: function () {
      if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({ type: "CLEAR_CACHE" });
        console.log("🗑️ Cache clearing requested");
      }
    },

    // Obtener tamaño de caché
    getCacheSize: function () {
      return new Promise((resolve, reject) => {
        if (
          "serviceWorker" in navigator &&
          navigator.serviceWorker.controller
        ) {
          const messageChannel = new MessageChannel();
          messageChannel.port1.onmessage = function (event) {
            resolve(event.data.size);
          };
          navigator.serviceWorker.controller.postMessage(
            { type: "GET_CACHE_SIZE" },
            [messageChannel.port2]
          );
        } else {
          reject(new Error("Service Worker not available"));
        }
      });
    },

    // Verificar si estamos offline
    isOffline: function () {
      return !navigator.onLine;
    },

    // Escuchar cambios de conectividad
    onConnectivityChange: function (callback) {
      window.addEventListener("online", () => callback(true));
      window.addEventListener("offline", () => callback(false));
    },
  };
})();
