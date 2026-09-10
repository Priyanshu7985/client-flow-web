"use client";

import { useMemo } from "react";
import { ReviewWorkspace, type ReviewHandlers } from "./review-workspace";
import {
  designerApprove,
  designerCreateFeedback,
  designerRefresh,
  designerReply,
  designerSetStatus,
} from "@/lib/review/designer-actions";
import type { Approval, FeedbackWithReplies } from "@/lib/types";

export function DesignerReview({
  projectId,
  projectName,
  websiteUrl,
  viewerName,
  shareUrl,
  initialFeedback,
  initialApproval,
}: {
  projectId: string;
  projectName: string;
  websiteUrl: string;
  viewerName: string;
  shareUrl: string;
  initialFeedback: FeedbackWithReplies[];
  initialApproval: Approval | null;
}) {
  const handlers = useMemo<ReviewHandlers>(
    () => ({
      createFeedback: (input) => designerCreateFeedback(projectId, input),
      reply: (feedbackId, message) => designerReply(projectId, feedbackId, message),
      setStatus: (feedbackId, status) => designerSetStatus(projectId, feedbackId, status),
      approve: (name, note) => designerApprove(projectId, name, note),
      refresh: () => designerRefresh(projectId),
    }),
    [projectId],
  );

  return (
    <ReviewWorkspace
      mode="designer"
      projectName={projectName}
      websiteUrl={websiteUrl}
      viewerName={viewerName}
      shareUrl={shareUrl}
      backHref={`/projects/${projectId}`}
      initialFeedback={initialFeedback}
      initialApproval={initialApproval}
      handlers={handlers}
    />
  );
}
