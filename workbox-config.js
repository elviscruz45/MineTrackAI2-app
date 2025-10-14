module.exports = {
  globDirectory: "dist/",
  globPatterns: [
    "**/*.{html,js,css,png,jpg,jpeg,svg,gif,ico,json,woff,woff2,ttf,eot}",
  ],
  swDest: "public/sw.js",
  swSrc: "sw-template.js",
  maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/fonts\.googleapis\.com/,
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "google-fonts-stylesheets",
      },
    },
    {
      urlPattern: /^https:\/\/fonts\.gstatic\.com/,
      handler: "CacheFirst",
      options: {
        cacheName: "google-fonts-webfonts",
        expiration: {
          maxEntries: 30,
          maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
        },
      },
    },
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif|ico)$/,
      handler: "CacheFirst",
      options: {
        cacheName: "images",
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
        },
      },
    },
    {
      urlPattern: /\.(?:js|css)$/,
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "static-resources",
      },
    },
    // API calls caching
    {
      urlPattern: /^https:\/\/.*\.firebaseapp\.com\/.*$/,
      handler: "NetworkFirst",
      options: {
        cacheName: "firebase-api",
        networkTimeoutSeconds: 3,
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 60 * 5, // 5 minutes
        },
      },
    },
    // Supabase API calls
    {
      urlPattern: /^https:\/\/.*\.supabase\.co\/.*$/,
      handler: "NetworkFirst",
      options: {
        cacheName: "supabase-api",
        networkTimeoutSeconds: 3,
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 60 * 5, // 5 minutes
        },
      },
    },
  ],
  skipWaiting: false, // Don't automatically activate new service worker
  clientsClaim: false, // Don't immediately control all clients
};
