import { supabase } from "@/lib/supabase";
import type { FirebaseServicioAitDoc } from "./types";
import {
  servicioAitToFirebase,
  firebaseToServicioAit,
  partialFirebaseToServicioAit,
  firebaseToActivity,
  activityToFirebase,
  firebaseToPdf,
  pdfToFirebase,
  eventToSummary,
} from "./mappers";
import { getEventsByServicioAitId } from "./events";
import { upsertKnowledgeChunk } from "./knowledgeEmbeddings";
import { buildActivityChunk, buildServiceSummaryChunk } from "@/lib/rag/chunkText";
import { runWithConcurrency } from "@/lib/utils/runWithConcurrency";
import { uniqueRealtimeChannel } from "@/lib/utils/realtimeChannel";

const EMBEDDING_CONCURRENCY = 3;

async function replaceAllActivities(
  servicioAitId: string,
  activitiesData: Record<string, unknown>[]
): Promise<void> {
  const { error: deleteError } = await supabase
    .from("activities")
    .delete()
    .eq("servicio_ait_id", servicioAitId);
  if (deleteError) throw deleteError;

  const activities = activitiesData.map((a) => firebaseToActivity(a, servicioAitId));
  if (activities.length > 0) {
    const { error: insertError } = await supabase
      .from("activities")
      .insert(activities);
    if (insertError) throw insertError;
  }
}

async function patchActivitiesById(
  servicioAitId: string,
  activitiesData: Record<string, unknown>[]
): Promise<void> {
  const results = await Promise.all(
    activitiesData.map((activity) => {
      const row = firebaseToActivity(activity, servicioAitId);
      return supabase
        .from("activities")
        .update(row)
        .eq("id", String(activity.id));
    })
  );

  const failed = results.find((result) => result.error);
  if (failed?.error) throw failed.error;
}

function syncServicioActivityEmbeddingsBackground(
  servicioAitId: string,
  activitiesData: Record<string, unknown>[]
): void {
  void (async () => {
    try {
      const { data: svc } = await supabase
        .from("servicios_ait")
        .select("*")
        .eq("id", servicioAitId)
        .maybeSingle();

      const svcFirebase = svc
        ? servicioAitToFirebase(
            svc as Parameters<typeof servicioAitToFirebase>[0],
            [],
            [],
            []
          )
        : {};

      const chunks: KnowledgeChunkInput[] = [
        {
          docType: "service_summary",
          sourceId: servicioAitId,
          content: buildServiceSummaryChunk(svcFirebase, activitiesData),
          servicioAitId,
          projectId: (svc?.project_id as string) || null,
          tagEquipo: String(svc?.tag_equipo ?? ""),
        },
        ...activitiesData.flatMap((activity) => {
          const actKey = String(
            activity.Codigo ?? activity.codigo ?? activity.NombreServicio ?? ""
          );
          if (!actKey) return [];
          return [
            {
              docType: "activity_plan" as const,
              sourceId: `${servicioAitId}-${actKey}`,
              content: buildActivityChunk(activity, {
                ...svcFirebase,
                TagEquipo: svc?.tag_equipo,
              }),
              servicioAitId,
              projectId: (svc?.project_id as string) || null,
              tagEquipo: String(
                activity.TagEquipo ?? activity.tag_equipo ?? svc?.tag_equipo ?? ""
              ),
              activityCodigo: String(activity.Codigo ?? activity.codigo ?? ""),
            },
          ];
        }),
      ];

      await runWithConcurrency(chunks, EMBEDDING_CONCURRENCY, async (chunk) => {
        await upsertKnowledgeChunk(chunk);
      });
    } catch (embedErr) {
      console.warn("Activity embeddings sync skipped:", embedErr);
    }
  })();
}

type KnowledgeChunkInput = Parameters<typeof upsertKnowledgeChunk>[0];

export async function updateServicioActivities(
  servicioAitId: string,
  activitiesData: Record<string, unknown>[],
  options?: { syncEmbeddings?: boolean }
): Promise<void> {
  const canPatch =
    activitiesData.length > 0 &&
    activitiesData.every((activity) => activity.id);

  if (canPatch) {
    await patchActivitiesById(servicioAitId, activitiesData);
  } else {
    await replaceAllActivities(servicioAitId, activitiesData);
  }

  if (options?.syncEmbeddings !== false) {
    syncServicioActivityEmbeddingsBackground(servicioAitId, activitiesData);
  }
}

