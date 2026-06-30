import { supabase } from "@/lib/supabase";
import type { MaintenanceLogRow, FirebaseMaintenanceLogDoc } from "./types";
import { upsertKnowledgeChunk, deleteKnowledgeChunk } from "@/lib/db/knowledgeEmbeddings";
import { buildMaintenanceChunk } from "@/lib/rag/chunkText";
import {
  maintenanceLogToFirebase,
  firebaseToMaintenanceLog,
} from "./mappers";

export async function createMaintenanceLog(
  doc: FirebaseMaintenanceLogDoc
): Promise<void> {
  const row = firebaseToMaintenanceLog(doc);
  const { error } = await supabase.from("maintenance_logs").insert(row);
  if (error) throw error;

  try {
    const d = doc as Record<string, unknown>;
    const isHse = Boolean(
      d.clasificacionHSE || d.clasificacion_hse || d.tipoEventoHSE
    );
    await upsertKnowledgeChunk({
      docType: "maintenance_log",
      sourceId: String(d.id ?? row.id),
      content: buildMaintenanceChunk(d),
      servicioAitId: (d.servicioAitId as string) || null,
      projectId: (d.projectId as string) || null,
      tagEquipo: String(d.tag_code ?? d.TagEquipo ?? ""),
      fecha: String(d.fecha ?? new Date().toISOString()),
      isHse,
      clasificacionHse: String(d.clasificacionHSE ?? d.clasificacion_hse ?? ""),
    });
  } catch (embedErr) {
    console.warn("Maintenance log embedding skipped:", embedErr);
  }
}

export async function updateMaintenanceLog(
  id: string,
  updates: Partial<FirebaseMaintenanceLogDoc>
): Promise<void> {
  const row = firebaseToMaintenanceLog(updates as FirebaseMaintenanceLogDoc);
  delete row.id;
  const { error } = await supabase
    .from("maintenance_logs")
    .update(row)
    .eq("id", id);
  if (error) throw error;

  try {
    const { data } = await supabase
      .from("maintenance_logs")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (data) {
      const d = maintenanceLogToFirebase(data as MaintenanceLogRow) as Record<
        string,
        unknown
      >;
      const isHse = Boolean(
        d.clasificacionHSE || d.clasificacion_hse || d.tipoEventoHSE
      );
      await upsertKnowledgeChunk({
        docType: "maintenance_log",
        sourceId: id,
        content: buildMaintenanceChunk(d),
        servicioAitId: (d.servicioAitId as string) || null,
        projectId: (d.projectId as string) || null,
        tagEquipo: String(d.tag_code ?? d.TagEquipo ?? ""),
        fecha: String(d.fecha ?? new Date().toISOString()),
        isHse,
        clasificacionHse: String(d.clasificacionHSE ?? d.clasificacion_hse ?? ""),
      });
    }
  } catch (embedErr) {
    console.warn("Maintenance embedding update skipped:", embedErr);
  }
}

export async function deleteMaintenanceLog(id: string): Promise<void> {
  const { error } = await supabase.from("maintenance_logs").delete().eq("id", id);
  if (error) throw error;
  try {
    await deleteKnowledgeChunk("maintenance_log", id);
  } catch {
    /* trigger handles it */
  }
}

export async function getMaintenanceLogsByTag(
  tagCode: string,
  limit = 100
): Promise<FirebaseMaintenanceLogDoc[]> {
  const { data, error } = await supabase
    .from("maintenance_logs")
    .select("*")
    .eq("tag_code", tagCode)
    .order("fecha", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []).map((r) =>
    maintenanceLogToFirebase(r as MaintenanceLogRow)
  );
}

export async function getMaintenanceLogsByDateRange(
  start: Date,
  end: Date
): Promise<FirebaseMaintenanceLogDoc[]> {
  const { data, error } = await supabase
    .from("maintenance_logs")
    .select("*")
    .gte("fecha", start.toISOString())
    .lte("fecha", end.toISOString())
    .order("fecha", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((r) =>
    maintenanceLogToFirebase(r as MaintenanceLogRow)
  );
}

export function subscribeMaintenanceLogsByTag(
  tagCode: string,
  onData: (data: FirebaseMaintenanceLogDoc[]) => void
) {
  const load = async () => {
    const data = await getMaintenanceLogsByTag(tagCode);
    onData(data);
  };
  load();
  const channel = supabase
    .channel(`maintenance_logs:${tagCode}`)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "maintenance_logs" },
      () => load()
    )
    .subscribe();
  return () => {
    supabase.removeChannel(channel);
  };
}

export async function getRecentMaintenanceCount(days = 30): Promise<number> {
  const since = new Date();
  since.setDate(since.getDate() - days);
  const { count, error } = await supabase
    .from("maintenance_logs")
    .select("*", { count: "exact", head: true })
    .gte("fecha", since.toISOString());
  if (error) throw error;
  return count ?? 0;
}
