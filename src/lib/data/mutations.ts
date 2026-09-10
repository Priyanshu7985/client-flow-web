import "server-only";

import { randomBytes } from "crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import type {
  Approval,
  AuthorType,
  DeviceMode,
  Feedback,
  FeedbackReply,
  FeedbackStatus,
  Project,
  Revision,
} from "@/lib/types";
import {
  approveDemoProject,
  createDemoFeedback,
  createDemoReply,
  createDemoRevision,
  createDemoProject,
  deleteDemoProject,
  db,
  updateDemoFeedbackStatus,
} from "./demo-store";

/**
 * Writes. Each function takes an optional Supabase client:
 *  - omitted  -> request-scoped anon client (RLS-scoped to the signed-in owner).
 *               Used by designer server actions.
 *  - provided -> caller passes the SERVER-ONLY service-role client. Used by the
 *               public review path (src/lib/data/review.ts) after validating the
 *               review token, since a reviewer has no session.
 */

type Db = SupabaseClient;
type WriteOpts = { client?: Db };

async function writeClient(explicit?: Db): Promise<Db> {
  return explicit ?? ((await createClient()) as unknown as Db);
}

export interface CreateProjectData {
  name: string;
  client_name: string;
  client_email: string;
  website_url: string;
  description?: string;
  deadline?: string;
  thumbnail_url?: string;
}

export function reviewToken(): string {
  return randomBytes(24).toString("base64url");
}

export async function createProject(input: CreateProjectData): Promise<Project> {
  if (!isSupabaseConfigured) return createDemoProject(input);

  const client = await createClient();
  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: existingClient } = await client
    .from("clients")
    .select("id")
    .eq("owner_id", user.id)
    .ilike("email", input.client_email)
    .maybeSingle();

  let clientId = existingClient?.id as string | undefined;
  if (!clientId) {
    const { data: newClient, error } = await client
      .from("clients")
      .insert({
        owner_id: user.id,
        name: input.client_name,
        email: input.client_email,
      })
      .select("id")
      .single();
    if (error) throw error;
    clientId = newClient.id;
  }

  const { data: project, error } = await client
    .from("projects")
    .insert({
      owner_id: user.id,
      client_id: clientId,
      name: input.name,
      description: input.description || null,
      website_url: input.website_url,
      thumbnail_url: input.thumbnail_url || null,
      review_token: reviewToken(),
      status: "in_progress",
      deadline: input.deadline || null,
    })
    .select("*")
    .single();
  if (error) throw error;

  // project_created / website_added / client_invited activity is written by the
  // log_project_insert() trigger.

  const { data: revision } = await client
    .from("revisions")
    .insert({ project_id: project.id, number: 1, label: "Initial design", status: "in_review" })
    .select("id")
    .single();
  if (revision) {
    await client.from("projects").update({ current_revision_id: revision.id }).eq("id", project.id);
  }

  return project as Project;
}

export async function updateProject(
  id: string,
  patch: Partial<Pick<Project, "name" | "description" | "website_url" | "deadline" | "status">>,
): Promise<void> {
  if (!isSupabaseConfigured) {
    const project = db().projects.find((p) => p.id === id);
    if (project) Object.assign(project, patch, { updated_at: new Date().toISOString() });
    return;
  }
  const client = await createClient();
  const { error } = await client.from("projects").update(patch).eq("id", id);
  if (error) throw error;
}

export async function deleteProject(id: string): Promise<void> {
  if (!isSupabaseConfigured) {
    deleteDemoProject(id);
    return;
  }
  const client = await createClient();
  const { error } = await client.from("projects").delete().eq("id", id);
  if (error) throw error;
}

export interface CreateFeedbackData {
  page_url: string;
  device: DeviceMode;
  element_selector?: string | null;
  position_x: number;
  position_y: number;
  comment: string;
}