async function enrichServicio(row: Record<string, unknown>): Promise<FirebaseServicioAitDoc> {
  const id = String(row.id);
  const [activitiesRes, pdfsRes, events] = await Promise.all([
    supabase.from("activities").select("*").eq("servicio_ait_id", id),
    supabase.from("service_pdfs").select("*").eq("servicio_ait_id", id),
    getEventsByServicioAitId(id),
  ]);
  const eventsSummary = events.map((e) => eventToSummary(e as Record<string, unknown>));
  return servicioAitToFirebase(
    row as unknown as Parameters<typeof servicioAitToFirebase>[0],
    activitiesRes.data ?? [],
    pdfsRes.data ?? [],
    eventsSummary
  );
}

export async function getServicioAitById(
  id: string
): Promise<FirebaseServicioAitDoc | null> {
  const { data, error } = await supabase
    .from("servicios_ait")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return enrichServicio(data);
}

export async function getServiciosAitByProject(
  projectId: string
): Promise<FirebaseServicioAitDoc[]> {
  const { data, error } = await supabase
    .from("servicios_ait")
    .select("*")
    .eq("project_id", projectId);
  if (error) throw error;
  return Promise.all((data ?? []).map(enrichServicio));
}

export async function createServicioAit(
  doc: FirebaseServicioAitDoc
): Promise<void> {
  const row = firebaseToServicioAit(doc);
  const activitiesData = (doc.activitiesData as Record<string, unknown>[]) ?? [];
  const pdfFile = (doc.pdfFile as Record<string, unknown>[]) ?? [];

  const { error } = await supabase.from("servicios_ait").insert(row);
  if (error) throw error;

  if (activitiesData.length > 0) {
    const activities = activitiesData.map((a) =>
      firebaseToActivity(a, String(doc.idServiciosAIT))
    );
    await supabase.from("activities").insert(activities);
  }

  if (pdfFile.length > 0) {
    const pdfs = pdfFile.map((p) =>
      firebaseToPdf(p, String(doc.idServiciosAIT))
    );
    await supabase.from("service_pdfs").insert(pdfs);
  }
}

export async function updateServicioAit(
  id: string,
  updates: Partial<FirebaseServicioAitDoc>
): Promise<void> {
  const row = partialFirebaseToServicioAit(updates);
  if (Object.keys(row).length > 0) {
    const { error } = await supabase.from("servicios_ait").update(row).eq("id", id);
    if (error) throw error;
  }

  if (updates.activitiesData) {
    await updateServicioActivities(
      id,
      updates.activitiesData as Record<string, unknown>[]
    );
  }
}

export async function upsertServicioAit(doc: FirebaseServicioAitDoc): Promise<void> {
  const id = String(doc.idServiciosAIT);
  const { data } = await supabase
    .from("servicios_ait")
    .select("id")
    .eq("id", id)
    .maybeSingle();
  if (data) {
    await updateServicioAit(id, doc);
  } else {
    await createServicioAit(doc);
  }
}

export async function addPdfToServicio(
  servicioAitId: string,
  pdfDoc: Record<string, unknown>
): Promise<void> {
  const row = firebaseToPdf(pdfDoc, servicioAitId);
  const { error } = await supabase.from("service_pdfs").insert(row);
  if (error) throw error;
}

export async function removePdfFromServicio(
  servicioAitId: string,
  pdfUrl: string
): Promise<void> {
  const { error } = await supabase
    .from("service_pdfs")
    .delete()
    .eq("servicio_ait_id", servicioAitId)
    .eq("pdf_url", pdfUrl);
  if (error) throw error;
}

export async function getServicioActivities(
  servicioAitId: string
): Promise<Record<string, unknown>[]> {
  const { data, error } = await supabase
    .from("activities")
    .select("*")
    .eq("servicio_ait_id", servicioAitId);
  if (error) throw error;
  return (data ?? []).map(activityToFirebase);
}

