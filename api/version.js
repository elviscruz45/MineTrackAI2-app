// api/version.js - Vercel serverless function
export default function handler(req, res) {
  const version = process.env.VERCEL_GIT_COMMIT_SHA || Date.now().toString();
  const timestamp = Date.now();

  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");

  res.status(200).json({
    version,
    timestamp,
    buildTime: process.env.VERCEL_BUILD_TIME || new Date().toISOString(),
  });
}
