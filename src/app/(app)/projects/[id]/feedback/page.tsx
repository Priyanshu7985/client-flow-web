import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Eye } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { FeedbackManager } from "@/components/app/feedback-manager";
import { AiInsightsPanel } from "@/components/app/ai-insights-panel";
import { Button } from "@/components/ui/button";
import { getFeedback, getProject } from "@/lib/data";

export const metadata = { title: "Feedback" };

export default async function ProjectFeedbackPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [project, feedback] = await Promise.all([getProject(id), getFeedback(id)]);
  if (!project) notFound();

  return (
    <div>
      <Link
        href={`/projects/${id}`}
        className="mb-4 inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" /> {project.name}
      </Link>
      <PageHeader
        title="Feedback"
        description={`${feedback.length} total · ${feedback.filter((f) => f.status === "open").length} open`}
        actions={
          <Button asChild size="sm">
            <Link href={`/projects/${id}/review`}>
              <Eye className="size-3.5" /> Open Review
            </Link>
          </Button>
        }
      />
      <div className="space-y-4">
        <AiInsightsPanel />
        <FeedbackManager
          projectId={id}
          initialFeedback={feedback}
          reviewHref={`/projects/${id}/review`}
        />
      </div>
    </div>
  );
}
