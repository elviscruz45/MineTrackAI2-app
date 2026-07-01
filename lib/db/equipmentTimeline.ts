import { supabase } from "@/lib/supabase";
import type { EquipmentTimelineEntry, TimelineFilters } from "./types";

export interface EquipmentDetailEntry extends EquipmentTimelineEntry {
  comentarios?: string | null;
  causa?: string | null;
  tipo_evento?: string | null;
  clasificacion_hse?: string | null;
  numero_ot?: string | null;
  parada_equipo_horas?: number | null;
  aprobacion_estado?: string | null;
  tipo_evento_hse?: string | null;
  horas_perdidas_hse?: number | null;
  event_origin?: string | null;
  etapa?: string | null;
}

export interface EquipmentManagementSummary {
  totalIntervenciones: number;
  totalParadas: number;
  totalMantenimiento: number;
  horasAcumuladas: number;
  preventivo: number;
  correctivo: number;
  planta: number;
  contratista: number;
  ultimaFecha: string | null;
  ultimoEstado: string | null;
  ultimaParada: string | null;
  ultimoMantenimiento: string | null;
  diasDesdeUltima: number | null;
  actividad30d: number;
}

export async function getEquipmentDetailTimeline(
  tagCode: string,
  filters?: TimelineFilters,
  limit = 100,
): Promise<EquipmentDetailEntry[]> {
  const entries: EquipmentDetailEntry[] = [];

  if (!filters?.source || filters.source === "parada") {
    const { data: events } = await supabase
      .from("events")
      .select(
        "id, tag_equipo, created_at, titulo, comentarios, nombre_perfil, email_perfil, foto_principal, new_images, etapa, total_hh, project_id, servicio_ait_id, causa, tipo_evento, clasificacion_hse, event_origin",
      )
      .eq("tag_equipo", tagCode)
      .order("created_at", { ascending: false })
      .limit(limit);

    (events ?? []).forEach((e) => {
      entries.push({
        tag_code: tagCode,
        fecha: e.created_at,
        source: "parada",
        record_id: e.id,
        titulo: e.titulo,
        descripcion: e.comentarios,
        comentarios: e.comentarios,
        personnel_type: null,
        autor: e.nombre_perfil,
        autor_email: e.email_perfil,
        detalle_extra: e.etapa,
        foto_url:
          e.foto_principal ||
          ((e.new_images as string[] | null)?.find(Boolean) ?? null),
        tipo_mantenimiento: e.etapa,
        estado_equipo: null,
        horas: e.total_hh,
        project_id: e.project_id,
        servicio_ait_id: e.servicio_ait_id,
        causa: e.causa,
        tipo_evento: e.tipo_evento,
        clasificacion_hse: e.clasificacion_hse,
        event_origin: e.event_origin,
        etapa: e.etapa,
      });
    });
  }

  if (!filters?.source || filters.source === "mantenimiento") {
    const { data: logs } = await supabase
      .from("maintenance_logs")
      .select("*")
      .eq("tag_code", tagCode)
      .order("fecha", { ascending: false })
      .limit(limit);

    (logs ?? []).forEach((l) => {
      if (filters?.personnelType && l.personnel_type !== filters.personnelType) {
        return;
      }
      entries.push({
        tag_code: tagCode,
        fecha: l.fecha,
        source: "mantenimiento",
        record_id: l.id,
        titulo: l.descripcion,
        descripcion: l.descripcion,
        comentarios: l.descripcion,
        personnel_type: l.personnel_type,
        autor: l.nombre_perfil,
        autor_email: l.email_perfil,
        detalle_extra: l.numero_ot,
        foto_url: l.foto_url,
        tipo_mantenimiento: l.tipo_mantenimiento,
        estado_equipo: l.estado_equipo,
        horas: l.horas,
        project_id: l.project_id,
        servicio_ait_id: l.servicio_ait_id,
        numero_ot: l.numero_ot,
        parada_equipo_horas: l.parada_equipo_horas,
        aprobacion_estado: l.aprobacion_estado,
        causa: l.causa,
        tipo_evento_hse: l.tipo_evento_hse,
        clasificacion_hse: l.clasificacion_hse,
        horas_perdidas_hse: l.horas_perdidas_hse,
      });
    });
  }

  return entries
    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
    .slice(0, limit);
}

export async function getEquipmentManagementSummary(
  tagCode: string,
): Promise<EquipmentManagementSummary> {
  const timeline = await getEquipmentDetailTimeline(tagCode, undefined, 500);
  const base = await getTimelineSummary(tagCode);
  const maintenance = timeline.filter((t) => t.source === "mantenimiento");
  const paradas = timeline.filter((t) => t.source === "parada");

  const ultimaParada = paradas[0]?.fecha ?? null;
  const ultimoMantenimiento = maintenance[0]?.fecha ?? null;

  const now = Date.now();
  const ultimaFecha = base.ultimaFecha;
  const diasDesdeUltima =
    ultimaFecha != null
      ? Math.floor((now - new Date(ultimaFecha).getTime()) / 86400000)
      : null;

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const actividad30d = timeline.filter(
    (t) => new Date(t.fecha).getTime() >= thirtyDaysAgo.getTime(),
  ).length;

  return {
    ...base,
    ultimaParada,
    ultimoMantenimiento,
    diasDesdeUltima,
    actividad30d,
  };
}

