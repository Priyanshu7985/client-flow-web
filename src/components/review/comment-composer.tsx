"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CommentComposer({
  x,
  y,
  onSubmit,
  onCancel,
}: {
  x: number;
  y: number;
  onSubmit: (comment: string) => Promise<void> | void;
  onCancel: () => void;
}) {
  const [value, setValue] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const t = setTimeout(() => ref.current?.focus(), 40);
    return () => clearTimeout(t);
  }, []);

  const flipX = x > 62;
  const flipY = y > 68;

  const submit = async () => {
    if (!value.trim() || submitting) return;
    setSubmitting(true);
    try {
      await onSubmit(value.trim());
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.14 }}
      onClick={(e) => e.stopPropagation()}
      className="absolute z-30 w-64 rounded-[12px] border border-border bg-surface-raised p-2.5 shadow-[var(--shadow-lg)]"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        transform: `translate(${flipX ? "-100%" : "0"}, ${flipY ? "-100%" : "0"}) translate(${
          flipX ? "-10px" : "14px"
        }, ${flipY ? "-10px" : "14px"})`,
      }}
    >
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-subtle-foreground">
          New feedback
        </span>
        <button
          onClick={onCancel}
          className="text-subtle-foreground hover:text-foreground"
          aria-label="Cancel"
        >
          <X className="size-3.5" />
        </button>
      </div>
      <textarea
        ref={ref}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submit();
          if (e.key === "Escape") onCancel();
        }}
        rows={3}
        placeholder="What needs to change here?"
        className="w-full resize-none rounded-[8px] border border-border bg-surface px-2.5 py-2 text-[13px] text-foreground outline-none placeholder:text-subtle-foreground focus-visible:border-ring"
      />
      <div className="mt-2 flex items-center justify-between">
        <span className="text-[10.5px] text-subtle-foreground">⌘↵ to send</span>
        <Button size="sm" onClick={submit} loading={submitting} disabled={!value.trim()}>
          <Send className="size-3.5" /> Send
        </Button>
      </div>
    </motion.div>
  );
}
