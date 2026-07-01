import { supabase } from "@/lib/supabase";
import {
  buildEmbeddingChunksForProject,
  type ProjectServicePayload,
} from "@/lib/rag/indexProjectEmbeddings";

export interface EmbeddingJobRow {
  project_id: string;
  servicio_ait_id: string;
  doc_type: string;
  source_id: string;
  content: string;
  metadata?: Record<string, unknown>;
  tag_equipo?: string | null;
  activity_codigo?: string | null;
  status?: string;
}

export function buildEmbeddingJobRows(
  services: ProjectServicePayload[]
): EmbeddingJobRow[] {
  return buildEmbeddingChunksForProject(services).map((chunk) => ({
    project_id: chunk.projectId,
    servicio_ait_id: chunk.servicioAitId,
    doc_type: chunk.docType,
    source_id: chunk.sourceId,
    content: chunk.content,
    metadata: chunk.metadata ?? {},
    tag_equipo: chunk.tagEquipo ?? null,
    activity_codigo: chunk.activityCodigo ?? null,
    status: "pending",
  }));
}

export async function enqueueEmbeddingJobs(
  services: ProjectServicePayload[]
): Promise<number> {
  const rows = buildEmbeddingJobRows(services);
  if (rows.length === 0) return 0;

  const BATCH = 100;
  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH);
    const { error } = await supabase.from("embedding_jobs").insert(batch);
    if (error) throw error;
  }

  return rows.length;
}

export async function triggerProcessEmbeddings(
  projectId?: string,
  batchSize = 50
): Promise<boolean> {
  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !anonKey) {
    console.warn("Supabase URL/key missing; cannot trigger process-embeddings");
    return false;
  }

  try {
    const res = await fetch(`${supabaseUrl}/functions/v1/process-embeddings`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${anonKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ projectId, batchSize }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.warn("process-embeddings failed:", res.status, text);
      return false;
    }

    return true;
  } catch (err) {
    console.warn("process-embeddings invoke error:", err);
    return false;
  }
}
