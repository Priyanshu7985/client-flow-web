import {
  FilePlus2,
  Globe,
  UserPlus,
  Eye,
  MessageSquarePlus,
  MessageSquare,
  RefreshCw,
  CheckCircle2,
  Layers,
  ThumbsUp,
} from "lucide-react";
import { relativeTime } from "@/lib/utils/format";
import type { ActivityType, ProjectActivity } from "@/lib/types";

const META: Record<
  ActivityType,
  { icon: React.ComponentType<{ className?: string }>; label: (a: ProjectActivity) => string }
> = {
  project_created: { icon: FilePlus2, label: () => "Project created" },
  website_added: { icon: Globe, label: () => "Website added" },
  client_invited: { icon: UserPlus, label: (a) => `Client invited${a.meta.client ? ` — ${a.meta.client}` : ""}` },
  review_opened: { icon: Eye, label: () => "Client opened the review" },
  feedback_added: { icon: MessageSquarePlus, label: (a) => `Feedback #${a.meta.seq ?? ""} added` },
  feedback_replied: { icon: MessageSquare, label: (a) => `Reply on feedback #${a.meta.seq ?? ""}` },
  feedback_status_changed: {
    icon: RefreshCw,
    label: (a) => `Feedback #${a.meta.seq ?? ""} → ${String(a.meta.status ?? "").replace("_", " ")}`,
  },
  feedback_resolved: { icon: CheckCircle2, label: (a) => `Feedback #${a.meta.seq ?? ""} resolved` },
  revision_created: { icon: Layers, label: (a) => `Revision ${a.meta.number ?? ""} created` },
  project_approved: { icon: ThumbsUp, label: () => "Project approved" },
};

export function ActivityTimeline({
  activities,
  limit,
}: {
  activities: ProjectActivity[];
  limit?: number;
}) {
  const list = limit ? activities.slice(0, limit) : activities;
  if (list.length === 0) {
    return <p className="py-8 text-center text-[13px] text-muted-foreground">No activity yet.</p>;
  }
  return (
    <ol className="relative space-y-4 before:absolute before:left-[13px] before:top-1 before:h-[calc(100%-1rem)] before:w-px before:bg-border">
      {list.map((activity) => {
        const meta = META[activity.type];
        const Icon = meta?.icon ?? MessageSquare;
        return (
          <li key={activity.id} className="relative flex gap-3">
            <span className="relative z-10 flex size-[27px] shrink-0 items-center justify-center rounded-full border border-border bg-surface-raised text-muted-foreground">
              <Icon className="size-3.5" />
            </span>
            <div className="pt-1">
              <p className="text-[13px] text-foreground">{meta?.label(activity) ?? activity.type}</p>
              <p className="mt-0.5 text-[11.5px] text-subtle-foreground">
                {activity.actor_name} · {relativeTime(activity.created_at)}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
