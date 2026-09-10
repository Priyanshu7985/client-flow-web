"use client";

import { motion } from "framer-motion";
import { Check, MessageSquare } from "lucide-react";

const markers = [
  { n: 1, x: 22, y: 28, tone: "open" as const },
  { n: 2, x: 63, y: 46, tone: "progress" as const },
  { n: 3, x: 40, y: 72, tone: "resolved" as const },
];

const toneColor: Record<string, string> = {
  open: "var(--status-open)",
  progress: "var(--status-progress)",
  resolved: "var(--status-resolved)",
};

export function ProductPreview() {
  return (
    <div className="relative rounded-[18px] border border-border bg-surface-raised p-2.5 shadow-[var(--shadow-lg)]">
      <div className="flex items-center gap-1.5 px-2 pb-2 pt-1">
        <span className="size-2.5 rounded-full bg-border-strong" />
        <span className="size-2.5 rounded-full bg-border-strong" />
        <span className="size-2.5 rounded-full bg-border-strong" />
        <div className="ml-3 h-5 flex-1 rounded-md bg-surface-muted" />
      </div>
      <div className="grid gap-2.5 lg:grid-cols-[1.7fr_1fr]">
        {/* website + markers */}
        <div className="relative overflow-hidden rounded-[12px] border border-border bg-surface">
          <div className="space-y-3 p-6">
            <div className="h-3 w-24 rounded bg-accent-soft" />
            <div className="h-7 w-3/4 rounded bg-foreground/10" />
            <div className="h-7 w-1/2 rounded bg-foreground/10" />
            <div className="h-3 w-full rounded bg-foreground/[0.06]" />
            <div className="h-3 w-5/6 rounded bg-foreground/[0.06]" />
            <div className="mt-4 h-9 w-32 rounded-lg bg-accent" />
            <div className="mt-6 grid grid-cols-3 gap-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-20 rounded-lg bg-foreground/[0.05]" />
              ))}
            </div>
          </div>
          {markers.map((m, i) => (
            <motion.span
              key={m.n}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5 + i * 0.18, type: "spring", stiffness: 380, damping: 22 }}
              className="absolute flex size-6 items-center justify-center rounded-full text-[11px] font-bold text-white shadow-md ring-2 ring-surface-raised"
              style={{ left: `${m.x}%`, top: `${m.y}%`, background: toneColor[m.tone] }}
            >
              {m.tone === "resolved" ? <Check className="size-3.5" /> : m.n}
            </motion.span>
          ))}
        </div>
        {/* feedback panel */}
        <div className="hidden flex-col gap-2 rounded-[12px] border border-border bg-surface p-3 lg:flex">
          <div className="flex items-center gap-2 text-[12px] font-semibold text-foreground">
            <MessageSquare className="size-3.5 text-muted-foreground" /> Feedback
          </div>
          {[
            { n: 1, text: "Make this heading larger", tone: "open" },
            { n: 2, text: "Try a stronger accent colour", tone: "progress" },
            { n: 3, text: "Card spacing — resolved", tone: "resolved" },
          ].map((c, i) => (
            <motion.div
              key={c.n}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 + i * 0.15 }}
              className="rounded-[9px] border border-border bg-surface-raised p-2.5"
            >
              <div className="flex items-center gap-1.5">
                <span
                  className="flex size-4 items-center justify-center rounded-full text-[9px] font-bold text-white"
                  style={{ background: toneColor[c.tone] }}
                >
                  {c.n}
                </span>
                <span className="text-[11px] text-muted-foreground">Client</span>
              </div>
              <p className="mt-1 text-[11.5px] text-foreground">{c.text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
