import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CalendarClock, ExternalLink, Eye, Settings2 } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { ActivityTimeline } from "@/components/app/activity-timeline";
import { RevisionHistory } from "@/components/app/revision-history";
import { CopyLinkButton } from "@/components/app/copy-link-button";
import { ProjectCreatedToast } from "@/components/app/project-created-toast";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProjectStatusBadge } from "@/components/ui/status-badge";
import { Avatar } from "@/components/ui/avatar";
import { formatDate } from "@/lib/utils/format";
import { hostFromUrl } from "@/lib/utils/url";
import { SITE_URL } from "@/lib/constants";
import { getActivities, getProject, getRevisions } from "@/lib/data";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const project = await getProject(id);
  return { title: project?.name ?? "Project" };
}

export default async function ProjectOverviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [project, activities, revisions] = await Promise.all([
    getProject(id),
    getActivities(id),
    getRevisions(id),
  ]);
  if (!project) notFound();

  const reviewUrl = `${SITE_URL}/review/${project.review_token}`;
  const { open, in_progress, resolved, total } = project.feedback_counts;
  const progress =
    total > 0 ? Math.round((resolved / total) * 100) : project.status === "approved" ? 100 : 0;

  const stats = [
    { label: "Open", value: open, tone: "open" as const },
    { label: "In Progress", value: in_progress, tone: "progress" as const },
    { label: "Resolved", value: resolved, tone: "resolved" as const },
  ];

  return (
    <div>
      <ProjectCreatedToast />
      <PageHeader
        title={project.name}
        description={project.description ?? undefined}
        actions={
          <>
            <Button asChild variant="outline" size="sm">
              <Link href={`/projects/${project.id}/settings`}>
                <Settings2 className="size-3.5" /> Settings
              </Link>
            </Button>
            <CopyLinkButton value={reviewUrl} />
            <Button asChild size="sm">
              <Link href={`/projects/${project.id}/review`}>
                <Eye className="size-3.5" /> Open Review
              </Link>
            </Button>
          </>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <ProjectStatusBadge status={project.status} />
        <a
          href={project.website_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground"
        >
          <ExternalLink className="size-3.5" />
          {hostFromUrl(project.website_url)}
        </a>
        <span className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground">
          <CalendarClock className="size-3.5" />
          {project.deadline ? `Due ${formatDate(project.deadline)}` : "No deadline"}
        </span>
        <span className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground">
          <Avatar name={project.client?.name ?? "Client"} size="xs" />
          {project.client?.name ?? "No client"}
        </span>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-[14px] border border-border bg-surface-raised p-4"
          >
            <p className="text-[12.5px] text-muted-foreground">{stat.label}</p>
            <p className="mt-1 text-[24px] font-semibold tracking-tight text-foreground tabular-nums">
              {stat.value}
            </p>
          </div>
        ))}
        <div className="rounded-[14px] border border-border bg-surface-raised p-4">
          <p className="text-[12.5px] text-muted-foreground">Client Approval</p>
          <div className="mt-1.5">
            {project.approval ? (
              <Badge tone="approved" dot>
                Approved {formatDate(project.approval.approved_at)}
              </Badge>
            ) : (
              <Badge tone="neutral" dot>
                Pending
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4">
        <div className="mb-1.5 flex items-center justify-between text-[12px] text-muted-foreground">
          <span>Feedback resolved</span>
          <span className="tabular-nums">
            {resolved}/{total} · {progress}%
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-surface-muted">
          <div
            className="h-full rounded-full bg-accent transition-[width] duration-700"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-6">
          <RevisionHistory projectId={project.id} revisions={revisions} />

          <Card>
            <CardHeader>
              <CardTitle>Client review link</CardTitle>
            </CardHeader>
            <CardBody className="space-y-3 pt-3">
              <p className="text-[13px] text-muted-foreground">
                Share this private link with your client. No account needed — they can review, comment
                and approve.
              </p>
              <div className="flex items-center gap-2 rounded-[9px] border border-border bg-surface-muted px-3 py-2">
                <span className="flex-1 truncate font-mono text-[12px] text-foreground">
                  {reviewUrl}
                </span>
                <CopyLinkButton value={reviewUrl} label="Copy" variant="secondary" />
              </div>
            </CardBody>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Activity</CardTitle>
          </CardHeader>
          <CardBody className="pt-3">
            <ActivityTimeline activities={activities} />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
