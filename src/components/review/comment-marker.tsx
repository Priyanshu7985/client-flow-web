"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { FeedbackStatus } from "@/lib/types";

const statusColor: Record<FeedbackStatus, string> = {
  open: "var(--status-open)",
  in_progress: "var(--status-progress)",
  resolved: "var(--status-resolved)",
};

export function CommentMarker({
  seq,
  x,
  y,
  status,
  active,
  isNew,
  onClick,
}: {
  seq: number;
  x: number;
  y: number;
  status: FeedbackStatus;
  active?: boolean;
  isNew?: boolean;
  onClick?: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{ type: "spring", stiffness: 500, damping: 24 }}
      whileHover={{ scale: 1.12 }}
      className={cn(
        "absolute flex size-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-[11px] font-bold text-white shadow-md ring-2 ring-white outline-none",
        active && "z-20 ring-[3px]",
      )}
      style={{
        left: `${x}%`,
        top: `${y}%`,
        background: statusColor[status],
      }}
      aria-label={`Feedback ${seq}, ${status}`}
    >
      {isNew && (
        <span
          className="absolute inset-0 animate-ping rounded-full opacity-60"
          style={{ background: statusColor[status] }}
        />
      )}
      <span className="relative">
        {status === "resolved" ? <Check className="size-3.5" /> : seq}
      </span>
    </motion.button>
  );
}
