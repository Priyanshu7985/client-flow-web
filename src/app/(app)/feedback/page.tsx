import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Avatar } from "@/components/ui/avatar";
import { FeedbackStatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { relativeTime } from "@/lib/utils/format";
import { getFeedback, listProjects } from "@/lib/data";
import type { FeedbackWithReplies } from "@/lib/types";

export const metadata = { title: "Feedback" };

export default async function GlobalFeedbackPage() {
  const projects = await listProjects();
  const perProject = await Promise.all(
    projects.map(async (p) => ({ project: p, items: await getFeedback(p.id) })),
  );

  const all = perProject
    .flatMap(({ project, items }) =>
      items.map((f) => ({ ...f, projectName: project.name, projectId: project.id })),
    )
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const openCount = all.filter((f) => f.status === "open").length;

  if (all.length === 0) {
    return (
      <div>
        <PageHeader title="Feedback" />
        <EmptyState
          icon={MessageSquare}
          title="No feedback yet"
          description="Feedback from all your projects will show up here as clients leave it."
          action={
            <Button asChild>
              <Link href="/projects">Go to projects</Link>
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Feedback"
        description={`${all.length} items across ${projects.length} projects · ${openCount} open`}
      />
      <div className="space-y-2.5">
        {all.map((f: FeedbackWithReplies & { projectName: string; projectId: string }) => (
          <Link
            key={f.id}
            href={`/projects/${f.projectId}/feedback`}
            className="block rounded-[12px] border border-border bg-surface-raised p-4 transition-colors hover:border-border-strong"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="text-[12px] font-medium text-muted-foreground">{f.projectName}</span>
              <FeedbackStatusBadge status={f.status} />
            </div>
            <p className="mt-1.5 line-clamp-2 text-[13.5px] text-foreground">
              #{f.seq} · {f.comment}
            </p>
            <p className="mt-2 flex items-center gap-1.5 text-[11.5px] text-muted-foreground">
              <Avatar name={f.author_name} size="xs" />
              {f.author_name} · {relativeTime(f.created_at)} · {f.replies.length} replies
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
