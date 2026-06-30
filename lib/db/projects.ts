import { supabase } from "@/lib/supabase";
import type { FirebaseProjectDoc } from "./types";
import { projectToFirebase, firebaseToProject } from "./mappers";

export async function getAllProjects(): Promise<FirebaseProjectDoc[]> {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(projectToFirebase);
}

export async function createProject(input: {
  projectName: string;
  projectType: string;
}): Promise<FirebaseProjectDoc> {
  const row = firebaseToProject(input);
  const { data, error } = await supabase
    .from("projects")
    .insert(row)
    .select()
    .single();
  if (error) throw error;
  return projectToFirebase(data);
}

export async function deleteProject(id: string): Promise<void> {
  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) throw error;
}

export async function updateProjectId(
  id: string,
  updates: Partial<{ projectName: string; projectType: string }>
): Promise<void> {
  const row: Record<string, string> = {};
  if (updates.projectName !== undefined) row.project_name = updates.projectName;
  if (updates.projectType !== undefined) row.project_type = updates.projectType;
  const { error } = await supabase.from("projects").update(row).eq("id", id);
  if (error) throw error;
}
