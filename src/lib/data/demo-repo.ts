import type {
  AppNotification,
  Client,
  DashboardStats,
  Feedback,
  FeedbackWithReplies,
  Profile,
  ProjectActivity,
  ProjectWithMeta,
  Revision,
} from "@/lib/types";
import { db } from "./demo-store";

/** Read-side of the demo store, shaped identically to supabase-repo. */

function withMeta(projectId?: string): ProjectWithMeta[] {
  const state = db();
  return state.projects
    .filter((p) => (projectId ? p.id === projectId : true))
    .map((project) => {
      const rows = state.feedback.filter((f) => f.project_id === project.id);
      return {
        ...project,
        client: state.clients.find((c) => c.id === project.client_id) ?? null,
        feedback_counts: {
          open: rows.filter((r) => r.status === "open").length,
          in_progress: rows.filter((r) => r.status === "in_progress").length,
          resolved: rows.filter((r) => r.status === "resolved").length,
          total: rows.length,
        },
        approval: state.approvals.find((a) => a.project_id === project.id) ?? null,
      };
    });
}

export async function getProfile(): Promise<Profile | null> {
  return db().profile;
}

export async function listProjects(): Promise<ProjectWithMeta[]> {
  return withMeta().sort(
    (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
  );
}

export async function getProject(id: string): Promise<ProjectWithMeta | null> {
  return withMeta(id)[0] ?? null;
}

export async function getFeedback(projectId: string): Promise<FeedbackWithReplies[]> {
  const state = db();
  return state.feedback
    .filter((f) => f.project_id === projectId)
    .sort((a, b) => a.seq - b.seq)
    .map((f) => ({
      ...f,
      replies: state.replies
        .filter((r) => r.feedback_id === f.id)
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()),
    }));
}

export async function getActivities(projectId: string): Promise<ProjectActivity[]> {
  return db()
    .activities.filter((a) => a.project_id === projectId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export async function getRevisions(projectId: string): Promise<Revision[]> {
  return db()
    .revisions.filter((r) => r.project_id === projectId)
    .sort((a, b) => b.number - a.number);
}

export async function getClients(): Promise<Client[]> {
  return [...db().clients].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
}

export async function getNotifications(): Promise<AppNotification[]> {
  return [...db().notifications].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const projects = await listProjects();
  return {
    total_projects: projects.length,
    active_projects: projects.filter(
      (p) => p.status === "in_progress" || p.status === "changes_requested",
    ).length,
    pending_approval: projects.filter((p) => p.status === "waiting_for_client").length,
    approved_projects: projects.filter((p) => p.status === "approved").length,
  };
}

export async function getRecentFeedback(limit = 6): Promise<Feedback[]> {
  return [...db().feedback]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, limit);
}

export async function getRecentActivity(limit = 12): Promise<ProjectActivity[]> {
  return [...db().activities]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, limit);
}
