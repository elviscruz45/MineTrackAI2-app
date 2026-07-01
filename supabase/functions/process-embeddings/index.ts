import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const DIM = 768;

interface EmbeddingJob {
  id: string;
  project_id: string | null;
  servicio_ait_id: string;
  doc_type: string;
  source_id: string;
  content: string;
  metadata: Record<string, unknown>;
  tag_equipo: string | null;
  activity_codigo: string | null;
  attempts: number;
}

function hashEmbedding(text: string): number[] {
  const vec = new Array(DIM).fill(0);
  for (let i = 0; i < text.length; i++) {
    const c = text.charCodeAt(i);
    vec[i % DIM] += c / 255;
    vec[(i * 7 + 13) % DIM] += ((c * 31) % 256) / 256;
    vec[(i * 17 + 3) % DIM] += ((c * 97) % 256) / 256;
  }
  const norm = Math.sqrt(vec.reduce((s, v) => s + v * v, 0)) || 1;
  return vec.map((v) => v / norm);
}

async function embedText(text: string): Promise<number[]> {
  const apiKey =
    Deno.env.get("GEMINI_API_KEY") ?? Deno.env.get("GOOGLE_API_KEY") ?? "";
  if (!apiKey || !apiKey.startsWith("AIza")) {
    return hashEmbedding(text);
  }

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "models/text-embedding-004",
          content: { parts: [{ text: text.slice(0, 8000) }] },
          outputDimensionality: DIM,
        }),
      }
    );
    if (!res.ok) {
      console.warn("Gemini embed failed:", res.status);
      return hashEmbedding(text);
    }
    const json = await res.json();
    const values = json?.embedding?.values;
    if (!Array.isArray(values) || values.length === 0) {
      return hashEmbedding(text);
    }
    return values;
  } catch (err) {
    console.warn("Gemini embed error:", err);
    return hashEmbedding(text);
  }
}

async function processJob(
  supabase: ReturnType<typeof createClient>,
  job: EmbeddingJob
): Promise<{ ok: boolean; error?: string }> {
  try {
    const embedding = await embedText(job.content);
    const { error: upsertError } = await supabase
      .from("knowledge_embeddings")
      .upsert(
        {
          doc_type: job.doc_type,
          source_id: job.source_id,
          servicio_ait_id: job.servicio_ait_id,
          project_id: job.project_id,
          tag_equipo: job.tag_equipo,
          activity_codigo: job.activity_codigo,
          content: job.content,
          embedding,
          metadata: job.metadata ?? {},
          fecha: new Date().toISOString(),
        },
        { onConflict: "doc_type,source_id" }
      );

    if (upsertError) {
      return { ok: false, error: upsertError.message };
    }

    await supabase
      .from("embedding_jobs")
      .update({
        status: "done",
        processed_at: new Date().toISOString(),
        last_error: null,
      })
      .eq("id", job.id);

    return { ok: true };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}

Deno.serve(async (req) => {
  try {
    const body = req.method === "POST" ? await req.json().catch(() => ({})) : {};
    const batchSize = Math.min(Number(body.batchSize) || 50, 100);
    const projectId = body.projectId as string | undefined;
    const maxRounds = Math.min(Number(body.maxRounds) || 10, 20);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    let totalProcessed = 0;
    let totalSucceeded = 0;
    let totalFailed = 0;

    for (let round = 0; round < maxRounds; round++) {
      let query = supabase
        .from("embedding_jobs")
        .select("*")
        .eq("status", "pending")
        .order("created_at", { ascending: true })
        .limit(batchSize);

      if (projectId) {
        query = query.eq("project_id", projectId);
      }

      const { data: jobs, error: fetchError } = await query;
      if (fetchError) {
        return new Response(JSON.stringify({ error: fetchError.message }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        });
      }

      const pending = (jobs ?? []) as EmbeddingJob[];
      if (pending.length === 0) break;

      const jobIds = pending.map((j) => j.id);
      await supabase
        .from("embedding_jobs")
        .update({ status: "processing" })
        .in("id", jobIds);

      for (const job of pending) {
        const result = await processJob(supabase, job);
        totalProcessed++;
        if (result.ok) {
          totalSucceeded++;
        } else {
          totalFailed++;
          await supabase
            .from("embedding_jobs")
            .update({
              status: job.attempts >= 2 ? "failed" : "pending",
              attempts: job.attempts + 1,
              last_error: result.error ?? "unknown",
              processed_at: new Date().toISOString(),
            })
            .eq("id", job.id);
        }
      }

      if (pending.length < batchSize) break;
    }

    return new Response(
      JSON.stringify({
        processed: totalProcessed,
        succeeded: totalSucceeded,
        failed: totalFailed,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("process-embeddings error:", error);
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
