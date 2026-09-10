"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, MousePointerClick } from "lucide-react";
import { DEVICE_PRESETS } from "@/lib/constants";
import { cn } from "@/lib/utils/cn";
import type { DeviceMode, FeedbackWithReplies } from "@/lib/types";
import { CommentMarker } from "./comment-marker";
import { CommentComposer } from "./comment-composer";
import { EmbedBlockedState } from "./embed-blocked-state";

interface Draft {
  x: number;
  y: number;
}

export function ReviewCanvas({
  url,
  device,
  zoom,
  feedback,
  activeId,
  newId,
  annotate,
  onSelect,
  onCreate,
}: {
  url: string;
  device: DeviceMode;
  zoom: number;
  feedback: FeedbackWithReplies[];
  activeId: string | null;
  newId: string | null;
  annotate: boolean;
  onSelect: (id: string | null) => void;
  onCreate: (input: {
    x: number;
    y: number;
    pageUrl: string;
    device: DeviceMode;
    comment: string;
  }) => Promise<void>;
}) {
  const preset = DEVICE_PRESETS[device];
  const [status, setStatus] = useState<"loading" | "ready" | "blocked">("loading");
  const [draft, setDraft] = useState<Draft | null>(null);
  const layerRef = useRef<HTMLDivElement>(null);
  const loadedRef = useRef(false);

  useEffect(() => {
    setStatus("loading");
    loadedRef.current = false;
    const controller = new AbortController();

    fetch(`/api/embed-check?url=${encodeURIComponent(url)}`, { signal: controller.signal })
      .then((r) => r.json())
      .then((data: { embeddable: boolean }) => {
        if (!data.embeddable) setStatus("blocked");
      })
      .catch(() => {});

    const timeout = setTimeout(() => {
      if (!loadedRef.current) setStatus((s) => (s === "loading" ? "blocked" : s));
    }, 8000);

    return () => {
      controller.abort();
      clearTimeout(timeout);
    };
  }, [url]);

  const handleLayerClick = (e: React.MouseEvent) => {
    if (!annotate || status !== "ready") return;
    if (draft) {
      setDraft(null);
      return;
    }
    const rect = layerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setDraft({ x: Math.min(100, Math.max(0, x)), y: Math.min(100, Math.max(0, y)) });
    onSelect(null);
  };

  const visible = feedback.filter((f) => f.device === device);

  return (
    <div className="flex h-full w-full items-start justify-center overflow-auto scrollbar-thin p-4 sm:p-6">
      <motion.div
        layout
        className="relative shrink-0 overflow-hidden rounded-[12px] border border-border bg-surface-raised shadow-[var(--shadow-md)]"
        style={{
          width: preset.width * zoom,
          height: preset.height * zoom,
        }}
      >
        {status === "blocked" ? (
          <EmbedBlockedState url={url} />
        ) : (
          <>
            <iframe
              src={url}
              title="Website preview"
              onLoad={() => {
                loadedRef.current = true;
                setStatus((s) => (s === "blocked" ? s : "ready"));
              }}
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              referrerPolicy="no-referrer"
              className="origin-top-left border-0 bg-white"
              style={{
                width: preset.width,
                height: preset.height,
                transform: `scale(${zoom})`,
              }}
            />

            {/* capture + marker layer */}
            <div
              ref={layerRef}
              onClick={handleLayerClick}
              className={cn(
                "absolute inset-0",
                annotate && status === "ready" ? "cursor-crosshair" : "pointer-events-none",
              )}
            >
              <AnimatePresence>
                {visible.map((f) => (
                  <CommentMarker
                    key={f.id}
                    seq={f.seq}
                    x={f.position_x}
                    y={f.position_y}
                    status={f.status}
                    active={activeId === f.id}
                    isNew={newId === f.id}
                    onClick={() => onSelect(activeId === f.id ? null : f.id)}
                  />
                ))}
              </AnimatePresence>

              <AnimatePresence>
                {draft && (
                  <>
                    <CommentMarker seq={visible.length + 1} x={draft.x} y={draft.y} status="open" active />
                    <CommentComposer
                      x={draft.x}
                      y={draft.y}
                      onCancel={() => setDraft(null)}
                      onSubmit={async (comment) => {
                        await onCreate({
                          x: Number(draft.x.toFixed(2)),
                          y: Number(draft.y.toFixed(2)),
                          pageUrl: url,
                          device,
                          comment,
                        });
                        setDraft(null);
                      }}
                    />
                  </>
                )}
              </AnimatePresence>
            </div>

            {status === "loading" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-surface-raised">
                <Loader2 className="size-5 animate-spin text-muted-foreground" />
                <p className="text-[12px] text-muted-foreground">Loading website…</p>
              </div>
            )}
          </>
        )}
      </motion.div>

      {annotate && status === "ready" && !draft && (
        <div className="pointer-events-none fixed bottom-6 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 rounded-full border border-border bg-surface-raised px-3.5 py-2 text-[12px] text-muted-foreground shadow-[var(--shadow-md)] lg:hidden">
          <MousePointerClick className="size-3.5" />
          Tap the site to leave feedback
        </div>
      )}
    </div>
  );
}
