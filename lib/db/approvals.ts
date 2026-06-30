import { supabase } from "@/lib/supabase";
import type { FirebaseApprovalDoc } from "./types";
import { approvalToFirebase, firebaseToApproval } from "./mappers";

export async function getApprovalsByEmail(
  email: string
): Promise<FirebaseApprovalDoc[]> {
  const { data, error } = await supabase
    .from("approvals")
    .select("*")
    .contains("approval_request_sent_to", [email]);
  if (error) throw error;
  return (data ?? []).map(approvalToFirebase);
}

export async function getApprovalsByServicioAit(
  servicioAitId: string
): Promise<FirebaseApprovalDoc[]> {
  const { data, error } = await supabase
    .from("approvals")
    .select("*")
    .eq("servicio_ait_id", servicioAitId);
  if (error) throw error;
  return (data ?? []).map(approvalToFirebase);
}

export async function createApproval(doc: FirebaseApprovalDoc): Promise<void> {
  const row = firebaseToApproval(doc);
  const { error } = await supabase.from("approvals").insert(row);
  if (error) throw error;
}

export async function updateApproval(
  id: string,
  updates: Partial<FirebaseApprovalDoc>
): Promise<void> {
  const row = firebaseToApproval(updates as FirebaseApprovalDoc);
  delete row.id;
  const { error } = await supabase.from("approvals").update(row).eq("id", id);
  if (error) throw error;
}

export async function appendApprovalPerformed(
  id: string,
  email: string
): Promise<void> {
  const { data } = await supabase
    .from("approvals")
    .select("approval_performed")
    .eq("id", id)
    .single();
  const current = (data?.approval_performed as string[]) ?? [];
  if (!current.includes(email)) {
    await supabase
      .from("approvals")
      .update({ approval_performed: [...current, email] })
      .eq("id", id);
  }
}

export async function appendRejectionPerformed(
  id: string,
  email: string
): Promise<void> {
  const { data } = await supabase
    .from("approvals")
    .select("rejection_performed")
    .eq("id", id)
    .single();
  const current = (data?.rejection_performed as string[]) ?? [];
  if (!current.includes(email)) {
    await supabase
      .from("approvals")
      .update({ rejection_performed: [...current, email] })
      .eq("id", id);
  }
}

export async function deleteApproval(id: string): Promise<void> {
  const { error } = await supabase.from("approvals").delete().eq("id", id);
  if (error) throw error;
}

export function subscribeApprovalsByEmail(
  email: string,
  onData: (data: FirebaseApprovalDoc[]) => void,
  onError?: (error: Error) => void
) {
  const load = async () => {
    try {
      const data = await getApprovalsByEmail(email);
      onData(data);
    } catch (e) {
      onError?.(e as Error);
    }
  };

  load();

  const channel = supabase
    .channel(`approvals:${email}`)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "approvals" },
      () => load()
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
