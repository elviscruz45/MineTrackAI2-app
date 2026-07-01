import { upsertKnowledgeChunk } from "@/lib/db/knowledgeEmbeddings";
import { runWithConcurrency } from "@/lib/utils/runWithConcurrency";
import {
  buildEmbeddingChunksForProject,
  type ProjectServicePayload,
} from "@/lib/rag/indexProjectEmbeddings";

export type EmbeddingProgressCallback = (
  message: string,
  current: number,
  total: number
) => void;

const MAX_RETRIES = 2;
const CHUNK_CONCURRENCY = 3;

async function upsertChunkWithRetry(
  chunk: ReturnType<typeof buildEmbeddingChunksForProject>[number],
  forceHash: boolean
): Promise<void> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      await upsertKnowledgeChunk(
        {
          docType: chunk.docType,
          sourceId: chunk.sourceId,
          content: chunk.content,
          servicioAitId: chunk.servicioAitId,
          projectId: chunk.projectId,
          tagEquipo: chunk.tagEquipo,
          activityCodigo: chunk.activityCodigo,
          metadata: chunk.metadata,
        },
        { forceHash }
      );
      return;
    } catch (err) {
      lastError = err;
      if (attempt < MAX_RETRIES) {
        await new Promise((r) => setTimeout(r, 300 * (attempt + 1)));
      }
    }
  }
  console.error(`Embedding chunk failed after retries: ${chunk.sourceId}`, lastError);
  throw lastError;
}

/**
 * Client-side fallback processor when server edge function is unavailable.
 */
export async function processEmbeddingQueueClient(
  services: ProjectServicePayload[],
  onProgress?: EmbeddingProgressCallback,
  options?: { forceHash?: boolean }
): Promise<{ succeeded: number; failed: number; total: number }> {
  const chunks = buildEmbeddingChunksForProject(services);
  const total = chunks.length;
  let succeeded = 0;
  let failed = 0;
  let completed = 0;

  onProgress?.("Indexando chunks…", 0, total);

  await runWithConcurrency(chunks, CHUNK_CONCURRENCY, async (chunk) => {
    try {
      await upsertChunkWithRetry(chunk, Boolean(options?.forceHash));
      succeeded++;
    } catch {
      failed++;
    } finally {
      completed++;
      onProgress?.(`Indexando ${completed}/${total} chunks…`, completed, total);
    }
  });

  return { succeeded, failed, total };
}
