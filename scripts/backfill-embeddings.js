#!/usr/bin/env node
/**
 * Backfill knowledge_embeddings from activities, events, maintenance_logs, servicios_ait.
 *
 * Usage:
 *   SUPABASE_DB_PASSWORD=xxx node scripts/backfill-embeddings.js
 *   or SUPABASE_DB_URL=postgresql://...
 */
const fs = require("fs");
const path = require("path");

const DIM = 768;

function hashEmbedding(text) {
  const vec = new Array(DIM).fill(0);
  const str = text.trim() || "empty";
  for (let i = 0; i < str.length; i++) {
    const c = str.charCodeAt(i);
    vec[i % DIM] += c / 255;
    vec[(i * 7 + 13) % DIM] += ((c * 31) % 256) / 256;
    vec[(i * 17 + 3) % DIM] += ((c * 97) % 256) / 256;
  }
  const norm = Math.sqrt(vec.reduce((s, v) => s + v * v, 0)) || 1;
  return vec.map((v) => v / norm);
}

function buildActivityChunk(a, sa) {
  return [
    `TIPO: Actividad planificada WBS5`,
    `Código WBS: ${a.codigo ?? ""}`,
    `Nombre: ${a.nombre_servicio ?? ""}`,
    `Tag equipo: ${a.tag_equipo ?? sa?.tag_equipo ?? ""}`,
    `Proyecto: ${sa?.project_name ?? ""}`,
    `Servicio: ${sa?.nombre_servicio ?? ""}`,
    `Fecha fin plan: ${a.fecha_fin ?? ""}`,
    `Fecha fin real: ${a.real_fecha_fin ?? "pendiente"}`,
  ].join("\n");
}

function buildEventChunk(e) {
  const isHse =
    String(e.tipo_evento ?? "").toUpperCase().includes("HSE") ||
    Boolean(e.clasificacion_hse);
  return [
    `TIPO: Evento de campo`,
    `Título: ${e.titulo ?? ""}`,
    `Descripción: ${e.comentarios ?? ""}`,
    `Tag: ${e.tag_equipo ?? ""}`,
    `Actividad WBS: ${e.activity_codigo ?? ""}`,
    `Servicio: ${e.ait_nombre_servicio ?? ""}`,
    isHse ? `HSE: ${e.clasificacion_hse}` : "",
    `Fecha: ${e.created_at ?? ""}`,
  ]
    .filter(Boolean)
    .join("\n");
}

function buildMaintenanceChunk(ml) {
  return [
    `TIPO: Mantenimiento diario`,
    `Tag: ${ml.tag_code ?? ""}`,
    `Descripción: ${ml.descripcion ?? ""}`,
    `Tipo: ${ml.tipo_mantenimiento ?? ""}`,
    `Personal: ${ml.personnel_type ?? ""}`,
    `Fecha: ${ml.fecha ?? ""}`,
  ].join("\n");
}

async function upsertChunk(client, row) {
  await client.query(
    `INSERT INTO knowledge_embeddings (
      doc_type, source_id, servicio_ait_id, project_id, tag_equipo,
      activity_codigo, fecha, is_hse, clasificacion_hse, content, embedding, metadata
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
    ON CONFLICT (doc_type, source_id) DO UPDATE SET
      content = EXCLUDED.content,
      embedding = EXCLUDED.embedding,
      tag_equipo = EXCLUDED.tag_equipo,
      fecha = EXCLUDED.fecha,
      is_hse = EXCLUDED.is_hse`,
    [
      row.doc_type,
      row.source_id,
      row.servicio_ait_id,
      row.project_id,
      row.tag_equipo,
      row.activity_codigo,
      row.fecha,
      row.is_hse,
      row.clasificacion_hse,
      row.content,
      `[${row.embedding.join(",")}]`,
      JSON.stringify(row.metadata ?? {}),
    ]
  );
}

async function main() {
  const pg = require("pg");
  const projectRef = process.env.SUPABASE_PROJECT_REF || "hsdfxbgwrmpszmrjqzel";
  const password = process.env.SUPABASE_DB_PASSWORD;
  const connectionString =
    process.env.SUPABASE_DB_URL ||
    (password
      ? `postgresql://postgres.${projectRef}:${encodeURIComponent(password)}@aws-0-us-east-1.pooler.supabase.com:6543/postgres`
      : null);

  if (!connectionString) {
    console.error("Set SUPABASE_DB_URL or SUPABASE_DB_PASSWORD");
    process.exit(1);
  }

  const client = new pg.Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  console.log("Connected. Backfilling knowledge_embeddings...");

  let count = 0;

  const { rows: servicios } = await client.query(
    `SELECT sa.*, p.project_name FROM servicios_ait sa
     LEFT JOIN projects p ON p.id = sa.project_id`
  );

  for (const sa of servicios) {
    const { rows: acts } = await client.query(
      `SELECT * FROM activities WHERE servicio_ait_id = $1`,
      [sa.id]
    );
    for (const a of acts) {
      const content = buildActivityChunk(a, sa);
      const actKey = a.codigo || a.nombre_servicio;
      await upsertChunk(client, {
        doc_type: "activity_plan",
        source_id: `${sa.id}-${actKey}`,
        servicio_ait_id: sa.id,
        project_id: sa.project_id,
        tag_equipo: a.tag_equipo || sa.tag_equipo,
        activity_codigo: a.codigo,
        fecha: a.fecha_fin,
        is_hse: false,
        clasificacion_hse: null,
        content,
        embedding: hashEmbedding(content),
        metadata: { nombre: a.nombre_servicio },
      });
      count++;
    }
  }
  console.log(`  ✓ activities: ${count}`);
  count = 0;

  const { rows: events } = await client.query(`SELECT * FROM events`);
  for (const e of events) {
    const content = buildEventChunk(e);
    const isHse =
      String(e.tipo_evento ?? "").toUpperCase().includes("HSE") ||
      Boolean(e.clasificacion_hse);
    await upsertChunk(client, {
      doc_type: "event_post",
      source_id: e.id,
      servicio_ait_id: e.servicio_ait_id,
      project_id: e.project_id,
      tag_equipo: e.tag_equipo,
      activity_codigo: e.activity_codigo,
      fecha: e.created_at,
      is_hse: isHse,
      clasificacion_hse: e.clasificacion_hse,
      content,
      embedding: hashEmbedding(content),
      metadata: { titulo: e.titulo },
    });
    count++;
  }
  console.log(`  ✓ events: ${count}`);
  count = 0;

  try {
    const { rows: logs } = await client.query(`SELECT * FROM maintenance_logs`);
    for (const ml of logs) {
      const content = buildMaintenanceChunk(ml);
      await upsertChunk(client, {
        doc_type: "maintenance_log",
        source_id: ml.id,
        servicio_ait_id: ml.servicio_ait_id,
        project_id: ml.project_id,
        tag_equipo: ml.tag_code,
        activity_codigo: null,
        fecha: ml.fecha,
        is_hse: Boolean(ml.clasificacion_hse),
        clasificacion_hse: ml.clasificacion_hse,
        content,
        embedding: hashEmbedding(content),
        metadata: {},
      });
      count++;
    }
    console.log(`  ✓ maintenance_logs: ${count}`);
  } catch {
    console.log("  ⚠ maintenance_logs table not found (run migration 004 first)");
  }

  await client.end();
  console.log("Backfill complete.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
