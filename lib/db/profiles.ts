import { supabase } from "@/lib/supabase";
import type { FirebaseUserDoc } from "./types";
import { profileToFirebase, firebaseToProfile } from "./mappers";

export async function getProfileByFirebaseUid(
  firebaseUid: string
): Promise<FirebaseUserDoc | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("firebase_uid", firebaseUid)
    .maybeSingle();
  if (error) throw error;
  return data ? profileToFirebase(data) : null;
}

export async function getAllProfiles(): Promise<FirebaseUserDoc[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("email", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(profileToFirebase);
}

export async function createProfile(
  firebaseUid: string,
  doc: FirebaseUserDoc
): Promise<FirebaseUserDoc> {
  const row = firebaseToProfile(doc, firebaseUid);
  const { data, error } = await supabase
    .from("profiles")
    .insert(row)
    .select()
    .single();
  if (error) throw error;
  return profileToFirebase(data);
}

export async function updateProfile(
  firebaseUid: string,
  doc: Partial<FirebaseUserDoc>
): Promise<void> {
  const row = firebaseToProfile(doc as FirebaseUserDoc, firebaseUid);
  delete row.firebase_uid;
  const { error } = await supabase
    .from("profiles")
    .update(row)
    .eq("firebase_uid", firebaseUid);
  if (error) throw error;
}

export async function upsertProfile(
  firebaseUid: string,
  doc: FirebaseUserDoc
): Promise<FirebaseUserDoc> {
  const existing = await getProfileByFirebaseUid(firebaseUid);
  if (existing) {
    await updateProfile(firebaseUid, doc);
    return { ...existing, ...doc, uid: firebaseUid };
  }
  return createProfile(firebaseUid, { ...doc, uid: firebaseUid });
}