export async function getServicioPdfs(
  servicioAitId: string
): Promise<Record<string, unknown>[]> {
  const { data, error } = await supabase
    .from("service_pdfs")
    .select("*")
    .eq("servicio_ait_id", servicioAitId);
  if (error) throw error;
  return (data ?? []).map(pdfToFirebase);
}

export async function getServiciosAitByDateRange(
  start: Date,
  end: Date
): Promise<FirebaseServicioAitDoc[]> {
  const { data, error } = await supabase
    .from("servicios_ait")
    .select("*")
    .gte("created_at", start.toISOString())
    .lte("created_at", end.toISOString());
  if (error) throw error;
  return Promise.all((data ?? []).map(enrichServicio));
}

export function subscribeServiceActivitiesByServicio(
  servicioAitId: string,
  onData: (activities: Record<string, unknown>[]) => void,
  onError?: (error: Error) => void
) {
  const load = async () => {
    try {
      const activities = await getServicioActivities(servicioAitId);
      onData(activities);
    } catch (e) {
      onError?.(e as Error);
    }
  };

  load();

  const channel = supabase
    .channel(uniqueRealtimeChannel(`activities:${servicioAitId}`))
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "activities",
        filter: `servicio_ait_id=eq.${servicioAitId}`,
      },
      () => load()
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

export function subscribeServicePdfsByServicio(
  servicioAitId: string,
  onData: (pdfs: Record<string, unknown>[]) => void,
  onError?: (error: Error) => void
) {
  const load = async () => {
    try {
      const pdfs = await getServicioPdfs(servicioAitId);
      onData(pdfs);
    } catch (e) {
      onError?.(e as Error);
    }
  };

  load();

  const channel = supabase
    .channel(uniqueRealtimeChannel(`service_pdfs:${servicioAitId}`))
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "service_pdfs",
        filter: `servicio_ait_id=eq.${servicioAitId}`,
      },
      () => load()
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

export function subscribeServicioAitById(
  servicioAitId: string,
  onData: (data: FirebaseServicioAitDoc | null) => void,
  onError?: (error: Error) => void
) {
  const load = async () => {
    try {
      const data = await getServicioAitById(servicioAitId);
      onData(data);
    } catch (e) {
      onError?.(e as Error);
    }
  };

  load();

  const channel = supabase
    .channel(uniqueRealtimeChannel(`servicio_ait:${servicioAitId}`))
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "servicios_ait",
        filter: `id=eq.${servicioAitId}`,
      },
      () => load()
    )
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "activities",
        filter: `servicio_ait_id=eq.${servicioAitId}`,
      },
      () => load()
    )
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "events",
        filter: `servicio_ait_id=eq.${servicioAitId}`,
      },
      () => load()
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

export function subscribeServiciosAitByProject(
  projectId: string,
  onData: (data: FirebaseServicioAitDoc[]) => void,
  onError?: (error: Error) => void
) {
  let servicioIds = new Set<string>();
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;

  const load = async () => {
    try {
      const data = await getServiciosAitByProject(projectId);
      servicioIds = new Set(data.map((d) => String(d.idServiciosAIT)));
      onData(data);
    } catch (e) {
      onError?.(e as Error);
    }
  };

  const scheduleLoad = () => {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      debounceTimer = null;
      load();
    }, 300);
  };

  load();

  const channel = supabase
    .channel(uniqueRealtimeChannel(`servicios_ait:${projectId}`))
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "servicios_ait",
        filter: `project_id=eq.${projectId}`,
      },
      () => load()
    )
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "activities",
      },
      (payload) => {
        const record = (payload.new ?? payload.old) as {
          servicio_ait_id?: string;
        } | null;
        const sid = record?.servicio_ait_id;
        if (sid && servicioIds.has(String(sid))) {
          scheduleLoad();
        }
      }
    )
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "events",
        filter: `project_id=eq.${projectId}`,
      },
      () => scheduleLoad()
    )
    .subscribe();

  return () => {
    if (debounceTimer) clearTimeout(debounceTimer);
    supabase.removeChannel(channel);
  };
}
