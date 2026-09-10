"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, MessageSquare, ExternalLink } from "lucide-react";
import { fadeInUp } from "@/lib/utils/motion";
import { deadlineLabel } from "@/lib/utils/format";
import { hostFromUrl } from "@/lib/utils/url";
import { cn } from "@/lib/utils/cn";
import { Avatar } from "@/components/ui/avatar";
import { ProjectStatusBadge } from "@/components/ui/status-badge";
import type { ProjectWithMeta } from "@/lib/types";

export function ProjectCard({ project }: { project: ProjectWithMeta }) {
  const deadline = deadlineLabel(project.deadline);
  const { open, resolved, total } = project.feedback_counts;
  const progress = total > 0 ? Math.round((resolved / total) * 100) : project.status === "approved" ? 100 : 0;

  return (
    <motion.div variants={fadeInUp}>
      <Link
        href={`/projects/${project.id}`}
        className="group block rounded-[14px] border border-border bg-surface-raised p-5 shadow-[var(--shadow-sm)] transition-all hover:border-border-strong hover:shadow-[var(--shadow-md)]"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-[14.5px] font-semibold text-foreground">{project.name}</h3>
            <p className="mt-0.5 flex items-center gap-1 text-[12px] text-muted-foreground">
              <ExternalLink className="size-3" />
              {hostFromUrl(project.website_url)}
            </p>
          </div>
          <ArrowUpRight className="size-4 shrink-0 text-subtle-foreground transition-colors group-hover:text-foreground" />
        </div>

        <div className="mt-4 flex items-center justify-between">
          <ProjectStatusBadge status={project.status} />
          <span
            className={cn(
              "text-[12px] font-medium",
              deadline.tone === "danger" && "text-danger",
              deadline.tone === "warning" && "text-warning",
              deadline.tone === "neutral" && "text-muted-foreground",
            )}
          >
            {deadline.label}
          </span>
        </div>

        <div className="mt-4">
          <div className="h-1.5 overflow-hidden rounded-full bg-surface-muted">
            <div
              className="h-full rounded-full bg-accent transition-[width] duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
          <span className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
            <Avatar name={project.client?.name ?? "Client"} size="xs" />
            {project.client?.name ?? "No client"}
          </span>
          <span className="flex items-center gap-1 text-[12px] text-muted-foreground">
            <MessageSquare className="size-3.5" />
            {open} open
          </span>
        </div>
      </Link>
    </motion.div>
  );
}
