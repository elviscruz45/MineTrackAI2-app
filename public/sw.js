// Optimized Service Worker for PWA - Fast First Load 🚀
const CACHE_VERSION = "v5.3"; // Fix: Forzar recarga al actualizar SW
const CACHE_NAME = `minetrack-ai-${CACHE_VERSION}`;
const STATIC_CACHE = `minetrack-static-${CACHE_VERSION}`;
const IMAGES_CACHE = `minetrack-images-${CACHE_VERSION}`;
const API_CACHE = `minetrack-api-${CACHE_VERSION}`;
const FONTS_CACHE = `minetrack-fonts-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `minetrack-dynamic-${CACHE_VERSION}`;
const ROUTES_CACHE = `minetrack-routes-${CACHE_VERSION}`;

// URLs MÍNIMOS críticos para cachear al instalar (SOLO LO ESENCIAL)
// Estrategia: Cachear solo HTML shell + manifest
const urlsToCache = [
  // "/",
  "/manifest.json",
  "/logo192.png",
  "/favicon.ico",
  // Las fuentes de iconos NO se cachean - siempre se descargan fresh
];

// Cache strategies - ULTRA AGRESIVO
const CACHE_STRATEGIES = {
  CACHE_FIRST: "cache-first", // Cache primero, red como fallback
  CACHE_ONLY: "cache-only", // Solo cache (para recursos críticos)
  STALE_WHILE_REVALIDATE: "swr", // Cache inmediato, actualiza en background
  NETWORK_FIRST_AGGRESSIVE: "nf-agg", // Red primero pero caché agresivo
};

// Patrones de archivos para cachear automáticamente
const CACHE_PATTERNS = {
  STATIC: /\.(js|css|json|woff|woff2|ttf|eot)$/i,
  IMAGES: /\.(jpg|jpeg|png|gif|webp|svg|ico|bmp|avif)$/i,
  DOCUMENTS: /\.(html|htm)$/i,
  FONTS: /\.(woff|woff2|ttf|eot|otf)$/i,
  API_ASSETS: /\/_expo\/|\/static\/|\/assets\//i,
};

// Determinar estrategia de cache ULTRA AGRESIVA
function getCacheStrategy(request) {
  const url = new URL(request.url);
  const pathname = url.pathname.toLowerCase();

  // Firebase/Firestore - NO cachear para permitir sincronización
  if (
    url.hostname.includes("firestore.googleapis.com") ||
    url.hostname.includes("firebase") ||
    url.hostname.includes("googleapis.com") ||
    pathname.includes("firestore") ||
    pathname.includes("firebase")
  ) {
    return null;
  }

  // Assets críticos de Expo/React - CACHE FIRST (nunca fallar)
  if (
    CACHE_PATTERNS.API_ASSETS.test(pathname) ||
    pathname.startsWith("/_expo/") ||
    pathname.startsWith("/static/")
  ) {
    return {
      strategy: CACHE_STRATEGIES.CACHE_FIRST,
      cacheName: STATIC_CACHE,
      critical: true,
    };
  }

  // Imágenes - STALE WHILE REVALIDATE (mostrar inmediato, actualizar background)
  if (request.destination === "image" || CACHE_PATTERNS.IMAGES.test(pathname)) {
    return {
      strategy: CACHE_STRATEGIES.STALE_WHILE_REVALIDATE,
      cacheName: IMAGES_CACHE,
    };
  }

  // Fuentes de ICONOS - NO CACHEAR (siempre desde red)
  if (
    pathname.includes("/fonts/") ||
    pathname.match(/Ionicons|MaterialIcons|MaterialCommunityIcons|Feather/)
  ) {
    return null; // NO cachear, siempre fetch desde red
  }

  // Otras fuentes - CACHE FIRST (permanente)
  if (request.destination === "font" || CACHE_PATTERNS.FONTS.test(pathname)) {
    return {
      strategy: CACHE_STRATEGIES.CACHE_FIRST,
      cacheName: FONTS_CACHE,
      critical: true,
    };
  }

  // JS/CSS - STALE WHILE REVALIDATE (mostrar cache, actualizar background)
  if (CACHE_PATTERNS.STATIC.test(pathname)) {
    return {
      strategy: CACHE_STRATEGIES.STALE_WHILE_REVALIDATE,
      cacheName: STATIC_CACHE,
    };
  }

  // Rutas de la app - CACHE FIRST con fallback
  if (
    pathname.startsWith("/tabs/") ||
    ["/home", "/search", "/post", "/profile", "/report"].includes(pathname)
  ) {
    return { strategy: CACHE_STRATEGIES.CACHE_FIRST, cacheName: ROUTES_CACHE };
  }

  // HTML/Documentos - NETWORK FIRST pero cache agresivo
  if (
    request.destination === "document" ||
    request.headers.get("accept")?.includes("text/html")
  ) {
    return {
      strategy: CACHE_STRATEGIES.NETWORK_FIRST_AGGRESSIVE,
      cacheName: CACHE_NAME,
    };
  }

  // Todo lo demás - Cache agresivo
  return {
    strategy: CACHE_STRATEGIES.STALE_WHILE_REVALIDATE,
    cacheName: DYNAMIC_CACHE,
  };
}

// Install event - ULTRA AGRESIVO: Precachea todo lo crítico
self.addEventListener("install", (event) => {
  console.log("🚀 Service Worker v3.2 installing - ULTRA AGGRESSIVE MODE");

  event.waitUntil(
    Promise.all([
      // Cache esencial inmediato
      caches.open(CACHE_NAME).then(async (cache) => {
        console.log("📦 Caching essential routes and assets");
        try {
          await cache.addAll(urlsToCache);
          console.log("✅ Essential cache complete");
        } catch (err) {
          console.warn("⚠️ Some essential files failed to cache:", err);
          // Cachear uno por uno los que sí funcionen
          for (const url of urlsToCache) {
            try {
              await cache.add(url);
            } catch (e) {
              console.warn(`⚠️ Failed to cache: ${url}`);
            }
          }
        }
      }),

      // Crear todas las cachés necesarias
      caches
        .open(STATIC_CACHE)
        .then(() => console.log("📁 Static cache ready")),
      caches
        .open(IMAGES_CACHE)
        .then(() => console.log("🖼️ Images cache ready")),
      caches.open(FONTS_CACHE).then(() => console.log("🔤 Fonts cache ready")),
      caches
        .open(DYNAMIC_CACHE)
        .then(() => console.log("⚡ Dynamic cache ready")),
      caches
        .open(ROUTES_CACHE)
        .then(() => console.log("🛣️ Routes cache ready")),
      caches.open(API_CACHE).then(() => console.log("🌐 API cache ready")),
    ])
  );

  // Tomar control inmediatamente
  self.skipWaiting();
});

// Activate event - Limpieza inteligente manteniendo compatibilidad con deploys
self.addEventListener("activate", (event) => {
  console.log(
    `🔄 Service Worker ${CACHE_VERSION} activating - Cleaning old caches`
  );

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // Mantener cachés de la versión actual, eliminar versiones anteriores
            const isCurrentVersion = cacheName.includes(CACHE_VERSION);
            const isMineTrackCache = cacheName.startsWith("minetrack-");

            if (isMineTrackCache && !isCurrentVersion) {
              console.log("🗑️ Deleting old cache:", cacheName);
              return caches.delete(cacheName);
            }

            return null;
          })
        );
      })
      .then(() => {
        console.log("✅ Cache cleanup complete, taking control");
        return self.clients.claim();
      })
      .then(() => {
        // Notificar a todos los clientes para que recarguen
        return self.clients.matchAll().then((clients) => {
          clients.forEach((client) => {
            console.log(`[SW] Sending reload message to client`);
            client.postMessage({ type: "SW_UPDATED", version: CACHE_VERSION });
          });
        });
      })
  );
});

// ULTRA AGGRESSIVE Fetch event - Cachea TODO, parece siempre online
self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Solo procesar GET requests
  if (request.method !== "GET") return;

  // Obtener configuración de caché
  const cacheConfig = getCacheStrategy(request);

  // Firebase/Firestore - permitir manejo natural offline
  if (!cacheConfig) {
    return;
  }

  event.respondWith(handleUltraAggressiveRequest(request, cacheConfig));
});

// Manejar request con estrategias ULTRA AGRESIVAS
async function handleUltraAggressiveRequest(
  request,
  { strategy, cacheName, critical }
) {
  const cache = await caches.open(cacheName);
  const url = new URL(request.url);

  try {
    switch (strategy) {
      case CACHE_STRATEGIES.CACHE_FIRST:
        return await ultraCacheFirst(request, cache, critical);

      case CACHE_STRATEGIES.STALE_WHILE_REVALIDATE:
        return await staleWhileRevalidate(request, cache);

      case CACHE_STRATEGIES.NETWORK_FIRST_AGGRESSIVE:
        return await networkFirstAggressive(request, cache);

      case CACHE_STRATEGIES.CACHE_ONLY:
        return await cacheOnly(request, cache);

      default:
        return await ultraCacheFirst(request, cache, critical);
    }
  } catch (error) {
    console.error("❌ Request handling failed:", error);
    return createSmartOfflineResponse(request);
  }
}
// ULTRA CACHE FIRST - Para recursos críticos que NUNCA deben fallar
async function ultraCacheFirst(request, cache, critical = false) {
  try {
    // Buscar en caché primero
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      console.log("⚡ ULTRA Cache hit:", request.url);

      // Si no es crítico, actualizar en background
      if (!critical) {
        // Fire-and-forget background update
        fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              cache.put(request, networkResponse.clone());
            }
          })
          .catch(() => {});
      }

      return cachedResponse;
    }

    // No está en caché, buscar en red
    console.log("🌐 Cache miss, fetching:", request.url);
    const networkResponse = await fetch(request);

    if (networkResponse && networkResponse.status === 200) {
      console.log("💾 Caching:", request.url);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.log(
      "❌ Network failed, serving offline response for:",
      request.url
    );

    // Para recursos críticos, intentar desde otras cachés
    if (critical) {
      const fallbackResponse = await findInAnyCache(request);
      if (fallbackResponse) {
        return fallbackResponse;
      }
    }

    return createSmartOfflineResponse(request);
  }
}

// STALE WHILE REVALIDATE - Respuesta inmediata, actualización en background
async function staleWhileRevalidate(request, cache) {
  const cachedResponse = await cache.match(request);

  // Siempre intentar actualizar en background
  const fetchPromise = fetch(request)
    .then((networkResponse) => {
      if (networkResponse && networkResponse.status === 200) {
        console.log("🔄 Background update:", request.url);
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    })
    .catch(() => null);

  // Si hay cache, devolverlo inmediatamente
  if (cachedResponse) {
    console.log("⚡ Stale cache served:", request.url);
    return cachedResponse;
  }

  // No hay cache, esperar red
  console.log("🌐 No cache, waiting for network:", request.url);
  try {
    const networkResponse = await fetchPromise;
    return networkResponse || createSmartOfflineResponse(request);
  } catch (error) {
    return createSmartOfflineResponse(request);
  }
}

// NETWORK FIRST AGGRESSIVE - Red primero pero caché muy accesible
async function networkFirstAggressive(request, cache) {
  try {
    console.log("🌐 Network first:", request.url);
    const networkResponse = await fetch(request);

    if (networkResponse && networkResponse.status === 200) {
      console.log("💾 Caching network response:", request.url);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.log("🔄 Network failed, trying cache:", request.url);
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
      console.log("✅ Cache fallback hit:", request.url);
      return cachedResponse;
    }

    // Buscar en cualquier caché como último recurso
    const anyCache = await findInAnyCache(request);
    if (anyCache) {
      console.log("🔍 Found in alternative cache:", request.url);
      return anyCache;
    }

    return createSmartOfflineResponse(request);
  }
}

// CACHE ONLY - Solo servir desde caché
async function cacheOnly(request, cache) {
  const cachedResponse = await cache.match(request);

  if (cachedResponse) {
    console.log("💾 Cache only hit:", request.url);
    return cachedResponse;
  }

  console.log("❌ Cache only miss:", request.url);
  return createSmartOfflineResponse(request);
}

// Buscar en cualquier caché disponible
async function findInAnyCache(request) {
  const cacheNames = await caches.keys();

  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName);
    const response = await cache.match(request);
    if (response) {
      console.log(`🔍 Found in ${cacheName}:`, request.url);
      return response;
    }
  }

  return null;
}

// Crear respuesta offline INTELIGENTE que engaña al usuario
function createSmartOfflineResponse(request) {
  const url = new URL(request.url);
  const pathname = url.pathname.toLowerCase();

  // Para documentos HTML - Página offline que parece real
  if (
    request.destination === "document" ||
    request.headers.get("accept")?.includes("text/html") ||
    pathname === "/" ||
    pathname.startsWith("/tabs/")
  ) {
    return new Response(
      `
      <!DOCTYPE html>
      <html lang="es">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>MineTrack AI - Modo Offline</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              background: linear-gradient(135deg, #2A3B76 0%, #1e2a5a 100%);
              color: white; min-height: 100vh; display: flex; align-items: center; justify-content: center;
            }
            .container { 
              max-width: 500px; padding: 40px; text-align: center; 
              background: rgba(255,255,255,0.1); backdrop-filter: blur(10px);
              border-radius: 20px; border: 1px solid rgba(255,255,255,0.2);
              box-shadow: 0 20px 40px rgba(0,0,0,0.3);
            }
            .logo { font-size: 60px; margin-bottom: 20px; animation: pulse 2s infinite; }
            h1 { font-size: 28px; margin-bottom: 16px; font-weight: 700; }
            p { font-size: 16px; line-height: 1.6; margin-bottom: 30px; opacity: 0.9; }
            .btn { 
              background: white; color: #2A3B76; border: none; padding: 16px 32px; 
              border-radius: 50px; font-size: 16px; font-weight: 600; cursor: pointer;
              transition: all 0.3s ease; display: inline-block; text-decoration: none;
              box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            }
            .btn:hover { transform: translateY(-2px); box-shadow: 0 15px 40px rgba(0,0,0,0.3); }
            .features { 
              display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); 
              gap: 20px; margin: 30px 0; 
            }
            .feature { 
              background: rgba(255,255,255,0.1); padding: 20px; border-radius: 15px; 
              border: 1px solid rgba(255,255,255,0.1);
            }
            .feature-icon { font-size: 24px; margin-bottom: 8px; }
            .status { 
              position: fixed; top: 20px; right: 20px; 
              background: rgba(255,59,48,0.9); padding: 12px 20px; border-radius: 25px;
              font-size: 14px; font-weight: 500; backdrop-filter: blur(10px);
            }
            @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.1); } }
            @media (max-width: 600px) { 
              .container { margin: 20px; padding: 30px; }
              h1 { font-size: 24px; }
              .features { grid-template-columns: 1fr; }
            }
          </style>
        </head>
        <body>
          <div class="status">🔴 Sin conexión</div>
          <div class="container">
            <div class="logo">⛏️</div>
            <h1>MineTrack AI</h1>
            <p>La aplicación funciona en modo offline. Todos los datos se sincronizarán automáticamente cuando se restaure la conexión.</p>
            
            <div class="features">
              <div class="feature">
                <div class="feature-icon">📱</div>
                <div>Funcionalidad Completa</div>
              </div>
              <div class="feature">
                <div class="feature-icon">💾</div>
                <div>Datos Guardados</div>
              </div>
              <div class="feature">
                <div class="feature-icon">🔄</div>
                <div>Auto-Sincronización</div>
              </div>
            </div>
            
            <button class="btn" onclick="window.location.reload()">
              🔄 Reintentar Conexión
            </button>
          </div>
          
          <script>
            // Auto-reload cuando vuelva la conexión
            window.addEventListener('online', () => {
              setTimeout(() => window.location.reload(), 1000);
            });
            
            // Actualizar estado cada 5 segundos
            setInterval(() => {
              if (navigator.onLine) {
                window.location.reload();
              }
            }, 5000);
          </script>
        </body>
      </html>
    `,
      {
        headers: {
          "Content-Type": "text/html",
          "Cache-Control": "no-store",
        },
        status: 200,
      }
    );
  }

  // Para imágenes - SVG placeholder atractivo
  if (request.destination === "image" || CACHE_PATTERNS.IMAGES.test(pathname)) {
    return new Response(
      `
      <svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#f0f0f0;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#e0e0e0;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="400" height="300" fill="url(#grad)"/>
        <circle cx="200" cy="120" r="30" fill="#ccc"/>
        <path d="M120 180 L200 120 L280 180 L350 120 L350 250 L50 250 Z" fill="#ddd"/>
        <text x="200" y="200" text-anchor="middle" fill="#999" font-family="Arial" font-size="14">
          📷 Imagen no disponible offline
        </text>
        <text x="200" y="220" text-anchor="middle" fill="#bbb" font-family="Arial" font-size="12">
          Se cargará cuando vuelva la conexión
        </text>
      </svg>
    `,
      {
        headers: {
          "Content-Type": "image/svg+xml",
          "Cache-Control": "max-age=300",
        },
        status: 200,
      }
    );
  }

  // Para archivos estáticos - Respuesta JSON con mensaje
  if (CACHE_PATTERNS.STATIC.test(pathname)) {
    return new Response(
      JSON.stringify({
        error: "offline",
        message: "Recurso no disponible sin conexión",
        cached: false,
      }),
      {
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
        },
        status: 503,
      }
    );
  }

  // Default - Respuesta mínima
  return new Response("Offline", {
    status: 503,
    statusText: "Service Unavailable",
    headers: { "Cache-Control": "no-store" },
  });
}

// Gestión de mensajes y utilidades avanzadas
self.addEventListener("message", (event) => {
  const { type, data } = event.data || {};

  switch (type) {
    case "SKIP_WAITING":
      console.log("⚡ Force update requested");
      self.skipWaiting();
      break;

    case "CLEAR_CACHE":
      console.log("🗑️ Cache clear requested");
      event.waitUntil(clearAllCaches());
      break;

    case "GET_CACHE_SIZE":
      event.waitUntil(
        getCacheSize().then((size) => {
          event.ports[0]?.postMessage({ type: "CACHE_SIZE", size });
        })
      );
      break;

    case "PRELOAD_ROUTES":
      console.log("🚀 Preloading routes:", data);
      event.waitUntil(preloadRoutes(data));
      break;

    case "FORCE_CACHE_UPDATE":
      console.log("🔄 Force cache update requested");
      event.waitUntil(forceCacheUpdate());
      break;
  }
});

// Precargar rutas importantes
async function preloadRoutes(routes = []) {
  if (!Array.isArray(routes) || routes.length === 0) return;

  const cache = await caches.open(ROUTES_CACHE);

  for (const route of routes) {
    try {
      console.log("🚀 Preloading:", route);
      const response = await fetch(route);
      if (response.ok) {
        await cache.put(route, response);
      }
    } catch (error) {
      console.warn("❌ Failed to preload:", route, error);
    }
  }
}

// Forzar actualización de cache
async function forceCacheUpdate() {
  const allCaches = await caches.keys();

  for (const cacheName of allCaches) {
    if (cacheName.startsWith("minetrack-")) {
      const cache = await caches.open(cacheName);
      const requests = await cache.keys();

      for (const request of requests) {
        try {
          const response = await fetch(request);
          if (response.ok) {
            await cache.put(request, response);
            console.log("🔄 Updated:", request.url);
          }
        } catch (error) {
          console.warn("❌ Failed to update:", request.url);
        }
      }
    }
  }
}

// Limpiar todas las cachés
async function clearAllCaches() {
  try {
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames
        .filter((name) => name.startsWith("minetrack-"))
        .map((name) => {
          console.log("🗑️ Clearing cache:", name);
          return caches.delete(name);
        })
    );
    console.log("✅ All MineTrack caches cleared");
  } catch (error) {
    console.error("❌ Error clearing caches:", error);
  }
}

// Obtener tamaño total de caché
async function getCacheSize() {
  try {
    const cacheNames = await caches.keys();
    let totalSize = 0;
    let totalEntries = 0;

    for (const cacheName of cacheNames) {
      if (!cacheName.startsWith("minetrack-")) continue;

      const cache = await caches.open(cacheName);
      const requests = await cache.keys();
      totalEntries += requests.length;

      for (const request of requests) {
        try {
          const response = await cache.match(request);
          if (response) {
            const blob = await response.blob();
            totalSize += blob.size;
          }
        } catch (error) {
          // Ignorar errores de entries individuales
        }
      }
    }

    return {
      bytes: totalSize,
      mb: (totalSize / (1024 * 1024)).toFixed(2),
      entries: totalEntries,
      caches: cacheNames.filter((name) => name.startsWith("minetrack-")).length,
    };
  } catch (error) {
    console.error("❌ Error calculating cache size:", error);
    return { bytes: 0, mb: "0", entries: 0, caches: 0 };
  }
}

// Auto-limpieza inteligente cada 6 horas
setInterval(async () => {
  try {
    const size = await getCacheSize();
    console.log(
      `📊 Cache status: ${size.mb}MB, ${size.entries} entries, ${size.caches} caches`
    );

    // Si el cache es muy grande (>100MB), limpiar automáticamente
    if (size.bytes > 100 * 1024 * 1024) {
      console.log("🧹 Cache size limit reached, auto-cleaning...");
      await smartCacheCleanup();
    }
  } catch (error) {
    console.error("❌ Error in auto-cleanup:", error);
  }
}, 6 * 60 * 60 * 1000); // 6 horas

// Limpieza inteligente de caché
async function smartCacheCleanup() {
  try {
    // Limpiar imágenes más antiguas (mantener solo las 50 más recientes)
    const imagesCache = await caches.open(IMAGES_CACHE);
    const imageRequests = await imagesCache.keys();

    if (imageRequests.length > 50) {
      const toDelete = imageRequests.slice(0, imageRequests.length - 50);
      for (const request of toDelete) {
        await imagesCache.delete(request);
      }
      console.log(`🧹 Cleaned ${toDelete.length} old images`);
    }

    // Limpiar caché dinámico si es muy grande
    const dynamicCache = await caches.open(DYNAMIC_CACHE);
    const dynamicRequests = await dynamicCache.keys();

    if (dynamicRequests.length > 30) {
      const toDelete = dynamicRequests.slice(0, dynamicRequests.length - 30);
      for (const request of toDelete) {
        await dynamicCache.delete(request);
      }
      console.log(`🧹 Cleaned ${toDelete.length} dynamic entries`);
    }
  } catch (error) {
    console.error("❌ Error in smart cleanup:", error);
  }
}

console.log(
  "🚀 MineTrack AI Service Worker v3.2 ULTRA AGGRESSIVE MODE loaded!"
);
console.log("📱 Ready to provide seamless offline experience");
console.log("💾 All static resources will be cached aggressively");
console.log("🔄 Auto-updates compatible with Vercel deployments");
