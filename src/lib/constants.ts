import type {
  DeviceMode,
  FeedbackStatus,
  ProjectStatus,
  RevisionStatus,
} from "@/lib/types";

export const APP_NAME = "ClientFlow";
export const APP_DESCRIPTION =
  "Collect visual website feedback, manage revisions, and get final client approval — all in one place.";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://clientflow.app";

export const DEVICE_PRESETS: Record<
  DeviceMode,
  { label: string; width: number; height: number }
> = {
  desktop: { label: "Desktop", width: 1280, height: 800 },
  tablet: { label: "Tablet", width: 834, height: 1112 },
  mobile: { label: "Mobile", width: 390, height: 844 },
};

export const PROJECT_STATUS_META: Record<
  ProjectStatus,
  { label: string; tone: StatusTone }
> = {
  draft: { label: "Draft", tone: "neutral" },
  in_progress: { label: "In Progress", tone: "progress" },
  waiting_for_client: { label: "Waiting for Client", tone: "open" },
  changes_requested: { label: "Changes Requested", tone: "open" },
  approved: { label: "Approved", tone: "approved" },
};

export const FEEDBACK_STATUS_META: Record<
  FeedbackStatus,
  { label: string; tone: StatusTone }
> = {
  open: { label: "Open", tone: "open" },
  in_progress: { label: "In Progress", tone: "progress" },
  resolved: { label: "Resolved", tone: "resolved" },
};

export const REVISION_STATUS_META: Record<
  RevisionStatus,
  { label: string; tone: StatusTone }
> = {
  draft: { label: "Draft", tone: "neutral" },
  in_review: { label: "In Review", tone: "progress" },
  changes_requested: { label: "Changes Requested", tone: "open" },
  approved: { label: "Approved", tone: "approved" },
};

export type StatusTone =
  | "neutral"
  | "open"
  | "progress"
  | "resolved"
  | "approved"
  | "danger";

export const PLANS = [
  {
    id: "free" as const,
    name: "Free",
    price: 0,
    tagline: "For your first client projects.",
    features: ["2 active projects", "Visual feedback", "Client review links", "1 revision per project"],
    cta: "Start free",
  },
  {
    id: "pro" as const,
    name: "Pro",
    price: 19,
    tagline: "For freelancers running multiple clients.",
    features: [
      "Unlimited projects",
      "Unlimited clients",
      "Full revision history",
      "Threaded feedback & replies",
      "Custom branding on review links",
    ],
    cta: "Start Pro trial",
    highlighted: true,
  },
  {
    id: "agency" as const,
    name: "Agency",
    price: 49,
    tagline: "For teams delivering at scale.",
    features: [
      "Everything in Pro",
      "Team members",
      "White-label review experience",
      "Advanced analytics",
      "Custom domain",
    ],
    cta: "Talk to us",
  },
];

export const PLAN_PROJECT_LIMITS: Record<string, number> = {
  free: 2,
  pro: Infinity,
  agency: Infinity,
};
