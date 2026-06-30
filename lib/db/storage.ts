import { supabase } from "@/lib/supabase";

export type StorageBucket =
  | "avatars"
  | "service-avatars"
  | "event-images"
  | "pdfs"
  | "maintenance-attachments";

export async function uploadFile(
  bucket: StorageBucket,
  path: string,
  data: Blob | ArrayBuffer | Uint8Array,
  contentType?: string
): Promise<string> {
  const { error } = await supabase.storage.from(bucket).upload(path, data, {
    upsert: true,
    contentType,
  });
  if (error) throw error;
  const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path);
  return urlData.publicUrl;
}

export async function uploadBase64(
  bucket: StorageBucket,
  path: string,
  base64: string,
  contentType = "image/jpeg"
): Promise<string> {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return uploadFile(bucket, path, bytes.buffer, contentType);
}

export async function deleteFile(
  bucket: StorageBucket,
  path: string
): Promise<void> {
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) throw error;
}

export function getPublicUrl(bucket: StorageBucket, path: string): string {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

// Firebase-compatible helpers
export async function uploadAvatar(
  uid: string,
  data: Blob | ArrayBuffer | Uint8Array,
  contentType?: string
): Promise<string> {
  return uploadFile("avatars", uid, data, contentType);
}

export async function uploadServiceAvatar(
  servicioAitId: string,
  data: Blob | ArrayBuffer | Uint8Array,
  contentType?: string
): Promise<string> {
  return uploadFile("service-avatars", servicioAitId, data, contentType);
}

export async function uploadEventImage(
  timestamp: string,
  data: Blob | ArrayBuffer | Uint8Array,
  contentType?: string
): Promise<string> {
  return uploadFile("event-images", timestamp, data, contentType);
}

export async function uploadMaintenanceAttachment(
  filename: string,
  data: Blob | ArrayBuffer | Uint8Array,
  contentType?: string
): Promise<string> {
  return uploadFile("maintenance-attachments", filename, data, contentType);
}

export async function uploadPdf(
  filename: string,
  data: Blob | ArrayBuffer | Uint8Array,
  contentType = "application/pdf"
): Promise<string> {
  return uploadFile("pdfs", filename, data, contentType);
}
