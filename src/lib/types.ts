/** Domain types shared across the app. Mirrors the Supabase schema in /supabase. */

export type Plan = "free" | "pro" | "agency";

export type ProjectStatus =
  | "draft"
  | "in_progress"
  | "waiting_for_client"
  | "changes_requested"
  | "approved";

export type FeedbackStatus = "open" | "in_progress" | "resolved";

export type DeviceMode = "desktop" | "tablet" | "mobile";

export type AuthorType = "designer" | "client";

export type ActivityType =
  | "project_created"
  | "website_added"
  | "client_invited"
  | "review_opened"
  | "feedback_added"
  | "feedback_replied"
  | "feedback_status_changed"
  | "feedback_resolved"
  | "revision_created"
  | "project_approved";

export type RevisionStatus = "draft" | "in_review" | "changes_requested" | "approved";

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  company_name: string | null;
  plan: Plan;
  notification_prefs: NotificationPrefs;
  created_at: string;
  updated_at: string;
}

export interface NotificationPrefs {
  email_enabled: boolean;
  on_client_approval: boolean;
  on_new_feedback: boolean;
  on_feedback_reply: boolean;
}

export interface Client {
  id: string;
  owner_id: string;
  name: string;
  email: string;
  company: string | null;
  created_at: string;
}

export interface Project {
  id: string;
  owner_id: string;
  client_id: string | null;
  name: string;
  description: string | null;
  website_url: string;
  thumbnail_url: string | null;
  review_token: string;
  status: ProjectStatus;
  deadline: string | null;
  current_revision_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectWithMeta extends Project {
  client: Client | null;
  feedback_counts: FeedbackCounts;
  approval: Approval | null;
}

export interface FeedbackCounts {
  open: number;
  in_progress: number;
  resolved: number;
  total: number;
}

export interface Revision {
  id: string;
  project_id: string;
  number: number;
  label: string;
  notes: string | null;
  status: RevisionStatus;
  feedback_count: number;
  change_count: number;
  created_at: string;
}

export interface Feedback {
  id: string;
  project_id: string;
  revision_id: string | null;
  seq: number;
  author_id: string | null;
  author_type: AuthorType;
  author_name: string;
  page_url: string;
  device: DeviceMode;
  element_selector: string | null;
  position_x: number; // 0-100 (% of frame width)
  position_y: number; // 0-100 (% of frame height)
  comment: string;
  status: FeedbackStatus;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface FeedbackWithReplies extends Feedback {
  replies: FeedbackReply[];
}

export interface FeedbackReply {
  id: string;
  feedback_id: string;
  author_id: string | null;
  author_type: AuthorType;
  author_name: string;
  message: string;
  created_at: string;
}

export interface ProjectActivity {
  id: string;
  project_id: string;
  type: ActivityType;
  actor_type: AuthorType | "system";
  actor_name: string;
  meta: Record<string, unknown>;
  created_at: string;
}

export interface Approval {
  id: string;
  project_id: string;
  client_id: string | null;
  approved_by_name: string;
  approved_at: string;
  approval_ip_hash: string | null;
  metadata: Record<string, unknown>;
}

export interface AppNotification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string | null;
  project_id: string | null;
  read_at: string | null;
  created_at: string;
}

export interface DashboardStats {
  total_projects: number;
  active_projects: number;
  pending_approval: number;
  approved_projects: number;
}

/** Shape returned to the public review page — no owner / internal fields. */
export interface ReviewBundle {
  project: {
    id: string;
    name: string;
    description: string | null;
    website_url: string;
    status: ProjectStatus;
    designer_name: string;
    designer_company: string | null;
  };
  feedback: FeedbackWithReplies[];
  approval: Approval | null;
}
