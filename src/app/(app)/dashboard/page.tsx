import Link from "next/link";
import { FolderKanban, Plus, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { StatGrid, type Stat } from "@/components/app/stat-card";
import { ProjectCard } from "@/components/app/project-card";
import { ActivityTimeline } from "@/components/app/activity-timeline";
import { RevealList } from "@/components/app/reveal-list";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { FeedbackStatusBadge } from "@/components/ui/status-badge";
import { Avatar } from "@/components/ui/avatar";
import { relativeTime } from "@/lib/utils/format";
import {
  getDashboardStats,
  getProfile,
  getRecentActivity,
  getRecentFeedback,
  listProjects,
} from "@/lib/data";
import { demoProfile } from "@/lib/data/sample";

export default async function DashboardPage() {
  const [stats, projects, recentFeedback, activity, profile] = await Promise.all([
    getDashboardStats(),
    listProjects(),
    getRecentFeedback(5),
    getRecentActivity(8),
    getProfile(),
  ]);

  const firstName = (profile ?? demoProfile).full_name.split(" ")[0];
  const projectName = (id: string) => projects.find((p) => p.id === id)?.name ?? "Project";

  const statCards: Stat[] = [
    { label: "Total Projects", value: stats.total_projects, icon: "folder", tone: "accent" },
    { label: "Active Projects", value: stats.active_projects, icon: "loader", tone: "open" },
    { label: "Pending Approval", value: stats.pending_approval, icon: "clock", tone: "approved" },
    { label: "Approved", value: stats.approved_projects, icon: "check", tone: "resolved" },
  ];

  const recentProjects = projects.slice(0, 6);

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${firstName}`}
        description="Here's what's happening across your client projects."
        actions={
          <Button asChild size="sm">
            <Link href="/projects/new">
              <Plus className="size-4" /> New Project
            </Link>
          </Button>
        }
      />

      <StatGrid stats={statCards} />

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-[15px] font-semibold text-foreground">Recent Projects</h2>
            <Link
              href="/projects"
              className="flex items-center gap-1 text-[12.5px] font-medium text-accent hover:underline"
            >
              View all <ArrowRight className="size-3.5" />
            </Link>
          </div>

          {recentProjects.length === 0 ? (
            <EmptyState
              icon={FolderKanban}
              title="You don't have any projects yet"
              description="Create your first project to share a website and start collecting feedback."
              action={
                <Button asChild>
                  <Link href="/projects/new">Create your first project</Link>
                </Button>
              }
            />
          ) : (
            <RevealList className="grid gap-3 sm:grid-cols-2">
              {recentProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </RevealList>
          )}
        </section>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Feedback</CardTitle>
              <Link href="/feedback" className="text-[12px] font-medium text-accent hover:underline">
                All
              </Link>
            </CardHeader>
            <CardBody className="space-y-3 pt-3">
              {recentFeedback.length === 0 ? (
                <p className="py-6 text-center text-[13px] text-muted-foreground">No feedback yet.</p>
              ) : (
                recentFeedback.map((f) => (
                  <Link
                    key={f.id}
                    href={`/projects/${f.project_id}/feedback`}
                    className="block rounded-[10px] border border-border p-3 transition-colors hover:bg-surface-muted"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-1.5 text-[11.5px] text-muted-foreground">
                        <Avatar name={f.author_name} size="xs" />
                        {f.author_name}
                      </span>
                      <FeedbackStatusBadge status={f.status} />
                    </div>
                    <p className="mt-1.5 line-clamp-2 text-[12.5px] text-foreground">
                      #{f.seq} · {f.comment}
                    </p>
                    <p className="mt-1 text-[11px] text-subtle-foreground">
                      {projectName(f.project_id)} · {relativeTime(f.created_at)}
                    </p>
                  </Link>
                ))
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Activity</CardTitle>
            </CardHeader>
            <CardBody className="pt-3">
              <ActivityTimeline activities={activity} />
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
