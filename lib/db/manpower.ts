import { supabase } from "@/lib/supabase";
import { manpowerToFirebase, firebaseToManpower } from "./mappers";

export async function createManpower(
  doc: Record<string, unknown>
): Promise<void> {
  const row = firebaseToManpower(doc);
  const { error } = await supabase.from("manpower").insert(row);
  if (error) throw error;
}

export async function getLatestManpower(
  limit = 10
): Promise<Record<string, unknown> | null> {
  const { data, error } = await supabase
    .from("manpower")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  if (!data || data.length === 0) return null;
  return manpowerToFirebase(data[0]);
}

export function subscribeManpower(
  onData: (data: Record<string, unknown> | null) => void,
  onError?: (error: Error) => void
) {
  const load = async () => {
    try {
      const data = await getLatestManpower();
      onData(data);
    } catch (e) {
      onError?.(e as Error);
    }
  };

  load();

  const channel = supabase
    .channel("manpower:latest")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "manpower" },
      () => load()
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