export async function createFeedback(
  projectId: string,
  input: CreateFeedbackData,
  author: { type: AuthorType; name: string; id: string | null },
  opts: WriteOpts = {},
): Promise<Feedback> {
  if (!isSupabaseConfigured) return createDemoFeedback(projectId, input, author);

  const client = await writeClient(opts.client);
  const { data, error } = await client
    .from("feedback")
    .insert({
      project_id: projectId,
      author_id: author.id,
      author_type: author.type,
      author_name: author.name,
      page_url: input.page_url,
      device: input.device,
      element_selector: input.element_selector ?? null,
      position_x: input.position_x,
      position_y: input.position_y,
      comment: input.comment,
    })
    .select("*")
    .single();
  if (error) throw error;
  return data as Feedback;
}

export async function updateFeedbackStatus(
  feedbackId: string,
  status: FeedbackStatus,
  actorName: string,
  opts: WriteOpts = {},
): Promise<void> {
  if (!isSupabaseConfigured) {
    updateDemoFeedbackStatus(feedbackId, status, actorName);
    return;
  }
  const client = await writeClient(opts.client);
  const { error } = await client
    .from("feedback")
    .update({ status, resolved_at: status === "resolved" ? new Date().toISOString() : null })
    .eq("id", feedbackId);
  if (error) throw error;
}

export async function createReply(
  feedbackId: string,
  message: string,
  author: { type: AuthorType; name: string; id: string | null },
  opts: WriteOpts = {},
): Promise<FeedbackReply> {
  if (!isSupabaseConfigured) {
    const reply = createDemoReply(feedbackId, message, author);
    if (!reply) throw new Error("Feedback not found");
    return reply;
  }
  const client = await writeClient(opts.client);
  const { data, error } = await client
    .from("feedback_replies")
    .insert({
      feedback_id: feedbackId,
      author_id: author.id,
      author_type: author.type,
      author_name: author.name,
      message,
    })
    .select("*")
    .single();
  if (error) throw error;
  return data as FeedbackReply;
}

export async function createRevision(
  projectId: string,
  label: string,
  notes: string | null,
): Promise<Revision> {
  if (!isSupabaseConfigured) {
    const revision = createDemoRevision(projectId, label, notes);
    if (!revision) throw new Error("Project not found");
    return revision;
  }
  const client = await createClient();
  const { data: last } = await client
    .from("revisions")
    .select("number")
    .eq("project_id", projectId)
    .order("number", { ascending: false })
    .limit(1)
    .maybeSingle();
  const number = (last?.number ?? 0) + 1;
  const { data, error } = await client
    .from("revisions")
    .insert({ project_id: projectId, number, label, notes, status: "in_review" })
    .select("*")
    .single();
  if (error) throw error;
  await client
    .from("projects")
    .update({ current_revision_id: data.id, status: "waiting_for_client" })
    .eq("id", projectId);
  return data as Revision;
}

export async function approveProject(
  projectId: string,
  approvedByName: string,
  note: string | undefined,
  ipHash: string | null,
  opts: WriteOpts = {},
): Promise<Approval> {
  if (!isSupabaseConfigured) {
    const approval = approveDemoProject(projectId, approvedByName, note, ipHash);
    if (!approval) throw new Error("Project not found");
    return approval;
  }
  const client = await writeClient(opts.client);
  const { data, error } = await client
    .from("approvals")
    .upsert(
      {
        project_id: projectId,
        approved_by_name: approvedByName,
        approval_ip_hash: ipHash,
        metadata: note ? { note } : {},
      },
      { onConflict: "project_id", ignoreDuplicates: true },
    )
    .select("*")
    .maybeSingle();
  if (error) throw error;

  // Already approved — return the existing record.
  if (!data) {
    const { data: existing } = await client
      .from("approvals")
      .select("*")
      .eq("project_id", projectId)
      .single();
    return existing as Approval;
  }

  // projects.status -> 'approved' is set by the log_approval_insert() trigger.
  return data as Approval;
}
