import { supabase } from "@/lib/supabase";
import { generateEmbedding } from "@/lib/rag/embeddings";
import type { DocType } from "@/lib/rag/chunkText";

export interface KnowledgeChunkInput {
  docType: DocType;
  sourceId: string;
  content: string;
  servicioAitId?: string | null;
  projectId?: string | null;
  tagEquipo?: string | null;
  activityCodigo?: string | null;
  fecha?: string | Date | null;
  isHse?: boolean;
  clasificacionHse?: string | null;
  metadata?: Record<string, unknown>;
}

export async function upsertKnowledgeChunk(
  input: KnowledgeChunkInput,
  options?: { forceHash?: boolean }
): Promise<void> {
  const embedding = await generateEmbedding(input.content, {
    forceHash: options?.forceHash,
  });
  const fecha =
    input.fecha instanceof Date
      ? input.fecha.toISOString()
      : input.fecha ?? new Date().toISOString();

  const row = {
    doc_type: input.docType,
    source_id: input.sourceId,
    servicio_ait_id: input.servicioAitId ?? null,
    project_id: input.projectId ?? null,
    tag_equipo: input.tagEquipo ?? null,
    activity_codigo: input.activityCodigo ?? null,
    fecha,
    is_hse: input.isHse ?? false,
    clasificacion_hse: input.clasificacionHse ?? null,
    content: input.content,
    embedding,
    metadata: input.metadata ?? {},
  };

  const { error } = await supabase
    .from("knowledge_embeddings")
    .upsert(row, { onConflict: "doc_type,source_id" });

  if (error) throw error;
}

export async function deleteKnowledgeChunk(
  docType: DocType,
  sourceId: string
): Promise<void> {
  const { error } = await supabase
    .from("knowledge_embeddings")
    .delete()
    .eq("doc_type", docType)
    .eq("source_id", sourceId);
  if (error) throw error;
}

export async function deleteKnowledgeChunksByServicio(
  servicioAitId: string
): Promise<void> {
  const { error } = await supabase
    .from("knowledge_embeddings")
    .delete()
    .eq("servicio_ait_id", servicioAitId);
  if (error) throw error;
}

export interface KnowledgeMatch {
  id: string;
  doc_type: string;
  source_id: string;
  content: string;
  metadata: Record<string, unknown>;
  tag_equipo: string | null;
  similarity: number;
}

export async function matchKnowledge(
  query: string,
  options?: {
    matchCount?: number;
    tagEquipo?: string;
    projectId?: string;
    docType?: DocType;
    isHse?: boolean;
  }
): Promise<KnowledgeMatch[]> {
  const embedding = await generateEmbedding(query);
  const { data, error } = await supabase.rpc("match_knowledge", {
    query_embedding: embedding,
    match_count: options?.matchCount ?? 8,
    filter_tag: options?.tagEquipo ?? null,
    filter_project_id: options?.projectId ?? null,
    filter_doc_type: options?.docType ?? null,
    filter_is_hse: options?.isHse ?? null,
  });
  if (error) {
    console.warn("match_knowledge RPC failed:", error.message);
    return [];
  }
  return (data ?? []) as KnowledgeMatch[];
}
