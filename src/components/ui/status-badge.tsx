import { Badge } from "./badge";
import {
  FEEDBACK_STATUS_META,
  PROJECT_STATUS_META,
  REVISION_STATUS_META,
} from "@/lib/constants";
import type { FeedbackStatus, ProjectStatus, RevisionStatus } from "@/lib/types";

export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  const meta = PROJECT_STATUS_META[status];
  return (
    <Badge tone={meta.tone} dot>
      {meta.label}
    </Badge>
  );
}

export function FeedbackStatusBadge({ status }: { status: FeedbackStatus }) {
  const meta = FEEDBACK_STATUS_META[status];
  return (
    <Badge tone={meta.tone} dot>
      {meta.label}
    </Badge>
  );
}

export function RevisionStatusBadge({ status }: { status: RevisionStatus }) {
  const meta = REVISION_STATUS_META[status];
  return <Badge tone={meta.tone}>{meta.label}</Badge>;
}
