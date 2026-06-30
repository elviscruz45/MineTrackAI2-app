import { supabase } from "@/lib/supabase";

export async function getDelayedActivities(limit = 20) {
  const { data, error } = await supabase
    .from("v_delayed_activities")
    .select("*")
    .order("dias_atraso", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

export async function getHseEventsByDate(date?: Date, limit = 50) {
  const d = date ?? new Date();
  const start = new Date(d);
  start.setHours(0, 0, 0, 0);
  const end = new Date(d);
  end.setHours(23, 59, 59, 999);

  const { data, error } = await supabase
    .from("v_hse_events_daily")
    .select("*")
    .gte("fecha", start.toISOString())
    .lte("fecha", end.toISOString())
    .order("fecha", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

export async function getEquipmentHistory(
  tagCode: string,
  limit = 30
) {
  const { data, error } = await supabase
    .from("v_equipment_history")
    .select("*")
    .eq("tag_code", tagCode)
    .order("fecha", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

export async function getEquipmentHistoryByProject(
  tagCode: string,
  projectId: string,
  limit = 30
) {
  const { data, error } = await supabase
    .from("v_equipment_history")
    .select("*")
    .eq("tag_code", tagCode)
    .eq("project_id", projectId)
    .order("fecha", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

/** Extract intent hints from natural language question */
export function parseQuestionIntent(question: string) {
  const q = question.toLowerCase();
  const tagMatch = question.match(
    /\b([A-Z0-9]+-[A-Z0-9]+|\d{3}-[A-Z]{2}\d{3})\b/i
  );
  const isHse =
    q.includes("seguridad") ||
    q.includes("hse") ||
    q.includes("near miss") ||
    q.includes("lti");
  const isDelayed =
    q.includes("atrasad") ||
    q.includes("retras") ||
    q.includes("pendiente") ||
    q.includes("crítica") ||
    q.includes("critica");
  const isToday =
    q.includes("hoy") ||
    q.includes("este día") ||
    q.includes("este dia") ||
    q.includes("del día") ||
    q.includes("del dia");
  const isEquipmentHistory =
    q.includes("trabajo") ||
    q.includes("historial") ||
    q.includes("intervencion") ||
    q.includes("mantenimiento") ||
    q.includes("chancadora") ||
    q.includes("molino") ||
    q.includes("equipo");

  return {
    tagEquipo: tagMatch?.[1]?.toUpperCase() ?? null,
    isHse,
    isDelayed,
    isToday,
    isEquipmentHistory,
  };
}

export function formatDelayedActivitiesForAnswer(
  rows: Record<string, unknown>[]
): string {
  if (!rows.length) return "No hay actividades atrasadas registradas.";
  return rows
    .slice(0, 15)
    .map(
      (r, i) =>
        `${i + 1}. [${r.activity_codigo}] ${r.nombre_servicio} — Tag: ${r.tag_equipo ?? "N/A"} — ${r.dias_atraso} días de atraso — Proyecto: ${r.project_name ?? "N/A"} — Servicio: ${r.servicio_nombre ?? ""}`
    )
    .join("\n");
}

export function formatHseEventsForAnswer(
  rows: Record<string, unknown>[]
): string {
  if (!rows.length) return "No hay eventos de seguridad registrados para esa fecha.";
  return rows
    .map(
      (r, i) =>
        `${i + 1}. [${r.clasificacion_hse || r.tipo_evento || "HSE"}] ${r.titulo ?? r.descripcion} — ${r.servicio_nombre ?? ""} — Tag: ${r.tag_equipo ?? "N/A"} — ${new Date(String(r.fecha)).toLocaleString("es-PE")}`
    )
    .join("\n");
}

export function formatEquipmentHistoryForAnswer(
  rows: Record<string, unknown>[],
  tag: string
): string {
  if (!rows.length)
    return `No hay registros de trabajos para el equipo ${tag}.`;
  return rows
    .map(
      (r, i) =>
        `${i + 1}. [${r.source}] ${r.titulo ?? r.descripcion} — ${new Date(String(r.fecha)).toLocaleDateString("es-PE")} — ${r.autor ?? ""} — Proyecto: ${r.project_name ?? "N/A"}`
    )
    .join("\n");
}
