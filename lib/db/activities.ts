import { supabase } from "@/lib/supabase";

export async function findActivityByTitulo(
  servicioAitId: string,
  titulo: string
): Promise<{ id: string; codigo: string | null; tag_equipo: string | null } | null> {
  const normalized = titulo.trim().toLowerCase();
  if (!normalized) return null;

  const { data, error } = await supabase
    .from("activities")
    .select("id, codigo, tag_equipo, nombre_servicio")
    .eq("servicio_ait_id", servicioAitId);

  if (error || !data?.length) return null;

  const exact = data.find(
    (a) => String(a.nombre_servicio ?? "").trim().toLowerCase() === normalized
  );
  if (exact) {
    return {
      id: exact.id,
      codigo: exact.codigo,
      tag_equipo: exact.tag_equipo,
    };
  }

  const partial = data.find((a) =>
    normalized.includes(String(a.nombre_servicio ?? "").trim().toLowerCase())
  );
  if (partial) {
    return {
      id: partial.id,
      codigo: partial.codigo,
      tag_equipo: partial.tag_equipo,
    };
  }

  return null;
}
