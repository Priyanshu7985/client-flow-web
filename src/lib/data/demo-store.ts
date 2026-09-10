import { randomUUID } from "crypto";
import type {
  Approval,
  AppNotification,
  AuthorType,
  Client,
  DeviceMode,
  Feedback,
  FeedbackReply,
  FeedbackStatus,
  Profile,
  Project,
  ProjectActivity,
  ActivityType,
  Revision,
} from "@/lib/types";
import {
  demoActivities,
  demoApprovals,
  demoClients,
  demoFeedback,
  demoNotifications,
  demoProfile,
  demoProjects,
  demoReplies,
  demoRevisions,
  DEMO_USER_ID,
} from "./sample";

/**
 * Mutable in-memory store for demo mode. State lives for the lifetime of the
 * server process (resets on restart) — documented in the README. Persisted via
 * globalThis so Next's dev HMR doesn't wipe it between recompiles.
 */

interface DemoState {
  profile: Profile;
  clients: Client[];
  projects: Project[];
  revisions: Revision[];
  feedback: Feedback[];
  replies: FeedbackReply[];
  activities: ProjectActivity[];
  approvals: Approval[];
  notifications: AppNotification[];
}

const GLOBAL_KEY = "__clientflow_demo_state__";

function seed(): DemoState {
  return {
    profile: structuredClone(demoProfile),
    clients: structuredClone(demoClients),
    projects: structuredClone(demoProjects),
    revisions: structuredClone(demoRevisions),
    feedback: structuredClone(demoFeedback),
    replies: structuredClone(demoReplies),
    activities: structuredClone(demoActivities),
    approvals: structuredClone(demoApprovals),
    notifications: structuredClone(demoNotifications),
  };
}

export function db(): DemoState {
  const g = globalThis as Record<string, unknown>;
  if (!g[GLOBAL_KEY]) g[GLOBAL_KEY] = seed();
  return g[GLOBAL_KEY] as DemoState;
}

export function resetDemoStore() {
  (globalThis as Record<string, unknown>)[GLOBAL_KEY] = seed();
}

export const DEMO_OWNER_ID = DEMO_USER_ID;

const iso = () => new Date().toISOString();

export function logActivity(
  project_id: string,
  type: ActivityType,
  actor_type: ProjectActivity["actor_type"],
  actor_name: string,
  meta: Record<string, unknown> = {},
) {
  db().activities.unshift({
    id: randomUUID(),
    project_id,
    type,
    actor_type,
    actor_name,
    meta,
    created_at: iso(),
  });
}

export function pushNotification(
  type: string,
  title: string,
  body: string | null,
  project_id: string | null,
) {
  db().notifications.unshift({
    id: randomUUID(),
    user_id: DEMO_OWNER_ID,
    type,
    title,
    body,
    project_id,
    read_at: null,
    created_at: iso(),
  });
}

export function upsertClient(name: string, email: string): Client {
  const existing = db().clients.find(
    (c) => c.email.toLowerCase() === email.toLowerCase(),
  );
  if (existing) return existing;
  const client: Client = {
    id: randomUUID(),
    owner_id: DEMO_OWNER_ID,
    name,
    email,
    company: null,
    created_at: iso(),
  };
  db().clients.push(client);
  return client;
}

export function createDemoProject(input: {
  name: string;
  client_name: string;
  client_email: string;
  website_url: string;
  description?: string;
  deadline?: string;
  thumbnail_url?: string;
}): Project {
  const client = upsertClient(input.client_name, input.client_email);
  const id = randomUUID();
  const revisionId = randomUUID();
  const project: Project = {
    id,
    owner_id: DEMO_OWNER_ID,
    client_id: client.id,
    name: input.name,
    description: input.description || null,
    website_url: input.website_url,
    thumbnail_url: input.thumbnail_url || null,
    review_token: `${slug(input.name)}-${randomUUID().replace(/-/g, "").slice(0, 16)}`,
    status: "in_progress",
    deadline: input.deadline || null,
    current_revision_id: revisionId,
    created_at: iso(),
    updated_at: iso(),
  };
  db().projects.unshift(project);
  db().revisions.push({
    id: revisionId,
    project_id: id,
    number: 1,
    label: "Initial design",
    notes: null,
    status: "in_review",
    feedback_count: 0,
    change_count: 0,
    created_at: iso(),
  });
  logActivity(id, "project_created", "system", "System");
  logActivity(id, "website_added", "designer", db().profile.full_name);
  logActivity(id, "client_invited", "designer", db().profile.full_name, {
    client: client.name,
  });
  return project;
}

