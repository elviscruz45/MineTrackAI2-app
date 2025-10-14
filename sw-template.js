import { precacheAndRoute, cleanupOutdatedCaches } from "workbox-precaching";
import { skipWaiting, clientsClaim } from "workbox-core";
import { registerRoute } from "workbox-routing";
import {
  StaleWhileRevalidate,
  CacheFirst,
  NetworkFirst,
} from "workbox-strategies";

// Precache all static assets
precacheAndRoute(self.__WB_MANIFEST);

// Clean up outdated caches
cleanupOutdatedCaches();

// Version check for updates
const CACHE_VERSION = "${Date.now()}";
const DATA_CACHE_NAME = "minetrack-data-v" + CACHE_VERSION;

// Listen for skip waiting message
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    skipWaiting();
  }
});

// Check for data updates periodically
self.addEventListener("activate", (event) => {
  console.log("Service Worker activated, version:", CACHE_VERSION);

  // Check if we need to update data cache
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (
            cacheName.startsWith("minetrack-data-v") &&
            cacheName !== DATA_CACHE_NAME
          ) {
            console.log("Deleting old data cache:", cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Enhanced API caching with update detection
registerRoute(
  /^https:\/\/.*\.firebaseapp\.com\/.*$/,
  new NetworkFirst({
    cacheName: "firebase-api",
    networkTimeoutSeconds: 5,
    plugins: [
      {
        cacheKeyWillBeUsed: async ({ request }) => {
          // Add timestamp to cache key for data freshness
          return `${request.url}?t=${Math.floor(Date.now() / (1000 * 60 * 5))}`; // 5-minute buckets
        },
        cacheWillUpdate: async ({ request, response }) => {
          // Only cache successful responses
          return response.status === 200;
        },
      },
    ],
  })
);

// Background sync for offline actions
self.addEventListener("sync", (event) => {
  if (event.tag === "background-sync") {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  // Check for app updates when back online
  try {
    const registration = await self.registration;
    await registration.update();
    console.log("Background sync: Checked for updates");
  } catch (error) {
    console.error("Background sync failed:", error);
  }
}

// Periodic background sync (when supported)
self.addEventListener("periodicsync", (event) => {
  if (event.tag === "check-updates") {
    event.waitUntil(checkForUpdates());
  }
});

async function checkForUpdates() {
  try {
    // Check if there are new updates available
    const response = await fetch("/api/version", {
      cache: "no-cache",
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });

    if (response.ok) {
      const { version, timestamp } = await response.json();
      const currentVersion = await getStoredVersion();

      if (version !== currentVersion) {
        // New version available, notify clients
        const clients = await self.clients.matchAll();
        clients.forEach((client) => {
          client.postMessage({
            type: "UPDATE_AVAILABLE",
            version: version,
            timestamp: timestamp,
          });
        });

        // Store new version
        await storeVersion(version);
      }
    }
  } catch (error) {
    console.error("Error checking for updates:", error);
  }
}

async function getStoredVersion() {
  try {
    const cache = await caches.open("version-cache");
    const response = await cache.match("/version");
    if (response) {
      const data = await response.json();
      return data.version;
    }
  } catch (error) {
    console.error("Error getting stored version:", error);
  }
  return null;
}

async function storeVersion(version) {
  try {
    const cache = await caches.open("version-cache");
    await cache.put(
      "/version",
      new Response(
        JSON.stringify({
          version,
          timestamp: Date.now(),
        })
      )
    );
  } catch (error) {
    console.error("Error storing version:", error);
  }
}

// Install event - cache critical resources immediately
self.addEventListener("install", (event) => {
  console.log("Service Worker installing, version:", CACHE_VERSION);

  event.waitUntil(
    caches.open(DATA_CACHE_NAME).then((cache) => {
      // Pre-cache critical app shell resources
      return cache.addAll([
        "/",
        "/manifest.json",
        // Add other critical resources
      ]);
    })
  );
});
