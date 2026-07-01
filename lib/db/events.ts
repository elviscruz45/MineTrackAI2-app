import { supabase } from "@/lib/supabase";
import type { FirebaseEventDoc } from "./types";
import {
  eventToFirebase,
  firebaseToEvent,
  firebaseToComment,
  commentToFirebase,
  eventToSummary,
} from "./mappers";
import { upsertKnowledgeChunk, deleteKnowledgeChunk } from "./knowledgeEmbeddings";
import { buildEventChunk } from "@/lib/rag/chunkText";
import { uniqueRealtimeChannel } from "@/lib/utils/realtimeChannel";

async function enrichEvent(row: Record<string, unknown>): Promise<FirebaseEventDoc> {
  const id = String(row.id);
  const [likesRes, commentsRes] = await Promise.all([
    supabase.from("event_likes").select("user_email").eq("event_id", id),
    supabase.from("event_comments").select("*").eq("event_id", id).order("created_at"),
  ]);
  const likes = (likesRes.data ?? []).map((l) => l.user_email);
  const comentariosUsuarios = (commentsRes.data ?? []).map(commentToFirebase);
  return eventToFirebase(
    row as unknown as Parameters<typeof eventToFirebase>[0],
    likes,
    comentariosUsuarios
  );
}

export async function getEventsByTagEquipo(
  tagCode: string,
  limit = 100
): Promise<FirebaseEventDoc[]> {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("tag_equipo", tagCode)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return Promise.all((data ?? []).map(enrichEvent));
}

export async function getEventById(id: string): Promise<FirebaseEventDoc | null> {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return enrichEvent(data);
}

export async function getEventsByProject(
  projectId: string,
  limit = 20
): Promise<FirebaseEventDoc[]> {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return Promise.all((data ?? []).map(enrichEvent));
}

export async function getAllEvents(limit = 300): Promise<FirebaseEventDoc[]> {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return Promise.all((data ?? []).map(enrichEvent));
}

