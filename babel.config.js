// babel.config.js - Optimizado para build rápido
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      // React Native Reanimated (debe ir al final)
      "react-native-reanimated/plugin",
    ],
    env: {
      production: {
        plugins: [
          // Eliminar console.logs en producción (ahorra bytes y mejora rendimiento)
          ["transform-remove-console", { exclude: ["error", "warn"] }],
        ],
      },
    },
  };
};
