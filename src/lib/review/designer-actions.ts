"use server";

import { revalidatePath } from "next/cache";
import { createFeedbackSchema } from "@/lib/validation/schemas";
import {
  createFeedback,
  createReply,
  updateFeedbackStatus,
  approveProject,
} from "@/lib/data/mutations";
import { getFeedback, getProfile, getProject } from "@/lib/data";
import type {
  Approval,
  DeviceMode,
  FeedbackStatus,
  FeedbackWithReplies,
} from "@/lib/types";

async function assertOwner(projectId: string) {
  const project = await getProject(projectId);
  if (!project) throw new Error("Project not found");
  return project;
}

export async function designerCreateFeedback(
  projectId: string,
  input: { x: number; y: number; pageUrl: string; device: DeviceMode; comment: string },
): Promise<FeedbackWithReplies> {
  await assertOwner(projectId);
  const profile = await getProfile();
  const parsed = createFeedbackSchema.parse({
    page_url: input.pageUrl,
    device: input.device,
    position_x: input.x,
    position_y: input.y,
    comment: input.comment,
  });
  const created = await createFeedback(
    projectId,
    {
      page_url: parsed.page_url,
      device: parsed.device,
      position_x: parsed.position_x,
      position_y: parsed.position_y,
      comment: parsed.comment,
    },
    { type: "designer", name: profile?.full_name ?? "Designer", id: profile?.id ?? null },
  );
  revalidatePath(`/projects/${projectId}`);
  return { ...created, replies: [] };
}

export async function designerReply(projectId: string, feedbackId: string, message: string) {
  await assertOwner(projectId);
  const profile = await getProfile();
  await createReply(feedbackId, message.trim().slice(0, 2000), {
    type: "designer",
    name: profile?.full_name ?? "Designer",
    id: profile?.id ?? null,
  });
  revalidatePath(`/projects/${projectId}`);
}

export async function designerSetStatus(
  projectId: string,
  feedbackId: string,
  status: FeedbackStatus,
) {
  await assertOwner(projectId);
  const profile = await getProfile();
  await updateFeedbackStatus(feedbackId, status, profile?.full_name ?? "Designer");
  revalidatePath(`/projects/${projectId}`);
}

export async function designerApprove(
  projectId: string,
  name: string,
  note: string,
): Promise<Approval> {
  await assertOwner(projectId);
  const record = await approveProject(projectId, name, note || undefined, null);
  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/dashboard");
  return record;
}

export async function designerRefresh(projectId: string) {
  const [feedback, project] = await Promise.all([getFeedback(projectId), getProject(projectId)]);
  return { feedback, approval: project?.approval ?? null };
}
