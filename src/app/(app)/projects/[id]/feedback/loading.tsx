import { FeedbackListSkeleton } from "@/components/app/skeletons";

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="h-7 w-40 animate-pulse rounded bg-surface-muted" />
      <FeedbackListSkeleton />
    </div>
  );
}
