// webpack.config.js
module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);
  config.optimization.splitChunks = {
    chunks: "all",
    maxInitialRequests: 25,
    minSize: 20000,
  };
  return config;
};
