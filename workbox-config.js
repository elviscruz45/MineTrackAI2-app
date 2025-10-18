module.exports = {
  globDirectory: "dist/",
  globPatterns: [
    "**/*.{html,js,css,png,jpg,jpeg,svg,gif,ico,json,woff,woff2,ttf,eot}",
  ],
  swDest: "dist/sw.js",
  swSrc: "public/sw.js",
  maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB
};
