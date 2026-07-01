#!/usr/bin/env node
/**
 * Push migrations + deploy edge functions using Supabase CLI and .env credentials.
 */
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

function run(cmd, args) {
  console.log(`\n→ ${cmd} ${args.join(" ")}`);
  const result = spawnSync(cmd, args, {
    stdio: "inherit",
    cwd: path.join(__dirname, ".."),
    env: process.env,
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

run("npx", ["supabase", "login", "--token", token]);
run("npx", ["supabase", "link", "--project-ref", projectRef]);
run("npx", ["supabase", "db", "push", "--linked"]);