export async function getTimelineByTag(
  tagCode: string,
  filters?: TimelineFilters,
  limit = 100
): Promise<EquipmentTimelineEntry[]> {
  let query = supabase
    .from("equipment_timeline")
    .select("*")
    .eq("tag_code", tagCode)
    .order("fecha", { ascending: false })
    .limit(limit);

  if (filters?.source) {
    query = query.eq("source", filters.source);
  }
  if (filters?.personnelType) {
    query = query.eq("personnel_type", filters.personnelType);
  }
  if (filters?.startDate) {
    query = query.gte("fecha", filters.startDate);
  }
  if (filters?.endDate) {
    query = query.lte("fecha", filters.endDate);
  }

  const { data, error } = await query;
  if (error) {
    return buildTimelineFallback(tagCode, filters, limit);
  }
  return (data ?? []) as EquipmentTimelineEntry[];
}

async function buildTimelineFallback(
  tagCode: string,
  filters?: TimelineFilters,
  limit = 100
): Promise<EquipmentTimelineEntry[]> {
  const entries: EquipmentTimelineEntry[] = [];

  if (!filters?.source || filters.source === "parada") {
    const { data: events } = await supabase
      .from("events")
      .select("id, tag_equipo, created_at, titulo, comentarios, nombre_perfil, email_perfil, foto_principal, etapa, total_hh, project_id, servicio_ait_id")
      .eq("tag_equipo", tagCode)
      .order("created_at", { ascending: false })
      .limit(limit);
    (events ?? []).forEach((e) => {
      entries.push({
        tag_code: tagCode,
        fecha: e.created_at,
        source: "parada",
        record_id: e.id,
        titulo: e.titulo,
        descripcion: e.comentarios,
        personnel_type: null,
        autor: e.nombre_perfil,
        autor_email: e.email_perfil,
        detalle_extra: e.etapa,
        foto_url: e.foto_principal,
        tipo_mantenimiento: e.etapa,
        estado_equipo: null,
        horas: e.total_hh,
        project_id: e.project_id,
        servicio_ait_id: e.servicio_ait_id,
      });
    });
  }

  if (!filters?.source || filters.source === "mantenimiento") {
    const { data: logs } = await supabase
      .from("maintenance_logs")
      .select("*")
      .eq("tag_code", tagCode)
      .order("fecha", { ascending: false })
      .limit(limit);
    (logs ?? []).forEach((l) => {
      if (filters?.personnelType && l.personnel_type !== filters.personnelType) return;
      entries.push({
        tag_code: tagCode,
        fecha: l.fecha,
        source: "mantenimiento",
        record_id: l.id,
        titulo: l.descripcion,
        descripcion: l.descripcion,
        personnel_type: l.personnel_type,
        autor: l.nombre_perfil,
        autor_email: l.email_perfil,
        detalle_extra: l.numero_ot,
        foto_url: l.foto_url,
        tipo_mantenimiento: l.tipo_mantenimiento,
        estado_equipo: l.estado_equipo,
        horas: l.horas,
        project_id: l.project_id,
        servicio_ait_id: l.servicio_ait_id,
      });
    });
  }

  return entries
    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
    .slice(0, limit);
}

export async function getTimelineSummary(tagCode: string) {
  const timeline = await getTimelineByTag(tagCode, undefined, 500);
  const maintenance = timeline.filter((t) => t.source === "mantenimiento");
  const paradas = timeline.filter((t) => t.source === "parada");

  const horasTotal = timeline.reduce((s, t) => s + (Number(t.horas) || 0), 0);
  const preventivo = maintenance.filter(
    (m) => m.tipo_mantenimiento === "preventivo"
  ).length;
  const correctivo = maintenance.filter(
    (m) => m.tipo_mantenimiento === "correctivo"
  ).length;
  const planta = maintenance.filter((m) => m.personnel_type === "planta").length;
  const contratista = maintenance.filter(
    (m) => m.personnel_type === "contratista"
  ).length;

  const lastEntry = timeline[0];
  const lastEstado = maintenance.find((m) => m.estado_equipo)?.estado_equipo;

  return {
    totalIntervenciones: timeline.length,
    totalParadas: paradas.length,
    totalMantenimiento: maintenance.length,
    horasAcumuladas: horasTotal,
    preventivo,
    correctivo,
    planta,
    contratista,
    ultimaFecha: lastEntry?.fecha ?? null,
    ultimoEstado: lastEstado ?? null,
  };
}

export async function getEquipmentHealthStatus(): Promise<
  { tag_code: string; estado_equipo: string; fecha: string }[]
> {
  const { data, error } = await supabase
    .from("maintenance_logs")
    .select("tag_code, estado_equipo, fecha")
    .order("fecha", { ascending: false });
  if (error) return [];

  const latest: Record<string, { tag_code: string; estado_equipo: string; fecha: string }> = {};
  (data ?? []).forEach((row) => {
    if (!latest[row.tag_code]) {
      latest[row.tag_code] = row;
    }
  });
  return Object.values(latest);
}
