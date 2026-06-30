import { supabase } from "@/lib/supabase";
import type { EquipmentTagRow } from "./types";
import {
  tagEquipoListFallback,
  findTagEquipoByKey,
  getTagEquipoNombre,
} from "@/utils/tagEquipoList";

export async function getAllEquipmentTags(): Promise<EquipmentTagRow[]> {
  const { data, error } = await supabase
    .from("equipment_tags")
    .select("*")
    .eq("activo", true)
    .order("tag_code");
  if (error) throw error;
  if (data && data.length > 0) return data as EquipmentTagRow[];
  return tagEquipoListFallback.map((e) => ({
    id: e.key,
    tag_code: e.key,
    nombre: getTagEquipoNombre(e),
    area: e.area,
    activo: true,
    metadata: {},
    created_at: new Date().toISOString(),
  }));
}

export async function getEquipmentTagByCode(
  tagCode: string
): Promise<EquipmentTagRow | null> {
  const { data, error } = await supabase
    .from("equipment_tags")
    .select("*")
    .eq("tag_code", tagCode)
    .maybeSingle();
  if (error) throw error;
  if (data) return data as EquipmentTagRow;
  const found = findTagEquipoByKey(tagCode);
  if (!found) return null;
  return {
    id: found.key,
    tag_code: found.key,
    nombre: getTagEquipoNombre(found),
    area: found.area,
    activo: true,
    metadata: {},
    created_at: new Date().toISOString(),
  };
}

export async function searchEquipmentTags(query: string): Promise<EquipmentTagRow[]> {
  const all = await getAllEquipmentTags();
  const q = query.toLowerCase().trim();
  if (!q) return all;
  return all.filter(
    (t) =>
      t.tag_code.toLowerCase().includes(q) ||
      (t.nombre || "").toLowerCase().includes(q)
  );
}

export async function getTagActivityCounts(
  days = 30
): Promise<Record<string, number>> {
  const since = new Date();
  since.setDate(since.getDate() - days);
  const { data, error } = await supabase
    .from("maintenance_logs")
    .select("tag_code")
    .gte("fecha", since.toISOString());
  if (error) return {};
  const counts: Record<string, number> = {};
  (data ?? []).forEach((r: { tag_code: string }) => {
    counts[r.tag_code] = (counts[r.tag_code] || 0) + 1;
  });
  return counts;
}
