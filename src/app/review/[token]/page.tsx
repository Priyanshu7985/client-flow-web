import type { Metadata } from "next";
import { getReviewBundle } from "@/lib/data/review";
import { ClientReview } from "@/components/review/client-review";
import { ReviewLinkError } from "@/components/review/review-link-error";

export const metadata: Metadata = {
  title: "Website review",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

export default async function ReviewPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const bundle = await getReviewBundle(token);

  if (!bundle) return <ReviewLinkError />;

  return (
    <ClientReview
      token={token}
      projectName={bundle.project.name}
      websiteUrl={bundle.project.website_url}
      designerName={bundle.project.designer_name}
      designerCompany={bundle.project.designer_company}
      initialFeedback={bundle.feedback}
      initialApproval={bundle.approval}
    />
  );
}
