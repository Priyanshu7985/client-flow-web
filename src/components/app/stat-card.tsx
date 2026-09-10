"use client";

import { motion } from "framer-motion";
import {
  CheckCircle2,
  Clock3,
  FolderKanban,
  Loader2,
  MessageSquare,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { fadeInUp, staggerContainer } from "@/lib/utils/motion";

const ICONS = {
  folder: FolderKanban,
  loader: Loader2,
  clock: Clock3,
  check: CheckCircle2,
  message: MessageSquare,
} satisfies Record<string, LucideIcon>;

export type StatIcon = keyof typeof ICONS;

export interface Stat {
  label: string;
  value: number;
  icon: StatIcon;
  tone?: "accent" | "open" | "resolved" | "approved";
}

const toneClass = {
  accent: "text-accent bg-accent-soft",
  open: "text-status-open bg-status-open-soft",
  resolved: "text-status-resolved bg-status-resolved-soft",
  approved: "text-status-approved bg-status-approved-soft",
};

export function StatGrid({ stats }: { stats: Stat[] }) {
  return (
    <motion.div
      variants={staggerContainer(0.06)}
      initial="hidden"
      animate="show"
      className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
    >
      {stats.map((stat) => {
        const Icon = ICONS[stat.icon];
        return (
          <motion.div
            key={stat.label}
            variants={fadeInUp}
            className="rounded-[14px] border border-border bg-surface-raised p-4 shadow-[var(--shadow-sm)]"
          >
            <div className="flex items-center justify-between">
              <span className="text-[12.5px] font-medium text-muted-foreground">{stat.label}</span>
              <span
                className={cn(
                  "flex size-7 items-center justify-center rounded-[8px]",
                  toneClass[stat.tone ?? "accent"],
                )}
              >
                <Icon className="size-3.5" />
              </span>
            </div>
            <p className="mt-3 text-[26px] font-semibold tracking-tight text-foreground tabular-nums">
              {stat.value}
            </p>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
