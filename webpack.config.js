// webpack.config.js - Optimizado para carga rápida
const createExpoWebpackConfigAsync = require("@expo/webpack-config");
const CompressionPlugin = require("compression-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);

  // Code Splitting Optimizado - Separar bibliotecas pesadas
  config.optimization.splitChunks = {
    chunks: "all",
    cacheGroups: {
      // Vendor principal (React, React Native, etc)
      defaultVendors: {
        test: /[\\/]node_modules[\\/](react|react-dom|react-native|react-native-web)[\\/]/,
        name: "vendors",
        priority: 20,
        reuseExistingChunk: true,
      },
      // Firebase chunk separado (muy pesado - ~200KB)
      firebase: {
        test: /[\\/]node_modules[\\/](firebase|@firebase)[\\/]/,
        name: "firebase",
        priority: 15,
        reuseExistingChunk: true,
      },
      // Charts y visualización (pesado - ~150KB)
      charts: {
        test: /[\\/]node_modules[\\/](react-native-chart-kit|react-native-svg|zingchart|react-native-progress)[\\/]/,
        name: "charts",
        priority: 12,
        reuseExistingChunk: true,
      },
      // Documentos (Excel, Word, PDF)
      documents: {
        test: /[\\/]node_modules[\\/](docx|xlsx|papaparse|file-saver)[\\/]/,
        name: "documents",
        priority: 12,
        reuseExistingChunk: true,
      },
      // Redux y state management
      redux: {
        test: /[\\/]node_modules[\\/](redux|react-redux|redux-thunk)[\\/]/,
        name: "redux",
        priority: 10,
        reuseExistingChunk: true,
      },
      // UI libraries
      ui: {
        test: /[\\/]node_modules[\\/](@rneui|react-native-paper|@react-native-community)[\\/]/,
        name: "ui",
        priority: 10,
        reuseExistingChunk: true,
      },
      // Common code compartido entre chunks
      common: {
        minChunks: 2,
        priority: 5,
        reuseExistingChunk: true,
        enforce: true,
      },
    },
    maxInitialRequests: 30,
    maxAsyncRequests: 30,
    minSize: 20000,
    maxSize: 244000, // 244KB max por chunk
  };

  // Runtime chunk separado para mejor caching
  config.optimization.runtimeChunk = {
    name: "runtime",
  };

  // Producción: Minificación agresiva y compresión
  if (env.mode === "production") {
    config.optimization.minimize = true;
    config.optimization.minimizer = [
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: true, // Eliminar console.log en prod
            drop_debugger: true,
            pure_funcs: ["console.log", "console.info", "console.debug"],
            passes: 2, // Dos pasadas de optimización
          },
          mangle: {
            safari10: true, // Compatibilidad Safari
          },
          format: {
            comments: false, // Sin comentarios
          },
        },
        extractComments: false,
        parallel: true, // Paralelizar compresión
      }),
    ];

    // Compresión Gzip para archivos estáticos
    config.plugins.push(
      new CompressionPlugin({
        filename: "[path][base].gz",
        algorithm: "gzip",
        test: /\.(js|css|html|svg)$/,
        threshold: 10240, // Solo > 10KB
        minRatio: 0.8,
      })
    );
  }

  // Performance budgets - Alertas si bundles son muy grandes
  config.performance = {
    maxEntrypointSize: 512000, // 500KB warning
    maxAssetSize: 512000,
    hints: env.mode === "production" ? "warning" : false,
  };

  return config;
};
