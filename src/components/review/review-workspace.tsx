"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  ExternalLink,
  Hand,
  MousePointerClick,
  Share2,
  ThumbsUp,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils/cn";
import { hostFromUrl } from "@/lib/utils/url";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import type {
  Approval,
  DeviceMode,
  FeedbackStatus,
  FeedbackWithReplies,
} from "@/lib/types";
import { ReviewCanvas } from "./review-canvas";
import { FeedbackPanel } from "./feedback-panel";
import { DeviceSelector } from "./device-selector";
import { ZoomControls } from "./zoom-controls";
import { ApprovalModal } from "./approval-modal";

export interface ReviewHandlers {
  createFeedback: (input: {
    x: number;
    y: number;
    pageUrl: string;
    device: DeviceMode;
    comment: string;
  }) => Promise<FeedbackWithReplies>;
  reply: (feedbackId: string, message: string) => Promise<void>;
  setStatus: (feedbackId: string, status: FeedbackStatus) => Promise<void>;
  approve: (name: string, note: string) => Promise<Approval>;
  refresh?: () => Promise<{ feedback: FeedbackWithReplies[]; approval: Approval | null } | null>;
}

export function ReviewWorkspace({
  mode,
  projectName,
  websiteUrl,
  designerName,
  viewerName,
  initialFeedback,
  initialApproval,
  handlers,
  backHref,
  shareUrl,
}: {
  mode: "designer" | "client";
  projectName: string;
  websiteUrl: string;
  designerName?: string;
  viewerName: string;
  initialFeedback: FeedbackWithReplies[];
  initialApproval: Approval | null;
  handlers: ReviewHandlers;
  backHref?: string;
  shareUrl?: string;
}) {
  const [feedback, setFeedback] = useState(initialFeedback);
  const [approval, setApproval] = useState(initialApproval);
  const [device, setDevice] = useState<DeviceMode>("desktop");
  const [zoom, setZoom] = useState(0.75);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [newId, setNewId] = useState<string | null>(null);
  const [approveOpen, setApproveOpen] = useState(false);
  const [panelOpen, setPanelOpen] = useState(true);
  const [commentMode, setCommentMode] = useState(true);
  const newTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const openCount = feedback.filter((f) => f.status === "open").length;
  const approved = Boolean(approval);

  // Poll for updates (client review page has no auth socket).
  useEffect(() => {
    if (!handlers.refresh) return;
    const interval = setInterval(async () => {
      const next = await handlers.refresh!();
      if (next) {
        setFeedback(next.feedback);
        setApproval(next.approval);
      }
    }, 15000);
    return () => clearInterval(interval);
  }, [handlers]);

  const flashNew = useCallback((id: string) => {
    setNewId(id);
    if (newTimer.current) clearTimeout(newTimer.current);
    newTimer.current = setTimeout(() => setNewId(null), 2600);
  }, []);

  const handleCreate = useCallback(
    async (input: { x: number; y: number; pageUrl: string; device: DeviceMode; comment: string }) => {
      try {
        const created = await handlers.createFeedback(input);
        setFeedback((prev) => [...prev, created]);
        setActiveId(created.id);
        flashNew(created.id);
        toast.success("Feedback added");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Could not add feedback");
      }
    },
    [handlers, flashNew],
  );

  const handleReply = useCallback(
    async (feedbackId: string, message: string) => {
      const optimistic: FeedbackWithReplies["replies"][number] = {
        id: `temp-${Date.now()}`,
        feedback_id: feedbackId,
        author_id: null,
        author_type: mode === "designer" ? "designer" : "client",
        author_name: viewerName,
        message,
        created_at: new Date().toISOString(),
      };
      setFeedback((prev) =>
        prev.map((f) =>
          f.id === feedbackId ? { ...f, replies: [...f.replies, optimistic] } : f,
        ),
      );
      try {
        await handlers.reply(feedbackId, message);
        const next = await handlers.refresh?.();
        if (next) setFeedback(next.feedback);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Reply failed");
      }
    },
    [handlers, mode, viewerName],
  );

  const handleStatus = useCallback(
    async (feedbackId: string, status: FeedbackStatus) => {
      const prev = feedback;
      setFeedback((list) =>
        list.map((f) =>
          f.id === feedbackId
            ? { ...f, status, resolved_at: status === "resolved" ? new Date().toISOString() : null }
            : f,
        ),
      );
      try {
        await handlers.setStatus(feedbackId, status);
        if (status === "resolved") toast.success("Feedback resolved");
      } catch (e) {
        setFeedback(prev);
        toast.error(e instanceof Error ? e.message : "Could not update status");
      }
    },
    [handlers, feedback],
  );

  const handleApprove = useCallback(
    async (name: string, note: string) => {
      const record = await handlers.approve(name, note);
      setApproval(record);
      setApproveOpen(false);
      toast.success("Project approved 🎉");
    },
    [handlers],
  );

  const copyShare = () => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl);
    toast.success("Client link copied");
  };

  return (
    <div className="flex h-[100dvh] flex-col bg-surface-muted">
      {/* top bar */}
      <header className="z-20 flex h-14 shrink-0 items-center gap-3 border-b border-border bg-surface-raised px-3 sm:px-4">
        {mode === "designer" && backHref ? (
          <Link
            href={backHref}
            className="flex size-8 items-center justify-center rounded-[8px] text-muted-foreground hover:bg-surface-muted"
            aria-label="Back to project"
          >
            <ArrowLeft className="size-4" />
          </Link>
        ) : (
          <Logo wordmark={false} href="/" />
        )}

        <div className="min-w-0">
          <p className="truncate text-[13px] font-semibold text-foreground">{projectName}</p>
          <a
            href={websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground"
          >
            {hostFromUrl(websiteUrl)} <ExternalLink className="size-2.5" />
          </a>
        </div>

        <div className="ml-auto hidden items-center gap-2 md:flex">
          {!approved && <ModeToggle value={commentMode} onChange={setCommentMode} />}
          <DeviceSelector value={device} onChange={setDevice} />
          <ZoomControls zoom={zoom} onZoom={setZoom} />
        </div>

        <div className="ml-auto flex items-center gap-2 md:ml-2">
          {mode === "designer" && shareUrl && (
            <Button variant="outline" size="sm" onClick={copyShare}>
              <Share2 className="size-3.5" /> <span className="hidden sm:inline">Share</span>
            </Button>
          )}
          {approved ? (
            <span className="inline-flex items-center gap-1.5 rounded-[9px] border border-status-approved/30 bg-status-approved-soft px-2.5 py-1.5 text-[12px] font-medium text-status-approved">
              <Check className="size-3.5" /> Approved
            </span>
          ) : (
            <Button size="sm" onClick={() => setApproveOpen(true)}>
              <ThumbsUp className="size-3.5" />
              <span className="hidden sm:inline">Approve</span>
            </Button>
          )}
        </div>
      </header>

      {/* mobile control row */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-border bg-surface-raised px-3 py-2 md:hidden">
        {!approved && <ModeToggle value={commentMode} onChange={setCommentMode} />}
        <DeviceSelector value={device} onChange={setDevice} />
        <button
          onClick={() => setPanelOpen((v) => !v)}
          className="ml-auto shrink-0 rounded-[8px] border border-border px-2.5 py-1.5 text-[12px] font-medium text-foreground"
        >
          {panelOpen ? "Hide" : "Feedback"} ({feedback.length})
        </button>
      </div>

      <div className="grid min-h-0 flex-1 lg:grid-cols-[1fr_380px]">
        <div className="relative min-h-0 bg-surface-muted bg-grid">
          {approved && mode === "client" ? (
            <ApprovedState approval={approval!} designerName={designerName} />
          ) : (
            <ReviewCanvas
              url={websiteUrl}
              device={device}
              zoom={zoom}
              feedback={feedback}
              activeId={activeId}
              newId={newId}
              annotate={commentMode && !approved}
              onSelect={setActiveId}
              onCreate={handleCreate}
            />
          )}
        </div>

        <aside
          className={cn(
            "min-h-0 border-t border-border bg-surface-raised lg:border-l lg:border-t-0",
            panelOpen ? "block" : "hidden lg:block",
            "max-lg:absolute max-lg:inset-x-0 max-lg:bottom-0 max-lg:top-[104px] max-lg:z-10",
          )}
        >
          <FeedbackPanel
            feedback={feedback}
            activeId={activeId}
            device={device}
            mode={mode}
            onSelect={setActiveId}
            onReply={handleReply}
            onStatusChange={handleStatus}
          />
        </aside>
      </div>

      <ApprovalModal
        open={approveOpen}
        onClose={() => setApproveOpen(false)}
        onConfirm={handleApprove}
        defaultName={mode === "designer" ? viewerName : ""}
        openCount={openCount}
      />
    </div>
  );
}

function ModeToggle({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="inline-flex shrink-0 items-center gap-0.5 rounded-[9px] border border-border bg-surface-muted p-0.5">
      <button
        onClick={() => onChange(true)}
        aria-pressed={value}
        title="Comment mode — click the site to leave feedback"
        className={cn(
          "flex items-center gap-1 rounded-[7px] px-2 py-1 text-[11.5px] font-medium transition-colors",
          value ? "bg-surface-raised text-foreground shadow-[var(--shadow-xs)]" : "text-muted-foreground",
        )}
      >
        <MousePointerClick className="size-3.5" /> Comment
      </button>
      <button
        onClick={() => onChange(false)}
        aria-pressed={!value}
        title="Browse mode — scroll and interact with the site"
        className={cn(
          "flex items-center gap-1 rounded-[7px] px-2 py-1 text-[11.5px] font-medium transition-colors",
          !value ? "bg-surface-raised text-foreground shadow-[var(--shadow-xs)]" : "text-muted-foreground",
        )}
      >
        <Hand className="size-3.5" /> Browse
      </button>
    </div>
  );
}

function ApprovedState({
  approval,
  designerName,
}: {
  approval: Approval;
  designerName?: string;
}) {
  return (
    <div className="flex h-full flex-col items-center justify-center p-8 text-center">
      <span className="flex size-14 items-center justify-center rounded-full bg-status-approved-soft text-status-approved">
        <ThumbsUp className="size-6" />
      </span>
      <h2 className="mt-4 text-lg font-semibold text-foreground">🎉 This project has been approved</h2>
      <p className="mt-1.5 max-w-sm text-[13px] text-muted-foreground">
        Approved by <span className="font-medium text-foreground">{approval.approved_by_name}</span> on{" "}
        {new Date(approval.approved_at).toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        })}
        .
      </p>
      {typeof approval.metadata?.note === "string" && approval.metadata.note && (
        <p className="mt-3 max-w-sm rounded-[10px] border border-border bg-surface-raised p-3 text-[12.5px] text-foreground">
          “{approval.metadata.note}”
        </p>
      )}
      {designerName && (
        <p className="mt-4 text-[12px] text-subtle-foreground">
          {designerName} will be in touch with next steps.
        </p>
      )}
    </div>
  );
}