export async function getEventsByServicioAitId(
  servicioAitId: string
): Promise<FirebaseEventDoc[]> {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("servicio_ait_id", servicioAitId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return Promise.all((data ?? []).map(enrichEvent));
}

export async function getEventSummariesByServicioAitId(
  servicioAitId: string
): Promise<Record<string, unknown>[]> {
  const events = await getEventsByServicioAitId(servicioAitId);
  return events.map((e) => eventToSummary(e));
}

export async function createEvent(doc: FirebaseEventDoc): Promise<void> {
  const row = firebaseToEvent(doc);
  const { error } = await supabase.from("events").insert(row);
  if (error) throw error;

  try {
    const d = doc as Record<string, unknown>;
    const isHse =
      String(d.tipoEvento ?? "").toUpperCase().includes("HSE") ||
      Boolean(d.clasificacionHSE);
    await upsertKnowledgeChunk({
      docType: "event_post",
      sourceId: String(d.idDocFirestoreDB ?? d.id ?? d.unicoID ?? row.id),
      content: buildEventChunk(d),
      servicioAitId: String(d.AITidServicios ?? ""),
      projectId: (d.projectId as string) || null,
      tagEquipo: String(d.tag_equipo ?? d.TagEquipo ?? ""),
      activityCodigo: String(d.activity_codigo ?? d.activityCodigo ?? ""),
      fecha: String(d.createdAt ?? new Date().toISOString()),
      isHse,
      clasificacionHse: String(d.clasificacionHSE ?? ""),
      metadata: { titulo: d.titulo, etapa: d.etapa },
    });
  } catch (embedErr) {
    console.warn("Event embedding skipped:", embedErr);
  }
}

export async function updateEvent(
  id: string,
  updates: Partial<FirebaseEventDoc>
): Promise<void> {
  const row = firebaseToEvent(updates as FirebaseEventDoc);
  delete row.id;
  const { error } = await supabase.from("events").update(row).eq("id", id);
  if (error) throw error;

  try {
    const full = await getEventById(id);
    if (full) {
      const d = full as Record<string, unknown>;
      const isHse =
        String(d.tipoEvento ?? "").toUpperCase().includes("HSE") ||
        Boolean(d.clasificacionHSE);
      await upsertKnowledgeChunk({
        docType: "event_post",
        sourceId: id,
        content: buildEventChunk(d),
        servicioAitId: String(d.AITidServicios ?? ""),
        projectId: (d.projectId as string) || null,
        tagEquipo: String(d.tag_equipo ?? d.TagEquipo ?? ""),
        activityCodigo: String(d.activity_codigo ?? d.activityCodigo ?? ""),
        fecha: String(d.createdAt ?? new Date().toISOString()),
        isHse,
        clasificacionHse: String(d.clasificacionHSE ?? ""),
        metadata: { titulo: d.titulo, etapa: d.etapa },
      });
    }
  } catch (embedErr) {
    console.warn("Event embedding update skipped:", embedErr);
  }
}

export async function deleteEvent(id: string): Promise<void> {
  const { error } = await supabase.from("events").delete().eq("id", id);
  if (error) throw error;
  // DB trigger 007 also deletes embedding; explicit delete as fallback
  try {
    await deleteKnowledgeChunk("event_post", id);
  } catch {
    /* trigger handles it */
  }
}

export async function addEventLike(
  eventId: string,
  userEmail: string
): Promise<void> {
  const { error } = await supabase
    .from("event_likes")
    .upsert({ event_id: eventId, user_email: userEmail });
  if (error) throw error;
}

export async function removeEventLike(
  eventId: string,
  userEmail: string
): Promise<void> {
  const { error } = await supabase
    .from("event_likes")
    .delete()
    .eq("event_id", eventId)
    .eq("user_email", userEmail);
  if (error) throw error;
}

export async function addEventComment(
  eventId: string,
  comment: Record<string, unknown>
): Promise<void> {
  const row = firebaseToComment(comment, eventId);
  const { error } = await supabase.from("event_comments").insert(row);
  if (error) throw error;
}

export async function getEventComments(
  eventId: string
): Promise<Record<string, unknown>[]> {
  const { data, error } = await supabase
    .from("event_comments")
    .select("*")
    .eq("event_id", eventId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []).map(commentToFirebase);
}

export function subscribeEventById(
  eventId: string,
  onData: (event: FirebaseEventDoc) => void,
  onError?: (error: Error) => void
) {
  let cancelled = false;

  const load = async () => {
    try {
      const data = await getEventById(eventId);
      if (!cancelled && data) onData(data);
    } catch (e) {
      if (!cancelled) onError?.(e as Error);
    }
  };

  load();

  const channel = supabase
    .channel(uniqueRealtimeChannel(`event:${eventId}`))
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "events",
        filter: `id=eq.${eventId}`,
      },
      () => load()
    )
    .subscribe();

  return () => {
    cancelled = true;
    void supabase.removeChannel(channel);
  };
}

export function subscribeEventComments(
  eventId: string,
  onData: (comments: Record<string, unknown>[]) => void,
  onError?: (error: Error) => void
) {
  let cancelled = false;

  const load = async () => {
    try {
      const data = await getEventComments(eventId);
      if (!cancelled) onData(data);
    } catch (e) {
      if (!cancelled) onError?.(e as Error);
    }
  };

  load();

  const channel = supabase
    .channel(uniqueRealtimeChannel(`event_comments:${eventId}`))
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "event_comments",
        filter: `event_id=eq.${eventId}`,
      },
      () => load()
    )
    .subscribe();

  return () => {
    cancelled = true;
    void supabase.removeChannel(channel);
  };
}

export function subscribeAllEvents(
  onData: (data: FirebaseEventDoc[]) => void,
  onError?: (error: Error) => void,
  limit = 20
) {
  const load = async () => {
    try {
      const data = await getAllEvents(limit);
      onData(data);
    } catch (e) {
      onError?.(e as Error);
    }
  };

  load();

  const channel = supabase
    .channel("events:all")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "events" },
      () => load()
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

export function subscribeEventsByProject(
  projectId: string,
  onData: (data: FirebaseEventDoc[]) => void,
  onError?: (error: Error) => void,
  limit = 20
) {
  const load = async () => {
    try {
      const data = await getEventsByProject(projectId, limit);
      onData(data);
    } catch (e) {
      onError?.(e as Error);
    }
  };

  load();

  const channel = supabase
    .channel(`events:${projectId}`)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "events" },
      () => load()
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
