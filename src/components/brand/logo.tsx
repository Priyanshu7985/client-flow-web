import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import { APP_NAME } from "@/lib/constants";

export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "relative inline-flex size-7 items-center justify-center rounded-[8px] bg-accent text-accent-foreground shadow-[var(--shadow-xs)]",
        className,
      )}
      aria-hidden
    >
      <svg viewBox="0 0 24 24" fill="none" className="size-4">
        <path
          d="M6 12.5 10.2 16.5 18 7.5"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

export function Logo({
  href = "/",
  className,
  wordmark = true,
}: {
  href?: string;
  className?: string;
  wordmark?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn("inline-flex items-center gap-2 font-semibold tracking-tight", className)}
    >
      <LogoMark />
      {wordmark && <span className="text-[15px] text-foreground">{APP_NAME}</span>}
    </Link>
  );
}
