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
  const { error } = await supabase.from("servicios_ait").update(row).eq("id", id);
  if (error) throw error;

  if (updates.activitiesData) {
    await supabase.from("activities").delete().eq("servicio_ait_id", id);
    const activities = (updates.activitiesData as Record<string, unknown>[]).map(
      (a) => firebaseToActivity(a, id)
    );
    if (activities.length > 0) {
      await supabase.from("activities").insert(activities);
    }
    try {
      const { data: svc } = await supabase
        .from("servicios_ait")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      const svcFirebase = svc
        ? servicioAitToFirebase(
            svc as Parameters<typeof servicioAitToFirebase>[0],
            [],
            [],
            []
          )
        : {};
      const acts = updates.activitiesData as Record<string, unknown>[];
      await upsertKnowledgeChunk({
        docType: "service_summary",
        sourceId: id,
        content: buildServiceSummaryChunk(
          { ...svcFirebase, ...(updates as Record<string, unknown>) },
          acts
        ),
        servicioAitId: id,
        projectId: (svc?.project_id as string) || null,
        tagEquipo: String(svc?.tag_equipo ?? ""),
      });
      for (const a of acts) {
        const actKey = String(a.Codigo ?? a.codigo ?? a.NombreServicio ?? "");
        if (!actKey) continue;
        await upsertKnowledgeChunk({
          docType: "activity_plan",
          sourceId: `${id}-${actKey}`,
          content: buildActivityChunk(a, { ...svcFirebase, TagEquipo: svc?.tag_equipo }),
          servicioAitId: id,
          projectId: (svc?.project_id as string) || null,
          tagEquipo: String(a.TagEquipo ?? a.tag_equipo ?? svc?.tag_equipo ?? ""),
          activityCodigo: String(a.Codigo ?? a.codigo ?? ""),
        });
      }
    } catch (embedErr) {
      console.warn("Activity embeddings sync skipped:", embedErr);
    }
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

export function subscribeServiciosAitByProject(
  projectId: string,
  onData: (data: FirebaseServicioAitDoc[]) => void,
  onError?: (error: Error) => void
) {
  const load = async () => {
    try {
      const data = await getServiciosAitByProject(projectId);
      onData(data);
    } catch (e) {
      onError?.(e as Error);
    }
  };

  load();

  const channel = supabase
    .channel(`servicios_ait:${projectId}`)
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
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
