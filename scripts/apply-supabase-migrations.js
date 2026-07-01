#!/usr/bin/env node
/**
 * Applies SQL migrations in supabase/migrations/ to the linked Supabase project.
 *
 * Required env (one of):
 *   SUPABASE_DB_URL=postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
 *   or SUPABASE_DB_PASSWORD + SUPABASE_PROJECT_REF=hsdfxbgwrmpszmrjqzel
 */
const fs = require("fs");
const path = require("path");
const { loadEnv } = require("./load-env");

async function main() {
  loadEnv();
  let pg;
  try {
    pg = require("pg");
  } catch {
    console.error("Install pg: npm install pg");
    process.exit(1);
  }

  const projectRef =
    process.env.SUPABASE_PROJECT_REF || "hsdfxbgwrmpszmrjqzel";
  const password = process.env.SUPABASE_DB_PASSWORD;
  let connectionString = process.env.SUPABASE_DB_URL;

  if (
    connectionString &&
    (connectionString.includes("YOUR_PASSWORD") || connectionString.includes("[YOUR-PASSWORD]"))
  ) {
    connectionString = null;
  }

  if (!connectionString && password) {
    // Direct connection (most reliable for DDL migrations)
    connectionString = `postgresql://postgres:${encodeURIComponent(password)}@db.${projectRef}.supabase.co:5432/postgres`;
  }

  if (!connectionString && password) {
    connectionString = `postgresql://postgres.${projectRef}:${encodeURIComponent(password)}@aws-0-us-east-1.pooler.supabase.com:6543/postgres`;
  }

  if (!connectionString) {
    console.error(
      "Set SUPABASE_DB_URL or SUPABASE_DB_PASSWORD in .env (Database password from Supabase Dashboard → Settings → Database)"
    );
    process.exit(1);
  }

  const client = new pg.Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  const migrationsDir = path.join(__dirname, "..", "supabase", "migrations");
  const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  await client.connect();
  console.log(`Connected. Applying ${files.length} migration(s)...`);

  for (const file of files) {
    const sql = fs.readFileSync(path.join(migrationsDir, file), "utf8");
    console.log(`→ ${file}`);
    try {
      await client.query(sql);
      console.log(`  ✓ ${file}`);
    } catch (err) {
      const msg = err.message || String(err);
      if (
        msg.includes("already exists") ||
        msg.includes("duplicate key") ||
        msg.includes("already member of publication")
      ) {
        console.log(`  ⚠ skipped (already applied): ${msg.split("\n")[0]}`);
      } else {
        console.error(`  ✗ ${file}:`, msg);
        await client.end();
        process.exit(1);
      }
    }
  }

  await client.end();
  console.log("All migrations applied.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
