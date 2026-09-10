import { Skeleton } from "@/components/ui/misc";

export function DashboardSkeleton() {
  return (
    <div>
      <div className="pb-6">
        <Skeleton className="h-7 w-56" />
        <Skeleton className="mt-2 h-4 w-72" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[104px] rounded-[14px]" />
        ))}
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-44 rounded-[14px]" />
          ))}
        </div>
        <div className="space-y-6">
          <Skeleton className="h-64 rounded-[14px]" />
          <Skeleton className="h-64 rounded-[14px]" />
        </div>
      </div>
    </div>
  );
}

export function ProjectListSkeleton() {
  return (
    <div>
      <div className="pb-6">
        <Skeleton className="h-7 w-40" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-52 rounded-[14px]" />
        ))}
      </div>
    </div>
  );
}

export function ProjectDetailSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-64" />
      <div className="grid gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-[14px]" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <Skeleton className="h-96 rounded-[14px]" />
        <Skeleton className="h-96 rounded-[14px]" />
      </div>
    </div>
  );
}

export function ReviewSkeleton() {
  return (
    <div className="flex h-screen flex-col">
      <Skeleton className="h-14 rounded-none" />
      <div className="grid flex-1 lg:grid-cols-[1fr_380px]">
        <Skeleton className="m-4 rounded-[14px]" />
        <div className="space-y-3 border-l border-border p-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-[12px]" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function FeedbackListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-28 rounded-[12px]" />
      ))}
    </div>
  );
}

export function ListPageSkeleton({ cards = 6 }: { cards?: number }) {
  return (
    <div>
      <div className="pb-6">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="mt-2 h-4 w-56" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: cards }).map((_, i) => (
          <Skeleton key={i} className="h-40 rounded-[14px]" />
        ))}
      </div>
    </div>
  );
}

export function FormPageSkeleton() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Skeleton className="h-7 w-48" />
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} className="h-56 rounded-[14px]" />
      ))}
    </div>
  );
}
