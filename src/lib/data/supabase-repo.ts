import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import type {
  Approval,
  AppNotification,
  Client,
  DashboardStats,
  Feedback,
  FeedbackCounts,
  FeedbackWithReplies,
  Profile,
  Project,
  ProjectActivity,
  ProjectWithMeta,
  Revision,
} from "@/lib/types";

/**
 * Supabase-backed data access. All reads run through the request-scoped client
 * so Row Level Security scopes them to the signed-in owner. Public review-page
 * access does NOT come through here — see src/lib/data/review.ts.
 */

async function sb(): Promise<SupabaseClient> {
  return (await createClient()) as unknown as SupabaseClient;
}

export async function getProfile(): Promise<Profile | null> {
  const client = await sb();
  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user) return null;

  const { data } = await client.from("profiles").select("*").eq("id", user.id).maybeSingle();
  if (data) return data as Profile;

  // Self-heal: the on_auth_user_created trigger normally creates this row.
  const { data: created } = await client
    .from("profiles")
    .upsert(
      {
        id: user.id,
        email: user.email ?? "",
        full_name:
          (user.user_metadata?.full_name as string | undefined) ??
          user.email?.split("@")[0] ??
          "",
      },
      { onConflict: "id" },
    )
    .select("*")
    .maybeSingle();
  return (created as Profile) ?? null;
}

function countsFor(rows: Pick<Feedback, "status">[]): FeedbackCounts {
  const counts: FeedbackCounts = { open: 0, in_progress: 0, resolved: 0, total: rows.length };
  for (const row of rows) counts[row.status] += 1;
  return counts;
}

export async function listProjects(): Promise<ProjectWithMeta[]> {
  const client = await sb();
  const { data: projects } = await client
    .from("projects")
    .select("*, client:clients(*)")
    .order("updated_at", { ascending: false });
  if (!projects) return [];

  const ids = projects.map((p) => p.id as string);
  const [{ data: feedback }, { data: approvals }] = await Promise.all([
    client.from("feedback").select("project_id, status").in("project_id", ids),
    client.from("approvals").select("*").in("project_id", ids),
  ]);

  return (projects as (Project & { client: Client | null })[]).map((project) => ({
    ...project,
    feedback_counts: countsFor(
      (feedback ?? []).filter((f) => f.project_id === project.id) as Pick<Feedback, "status">[],
    ),
    approval: (approvals ?? []).find((a) => a.project_id === project.id) as Approval | null,
  }));
}

export async function getProject(id: string): Promise<ProjectWithMeta | null> {
  const client = await sb();
  const { data: project } = await client
    .from("projects")
    .select("*, client:clients(*)")
    .eq("id", id)
    .maybeSingle();
  if (!project) return null;

  const [{ data: feedback }, { data: approval }] = await Promise.all([
    client.from("feedback").select("status").eq("project_id", id),
    client.from("approvals").select("*").eq("project_id", id).maybeSingle(),
  ]);

  return {
    ...(project as Project & { client: Client | null }),
    feedback_counts: countsFor((feedback ?? []) as Pick<Feedback, "status">[]),
    approval: (approval as Approval) ?? null,
  };
}

export async function getFeedback(projectId: string): Promise<FeedbackWithReplies[]> {
  const client = await sb();
  const { data } = await client
    .from("feedback")
    .select("*, replies:feedback_replies(*)")
    .eq("project_id", projectId)
    .order("seq", { ascending: true });
  return (data as FeedbackWithReplies[]) ?? [];
}

export async function getActivities(projectId: string): Promise<ProjectActivity[]> {
  const client = await sb();
  const { data } = await client
    .from("project_activities")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });
  return (data as ProjectActivity[]) ?? [];
}

export async function getRevisions(projectId: string): Promise<Revision[]> {
  const client = await sb();
  const { data } = await client
    .from("revisions")
    .select("*")
    .eq("project_id", projectId)
    .order("number", { ascending: false });
  return (data as Revision[]) ?? [];
}

export async function getClients(): Promise<Client[]> {
  const client = await sb();
  const { data } = await client
    .from("clients")
    .select("*")
    .order("created_at", { ascending: false });
  return (data as Client[]) ?? [];
}

export async function getNotifications(): Promise<AppNotification[]> {
  const client = await sb();
  const { data } = await client
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(30);
  return (data as AppNotification[]) ?? [];
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
  const client = await sb();
  const { data } = await client
    .from("feedback")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data as Feedback[]) ?? [];
}

export async function getRecentActivity(limit = 12): Promise<ProjectActivity[]> {
  const client = await sb();
  const { data } = await client
    .from("project_activities")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data as ProjectActivity[]) ?? [];
}
