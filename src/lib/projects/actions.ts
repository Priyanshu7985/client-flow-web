"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  approveProjectSchema,
  createProjectSchema,
  createRevisionSchema,
  updateProjectSchema,
} from "@/lib/validation/schemas";
import {
  approveProject,
  createProject,
  createRevision,
  deleteProject,
  updateProject,
} from "@/lib/data/mutations";
import { getProfile } from "@/lib/data";

export interface FormState {
  error?: string;
  fieldErrors?: Record<string, string>;
  ok?: boolean;
}

export async function createProjectAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = createProjectSchema.safeParse({
    name: formData.get("name"),
    client_name: formData.get("client_name"),
    client_email: formData.get("client_email"),
    website_url: formData.get("website_url"),
    description: formData.get("description") ?? "",
    deadline: formData.get("deadline") ?? "",
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[String(issue.path[0])] = issue.message;
    }
    return { error: "Please fix the highlighted fields.", fieldErrors };
  }

  let projectId: string;
  try {
    const project = await createProject({
      ...parsed.data,
      description: parsed.data.description || undefined,
      deadline: parsed.data.deadline || undefined,
    });
    projectId = project.id;
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Could not create project." };
  }

  revalidatePath("/projects");
  revalidatePath("/dashboard");
  redirect(`/projects/${projectId}?created=1`);
}

export async function updateProjectAction(
  projectId: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = updateProjectSchema.safeParse({
    name: formData.get("name") ?? undefined,
    description: formData.get("description") ?? "",
    website_url: formData.get("website_url") ?? undefined,
    deadline: formData.get("deadline") ?? "",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  try {
    await updateProject(projectId, {
      name: parsed.data.name,
      description: parsed.data.description || "",
      website_url: parsed.data.website_url,
      deadline: parsed.data.deadline || undefined,
    });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Update failed." };
  }

  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/projects");
  return { ok: true };
}

export async function deleteProjectAction(projectId: string) {
  try {
    await deleteProject(projectId);
  } catch {
    redirect(`/projects/${projectId}/settings?error=delete`);
  }
  revalidatePath("/projects");
  revalidatePath("/dashboard");
  redirect("/projects?deleted=1");
}

export async function createRevisionAction(
  projectId: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = createRevisionSchema.safeParse({
    label: formData.get("label"),
    notes: formData.get("notes") ?? "",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Add a revision label" };
  }
  try {
    await createRevision(projectId, parsed.data.label, parsed.data.notes || null);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Could not create revision." };
  }
  revalidatePath(`/projects/${projectId}`);
  return { ok: true };
}

export async function approveProjectAction(
  projectId: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = approveProjectSchema.safeParse({
    approved_by_name: formData.get("approved_by_name"),
    note: formData.get("note") ?? "",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Enter your name" };
  }
  const profile = await getProfile();
  try {
    await approveProject(
      projectId,
      parsed.data.approved_by_name || profile?.full_name || "Client",
      parsed.data.note || undefined,
      null,
    );
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Could not approve project." };
  }
  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/dashboard");
  return { ok: true };
}
