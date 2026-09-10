"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { relativeTime } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import type { FeedbackReply } from "@/lib/types";

export function ReplyThread({
  replies,
  onReply,
}: {
  replies: FeedbackReply[];
  onReply: (message: string) => Promise<void>;
}) {
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);

  const send = async () => {
    if (!value.trim() || busy) return;
    setBusy(true);
    try {
      await onReply(value.trim());
      setValue("");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mt-3 space-y-3 border-t border-border pt-3">
      {replies.map((reply) => (
        <div key={reply.id} className="flex gap-2">
          <Avatar name={reply.author_name} size="xs" />
          <div
            className={cn(
              "flex-1 rounded-[9px] px-2.5 py-1.5",
              reply.author_type === "designer" ? "bg-accent-soft" : "bg-surface-muted",
            )}
          >
            <div className="flex items-center gap-1.5">
              <span className="text-[11.5px] font-medium text-foreground">{reply.author_name}</span>
              <span className="text-[10.5px] text-subtle-foreground">
                {relativeTime(reply.created_at)}
              </span>
            </div>
            <p className="mt-0.5 whitespace-pre-wrap text-[12.5px] text-foreground">{reply.message}</p>
          </div>
        </div>
      ))}

      <div className="flex items-end gap-2">
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) send();
          }}
          rows={1}
          placeholder="Reply…"
          className="min-h-9 flex-1 resize-none rounded-[8px] border border-border bg-surface px-2.5 py-2 text-[12.5px] text-foreground outline-none placeholder:text-subtle-foreground focus-visible:border-ring"
        />
        <Button size="icon" onClick={send} loading={busy} disabled={!value.trim()} aria-label="Send reply">
          <Send className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}
