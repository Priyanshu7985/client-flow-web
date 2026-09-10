import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Approval, FeedbackWithReplies, ReviewBundle } from "@/lib/types";
import { db } from "./demo-store";
import {
  approveProject as approveProjectMutation,
  createFeedback as createFeedbackMutation,
  createReply as createReplyMutation,
  type CreateFeedbackData,
} from "./mutations";

/**
 * Token-scoped access for the PUBLIC review page. A reviewer has no session, so
 * every DB operation here uses the SERVER-ONLY service-role client and is always
 * filtered by the review token first — the token, not a database id, is the
 * authorization boundary. The service key never leaves the server.
 */

async function projectByToken(
  admin: SupabaseClient,
  token: string,
): Promise<{ id: string; owner_id: string } | null> {
  const { data } = await admin
    .from("projects")
    .select("id, owner_id")
    .eq("review_token", token)
    .maybeSingle();
  return (data as { id: string; owner_id: string }) ?? null;
}

/* --------------------------------------------------------- demo-mode helpers */

function demoBundle(token: string): ReviewBundle | null {
  const state = db();
  const project = state.projects.find((p) => p.review_token === token);
  if (!project) return null;
  const feedback: FeedbackWithReplies[] = state.feedback
    .filter((f) => f.project_id === project.id)
    .sort((a, b) => a.seq - b.seq)
    .map((f) => ({
      ...f,
      replies: state.replies
        .filter((r) => r.feedback_id === f.id)
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()),
    }));
  return {
    project: {
      id: project.id,
      name: project.name,
      description: project.description,
      website_url: project.website_url,
      status: project.status,
      designer_name: state.profile.full_name,
      designer_company: state.profile.company_name,
    },
    feedback,
    approval: state.approvals.find((a) => a.project_id === project.id) ?? null,
  };
}

/* --------------------------------------------------------- public API */

export async function getReviewBundle(token: string): Promise<ReviewBundle | null> {
  if (!isSupabaseConfigured) return demoBundle(token);

  const admin = createAdminClient();
  const { data: project } = await admin
    .from("projects")
    .select("id, name, description, website_url, status, owner_id")
    .eq("review_token", token)
    .maybeSingle();
  if (!project) return null;

  const [{ data: designer }, { data: feedback }, { data: approval }] = await Promise.all([
    admin.from("profiles").select("full_name, company_name").eq("id", project.owner_id).maybeSingle(),
    admin
      .from("feedback")
      .select("*, replies:feedback_replies(*)")
      .eq("project_id", project.id)
      .order("seq", { ascending: true }),
    admin.from("approvals").select("*").eq("project_id", project.id).maybeSingle(),
  ]);

  return {
    project: {
      id: project.id,
      name: project.name,
      description: project.description,
      website_url: project.website_url,
      status: project.status,
      designer_name: designer?.full_name ?? "The design team",
      designer_company: designer?.company_name ?? null,
    },
    feedback: (feedback as FeedbackWithReplies[]) ?? [],
    approval: (approval as Approval) ?? null,
  };
}

export async function addReviewFeedback(
  token: string,
  input: CreateFeedbackData,
  authorName: string,
): Promise<FeedbackWithReplies> {
  if (!isSupabaseConfigured) {
    const projectId = db().projects.find((p) => p.review_token === token)?.id;
    if (!projectId) throw new Error("Invalid review link");
    const feedback = await createFeedbackMutation(projectId, input, {
      type: "client",
      name: authorName,
      id: null,
    });
    return { ...feedback, replies: [] };
  }

  const admin = createAdminClient();
  const project = await projectByToken(admin, token);
  if (!project) throw new Error("Invalid review link");

  const feedback = await createFeedbackMutation(
    project.id,
    input,
    { type: "client", name: authorName, id: null },
    { client: admin },
  );
  return { ...feedback, replies: [] };
}

export async function addReviewReply(
  token: string,
  feedbackId: string,
  message: string,
  authorName: string,
): Promise<void> {
  if (!isSupabaseConfigured) {
    const feedback = db().feedback.find((f) => f.id === feedbackId);
    const projectId = db().projects.find((p) => p.review_token === token)?.id;
    if (!feedback || !projectId || feedback.project_id !== projectId) throw new Error("Not found");
    await createReplyMutation(feedbackId, message, { type: "client", name: authorName, id: null });
    return;
  }

  const admin = createAdminClient();
  const project = await projectByToken(admin, token);
  if (!project) throw new Error("Invalid review link");

  const { data: parent } = await admin
    .from("feedback")
    .select("project_id")
    .eq("id", feedbackId)
    .maybeSingle();
  if (!parent || parent.project_id !== project.id) throw new Error("Not found");

  await createReplyMutation(
    feedbackId,
    message,
    { type: "client", name: authorName, id: null },
    { client: admin },
  );
}

export async function approveReviewProject(
  token: string,
  approvedByName: string,
  note: string | undefined,
  ipHash: string | null,
): Promise<Approval> {
  if (!isSupabaseConfigured) {
    const projectId = db().projects.find((p) => p.review_token === token)?.id;
    if (!projectId) throw new Error("Invalid review link");
    return approveProjectMutation(projectId, approvedByName, note, ipHash);
  }

  const admin = createAdminClient();
  const project = await projectByToken(admin, token);
  if (!project) throw new Error("Invalid review link");

  return approveProjectMutation(project.id, approvedByName, note, ipHash, { client: admin });
}
