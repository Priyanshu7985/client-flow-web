import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getFeedback, getProfile, getProject } from "@/lib/data";
import { SITE_URL } from "@/lib/constants";
import { DesignerReview } from "@/components/review/designer-review";

export const metadata: Metadata = { title: "Review", robots: { index: false } };

export default async function DesignerReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [project, feedback, profile] = await Promise.all([
    getProject(id),
    getFeedback(id),
    getProfile(),
  ]);
  if (!project) notFound();

  return (
    <DesignerReview
      projectId={project.id}
      projectName={project.name}
      websiteUrl={project.website_url}
      viewerName={profile?.full_name ?? "Designer"}
      shareUrl={`${SITE_URL}/review/${project.review_token}`}
      initialFeedback={feedback}
      initialApproval={project.approval}
    />
  );
}
