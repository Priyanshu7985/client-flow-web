"use client";

import { forwardRef, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircle2,
  ChevronDown,
  CircleDot,
  MessageSquare,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { relativeTime } from "@/lib/utils/format";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { FeedbackStatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Tabs } from "@/components/ui/tabs";
import type { DeviceMode, FeedbackStatus, FeedbackWithReplies } from "@/lib/types";
import { ReplyThread } from "./reply-thread";

type Filter = "all" | FeedbackStatus;

export function FeedbackPanel({
  feedback,
  activeId,
  device,
  mode,
  onSelect,
  onReply,
  onStatusChange,
}: {
  feedback: FeedbackWithReplies[];
  activeId: string | null;
  device: DeviceMode;
  mode: "designer" | "client";
  onSelect: (id: string | null) => void;
  onReply: (feedbackId: string, message: string) => Promise<void>;
  onStatusChange: (feedbackId: string, status: FeedbackStatus) => Promise<void>;
}) {
  const [filter, setFilter] = useState<Filter>("all");
  const [showAllDevices, setShowAllDevices] = useState(false);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const counts = useMemo(
    () => ({
      all: feedback.length,
      open: feedback.filter((f) => f.status === "open").length,
      in_progress: feedback.filter((f) => f.status === "in_progress").length,
      resolved: feedback.filter((f) => f.status === "resolved").length,
    }),
    [feedback],
  );

  const list = useMemo(
    () =>
      feedback
        .filter((f) => (showAllDevices ? true : f.device === device))
        .filter((f) => (filter === "all" ? true : f.status === filter))
        .sort((a, b) => a.seq - b.seq),
    [feedback, filter, device, showAllDevices],
  );

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border p-3">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="flex items-center gap-1.5 text-[13px] font-semibold text-foreground">
            <MessageSquare className="size-3.5 text-muted-foreground" />
            Feedback
            <span className="text-subtle-foreground">({counts.all})</span>
          </h2>
          <button
            onClick={() => setShowAllDevices((v) => !v)}
            className={cn(
              "rounded-full border px-2 py-0.5 text-[10.5px] font-medium transition-colors",
              showAllDevices
                ? "border-accent/30 bg-accent-soft text-accent-soft-foreground"
                : "border-border text-muted-foreground hover:text-foreground",
            )}
          >
            {showAllDevices ? "All devices" : `${device} only`}
          </button>
        </div>
        <Tabs
          value={filter}
          onChange={setFilter}
          className="w-full"
          items={[
            { value: "all", label: "All", count: counts.all },
            { value: "open", label: "Open", count: counts.open },
            { value: "in_progress", label: "In Progress", count: counts.in_progress },
            { value: "resolved", label: "Resolved", count: counts.resolved },
          ]}
        />
      </div>

      <div className="flex-1 space-y-2.5 overflow-y-auto p-3 scrollbar-thin">
        {list.length === 0 ? (
          <EmptyState
            icon={MessageSquare}
            title={filter === "all" ? "No feedback yet" : `No ${filter.replace("_", " ")} feedback`}
            description={
              mode === "client"
                ? "Click anywhere on the website to leave your first comment."
                : "Feedback your client leaves will appear here, pinned to the page."
            }
            className="border-0 bg-transparent py-10"
          />
        ) : (
          list.map((f) => (
            <FeedbackCard
              key={f.id}
              ref={(el) => {
                cardRefs.current[f.id] = el;
              }}
              feedback={f}
              active={activeId === f.id}
              mode={mode}
              onSelect={() => onSelect(activeId === f.id ? null : f.id)}
              onReply={(msg) => onReply(f.id, msg)}
              onStatusChange={(status) => onStatusChange(f.id, status)}
            />
          ))
        )}
      </div>
    </div>
  );
}

const FeedbackCard = forwardRef<
  HTMLDivElement,
  {
    feedback: FeedbackWithReplies;
    active: boolean;
    mode: "designer" | "client";
    onSelect: () => void;
    onReply: (message: string) => Promise<void>;
    onStatusChange: (status: FeedbackStatus) => Promise<void>;
  }
>(function FeedbackCard({ feedback: f, active, mode, onSelect, onReply, onStatusChange }, ref) {
  const [expanded, setExpanded] = useState(false);
  const [busy, setBusy] = useState(false);

  const changeStatus = async (status: FeedbackStatus) => {
    setBusy(true);
    try {
      await onStatusChange(status);
    } finally {
      setBusy(false);
    }
  };

  return (
    <motion.div
      ref={ref}
      layout
      onClick={onSelect}
      className={cn(
        "cursor-pointer rounded-[11px] border bg-surface-raised p-3 transition-colors",
        active ? "border-accent shadow-[var(--shadow-sm)]" : "border-border hover:border-border-strong",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5">
          <span
            className="flex size-4 items-center justify-center rounded-full text-[9px] font-bold text-white"
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
          <span className="text-[11px] capitalize text-subtle-foreground">{f.device}</span>
        </span>
        <FeedbackStatusBadge status={f.status} />
      </div>

      <p className="mt-2 whitespace-pre-wrap text-[13px] leading-relaxed text-foreground">
        {f.comment}
      </p>

      <div className="mt-2 flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Avatar name={f.author_name} size="xs" />
        {f.author_name} · {relativeTime(f.created_at)}
        {f.resolved_at && f.status === "resolved" && (
          <span className="text-status-resolved">· resolved {relativeTime(f.resolved_at)}</span>
        )}
      </div>

      <div className="mt-2.5 flex flex-wrap items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
        <Button variant="ghost" size="sm" onClick={() => setExpanded((v) => !v)}>
          <MessageSquare className="size-3.5" />
          {f.replies.length > 0 ? `${f.replies.length}` : "Reply"}
          <ChevronDown className={cn("size-3 transition-transform", expanded && "rotate-180")} />
        </Button>

        {mode === "designer" && f.status !== "resolved" && (
          <>
            {f.status === "open" && (
              <Button variant="ghost" size="sm" loading={busy} onClick={() => changeStatus("in_progress")}>
                <CircleDot className="size-3.5" /> Start
              </Button>
            )}
            <Button variant="ghost" size="sm" loading={busy} onClick={() => changeStatus("resolved")}>
              <CheckCircle2 className="size-3.5 text-status-resolved" /> Resolve
            </Button>
          </>
        )}
        {mode === "designer" && f.status === "resolved" && (
          <Button variant="ghost" size="sm" loading={busy} onClick={() => changeStatus("open")}>
            <RotateCcw className="size-3.5" /> Reopen
          </Button>
        )}
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <ReplyThread replies={f.replies} onReply={onReply} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});
