"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Tabs } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { ProjectCard } from "./project-card";
import { RevealList } from "./reveal-list";
import type { ProjectStatus, ProjectWithMeta } from "@/lib/types";

type Filter = "all" | "active" | "waiting_for_client" | "approved";

const matchers: Record<Filter, (s: ProjectStatus) => boolean> = {
  all: () => true,
  active: (s) => s === "in_progress" || s === "changes_requested" || s === "draft",
  waiting_for_client: (s) => s === "waiting_for_client",
  approved: (s) => s === "approved",
};

export function ProjectsExplorer({ projects }: { projects: ProjectWithMeta[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");

  const counts = useMemo(
    () => ({
      all: projects.length,
      active: projects.filter((p) => matchers.active(p.status)).length,
      waiting_for_client: projects.filter((p) => matchers.waiting_for_client(p.status)).length,
      approved: projects.filter((p) => matchers.approved(p.status)).length,
    }),
    [projects],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return projects
      .filter((p) => matchers[filter](p.status))
      .filter(
        (p) =>
          !q ||
          p.name.toLowerCase().includes(q) ||
          p.client?.name.toLowerCase().includes(q) ||
          p.website_url.toLowerCase().includes(q),
      );
  }, [projects, filter, query]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs
          value={filter}
          onChange={setFilter}
          items={[
            { value: "all", label: "All", count: counts.all },
            { value: "active", label: "Active", count: counts.active },
            { value: "waiting_for_client", label: "Waiting", count: counts.waiting_for_client },
            { value: "approved", label: "Approved", count: counts.approved },
          ]}
        />
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-subtle-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search projects"
            className="pl-9"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-[14px] border border-dashed border-border-strong py-14 text-center text-[13px] text-muted-foreground">
          No projects match this view.
        </p>
      ) : (
        <RevealList className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </RevealList>
      )}
    </div>
  );
}
