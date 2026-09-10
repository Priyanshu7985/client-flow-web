"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, CircleDot, ExternalLink, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils/cn";
import { relativeTime } from "@/lib/utils/format";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs } from "@/components/ui/tabs";
import { EmptyState } from "@/components/ui/empty-state";
import { FeedbackStatusBadge } from "@/components/ui/status-badge";
import { ReplyThread } from "@/components/review/reply-thread";
import {
  designerReply,
  designerSetStatus,
} from "@/lib/review/designer-actions";
import type { FeedbackStatus, FeedbackWithReplies } from "@/lib/types";

type Filter = "all" | FeedbackStatus;

export function FeedbackManager({
  projectId,
  initialFeedback,
  reviewHref,
}: {
  projectId: string;
  initialFeedback: FeedbackWithReplies[];
  reviewHref: string;
}) {
  const [feedback, setFeedback] = useState(initialFeedback);
  const [filter, setFilter] = useState<Filter>("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  const counts = useMemo(
    () => ({
      all: feedback.length,
      open: feedback.filter((f) => f.status === "open").length,
      in_progress: feedback.filter((f) => f.status === "in_progress").length,
      resolved: feedback.filter((f) => f.status === "resolved").length,
    }),
    [feedback],
  );

  const list = feedback
    .filter((f) => (filter === "all" ? true : f.status === filter))
    .sort((a, b) => a.seq - b.seq);

  const setStatus = async (id: string, status: FeedbackStatus) => {
    const prev = feedback;
    setFeedback((l) =>
      l.map((f) => (f.id === id ? { ...f, status, resolved_at: status === "resolved" ? new Date().toISOString() : null } : f)),
    );
    try {
      await designerSetStatus(projectId, id, status);
      if (status === "resolved") toast.success("Feedback resolved");
    } catch {
      setFeedback(prev);
      toast.error("Could not update status");
    }
  };

  const reply = async (id: string, message: string) => {
    setFeedback((l) =>
      l.map((f) =>
        f.id === id
          ? {
              ...f,
              replies: [
                ...f.replies,
                {
                  id: `temp-${Date.now()}`,
                  feedback_id: id,
                  author_id: null,
                  author_type: "designer" as const,
                  author_name: "You",
                  message,
                  created_at: new Date().toISOString(),
                },
              ],
            }
          : f,
      ),
    );
    await designerReply(projectId, id, message);
  };

  if (feedback.length === 0) {
    return (
      <EmptyState
        icon={CircleDot}
        title="No feedback yet"
        description="Open the review interface and share the client link to start collecting feedback."
        action={
          <Button asChild>
            <a href={reviewHref}>Open review</a>
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      <Tabs
        value={filter}
        onChange={setFilter}
        items={[
          { value: "all", label: "All", count: counts.all },
          { value: "open", label: "Open", count: counts.open },
          { value: "in_progress", label: "In Progress", count: counts.in_progress },
          { value: "resolved", label: "Resolved", count: counts.resolved },
        ]}
      />

      <div className="space-y-2.5">
        {list.map((f) => (
          <motion.div
            key={f.id}
            layout
            className={cn(
              "rounded-[12px] border bg-surface-raised p-4",
              f.status === "resolved" ? "border-border opacity-80" : "border-border",
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <span
                  className="flex size-5 items-center justify-center rounded-full text-[10px] font-bold text-white"
                  style={{
                    background:
                      f.status === "resolved"
                        ? "var(--status-resolved)"
                        : f.status === "in_progress"
                          ? "var(--status-progress)"
                          : "var(--status-open)",
                  }}
                >
                  {f.seq}
                </span>
                <span className="text-[11.5px] capitalize text-subtle-foreground">{f.device}</span>
              </div>
              <FeedbackStatusBadge status={f.status} />
            </div>

            <p className="mt-2 whitespace-pre-wrap text-[13.5px] leading-relaxed text-foreground">
              {f.comment}
            </p>

            <div className="mt-2 flex items-center gap-1.5 text-[11.5px] text-muted-foreground">
              <Avatar name={f.author_name} size="xs" />
              {f.author_name} · {relativeTime(f.created_at)}
              <a
                href={`${reviewHref}?focus=${f.id}`}
                className="ml-1 inline-flex items-center gap-0.5 text-accent hover:underline"
              >
                view on page <ExternalLink className="size-2.5" />
              </a>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setExpanded(expanded === f.id ? null : f.id)}
              >
                {f.replies.length > 0 ? `${f.replies.length} replies` : "Reply"}
              </Button>
              {f.status === "open" && (
                <Button variant="ghost" size="sm" onClick={() => setStatus(f.id, "in_progress")}>
                  <CircleDot className="size-3.5" /> Start
                </Button>
              )}
              {f.status !== "resolved" ? (
                <Button variant="ghost" size="sm" onClick={() => setStatus(f.id, "resolved")}>
                  <CheckCircle2 className="size-3.5 text-status-resolved" /> Resolve
                </Button>
              ) : (
                <Button variant="ghost" size="sm" onClick={() => setStatus(f.id, "open")}>
                  <RotateCcw className="size-3.5" /> Reopen
                </Button>
              )}
            </div>

            {expanded === f.id && (
              <ReplyThread replies={f.replies} onReply={(msg) => reply(f.id, msg)} />
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
