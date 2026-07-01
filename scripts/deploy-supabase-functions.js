#!/usr/bin/env node
const { spawnSync } = require("child_process");
const path = require("path");
const { loadEnv } = require("./load-env");

loadEnv();

const projectRef = process.env.SUPABASE_PROJECT_REF || "hsdfxbgwrmpszmrjqzel";
const token = process.env.SUPABASE_ACCESS_TOKEN;

if (!token) {
  console.error("❌ SUPABASE_ACCESS_TOKEN missing in .env");
  process.exit(1);
}

const root = path.join(__dirname, "..");
const functions = ["on-event-created", "rag-query", "process-embeddings"];

function run(args) {
  const result = spawnSync("npx", args, {
    stdio: "inherit",
    cwd: root,
    env: process.env,
  });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

run(["supabase", "login", "--token", token]);
run(["supabase", "link", "--project-ref", projectRef]);

for (const fn of functions) {
  console.log(`\n→ Deploying ${fn}...`);
  run(["supabase", "functions", "deploy", fn, "--project-ref", projectRef]);
}

const gemini =
  process.env.GEMINI_API_KEY ||
  process.env.EXPO_PUBLIC_GEMINI_API_KEY ||
  "";

if (gemini.trim()) {
  console.log("\n→ Setting GEMINI_API_KEY secret...");
  run([
    "supabase",
    "secrets",
    "set",
    `GEMINI_API_KEY=${gemini.trim()}`,
    "--project-ref",
    projectRef,
  ]);
} else {
  console.warn(
    "\n⚠ GEMINI_API_KEY not set (add key to GEMINI_API_KEY or EXPO_PUBLIC_GEMINI_API_KEY in .env)"
  );
}

console.log("\n✅ Edge functions deployed.");