export function createDemoFeedback(
  projectId: string,
  input: {
    page_url: string;
    device: DeviceMode;
    element_selector?: string | null;
    position_x: number;
    position_y: number;
    comment: string;
  },
  author: { type: AuthorType; name: string; id: string | null },
): Feedback {
  const project = db().projects.find((p) => p.id === projectId);
  const seq =
    db().feedback.filter((f) => f.project_id === projectId).length > 0
      ? Math.max(...db().feedback.filter((f) => f.project_id === projectId).map((f) => f.seq)) + 1
      : 1;
  const feedback: Feedback = {
    id: randomUUID(),
    project_id: projectId,
    revision_id: project?.current_revision_id ?? null,
    seq,
    author_id: author.id,
    author_type: author.type,
    author_name: author.name,
    page_url: input.page_url,
    device: input.device,
    element_selector: input.element_selector ?? null,
    position_x: input.position_x,
    position_y: input.position_y,
    comment: input.comment,
    status: "open",
    resolved_at: null,
    created_at: iso(),
    updated_at: iso(),
  };
  db().feedback.push(feedback);
  logActivity(projectId, "feedback_added", author.type, author.name, { seq });
  if (author.type === "client" && project) {
    project.status = "changes_requested";
    pushNotification(
      "feedback_added",
      `New feedback on ${project.name}`,
      `${author.name} left comment #${seq}.`,
      projectId,
    );
  }
  return feedback;
}

export function updateDemoFeedbackStatus(
  feedbackId: string,
  status: FeedbackStatus,
  actorName: string,
): Feedback | null {
  const feedback = db().feedback.find((f) => f.id === feedbackId);
  if (!feedback) return null;
  feedback.status = status;
  feedback.resolved_at = status === "resolved" ? iso() : null;
  feedback.updated_at = iso();
  logActivity(
    feedback.project_id,
    status === "resolved" ? "feedback_resolved" : "feedback_status_changed",
    "designer",
    actorName,
    { seq: feedback.seq, status },
  );
  return feedback;
}

export function createDemoReply(
  feedbackId: string,
  message: string,
  author: { type: AuthorType; name: string; id: string | null },
): FeedbackReply | null {
  const feedback = db().feedback.find((f) => f.id === feedbackId);
  if (!feedback) return null;
  const reply: FeedbackReply = {
    id: randomUUID(),
    feedback_id: feedbackId,
    author_id: author.id,
    author_type: author.type,
    author_name: author.name,
    message,
    created_at: iso(),
  };
  db().replies.push(reply);
  logActivity(feedback.project_id, "feedback_replied", author.type, author.name, {
    seq: feedback.seq,
  });
  if (author.type === "client") {
    pushNotification(
      "feedback_reply",
      `${author.name} replied`,
      `“${message.slice(0, 80)}”`,
      feedback.project_id,
    );
  }
  return reply;
}

export function createDemoRevision(
  projectId: string,
  label: string,
  notes: string | null,
): Revision | null {
  const project = db().projects.find((p) => p.id === projectId);
  if (!project) return null;
  const number =
    Math.max(0, ...db().revisions.filter((r) => r.project_id === projectId).map((r) => r.number)) + 1;
  const revision: Revision = {
    id: randomUUID(),
    project_id: projectId,
    number,
    label,
    notes,
    status: "in_review",
    feedback_count: 0,
    change_count: 0,
    created_at: iso(),
  };
  db().revisions.push(revision);
  project.current_revision_id = revision.id;
  project.status = "waiting_for_client";
  project.updated_at = iso();
  logActivity(projectId, "revision_created", "designer", db().profile.full_name, { number });
  return revision;
}

export function approveDemoProject(
  projectId: string,
  approvedByName: string,
  note: string | undefined,
  ipHash: string | null,
): Approval | null {
  const project = db().projects.find((p) => p.id === projectId);
  if (!project) return null;
  if (db().approvals.some((a) => a.project_id === projectId)) {
    return db().approvals.find((a) => a.project_id === projectId)!;
  }
  const approval: Approval = {
    id: randomUUID(),
    project_id: projectId,
    client_id: project.client_id,
    approved_by_name: approvedByName,
    approved_at: iso(),
    approval_ip_hash: ipHash,
    metadata: note ? { note } : {},
  };
  db().approvals.push(approval);
  project.status = "approved";
  project.updated_at = iso();
  logActivity(projectId, "project_approved", "client", approvedByName);
  pushNotification(
    "project_approved",
    `${project.name} approved`,
    `${approvedByName} approved the project.`,
    projectId,
  );
  return approval;
}

export function deleteDemoProject(projectId: string): boolean {
  const state = db();
  const idx = state.projects.findIndex((p) => p.id === projectId);
  if (idx === -1) return false;
  state.projects.splice(idx, 1);
  state.feedback = state.feedback.filter((f) => f.project_id !== projectId);
  state.revisions = state.revisions.filter((r) => r.project_id !== projectId);
  state.activities = state.activities.filter((a) => a.project_id !== projectId);
  state.approvals = state.approvals.filter((a) => a.project_id !== projectId);
  return true;
}

function slug(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 32);
}
