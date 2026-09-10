import { cn } from "@/lib/utils/cn";
import type { StatusTone } from "@/lib/constants";

const toneClass: Record<StatusTone, string> = {
  neutral: "bg-surface-muted text-muted-foreground border-border",
  open: "bg-status-open-soft text-status-open border-status-open/25",
  progress: "bg-status-progress-soft text-status-progress border-status-progress/25",
  resolved: "bg-status-resolved-soft text-status-resolved border-status-resolved/25",
  approved: "bg-status-approved-soft text-status-approved border-status-approved/25",
  danger: "bg-danger/10 text-danger border-danger/25",
};

export function Badge({
  tone = "neutral",
  className,
  children,
  dot,
}: {
  tone?: StatusTone;
  className?: string;
  children: React.ReactNode;
  dot?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[12px] font-medium",
        toneClass[tone],
        className,
      )}
    >
      {dot && (
        <span
          className="size-1.5 rounded-full bg-current"
          aria-hidden
        />
      )}
      {children}
    </span>
  );
}
