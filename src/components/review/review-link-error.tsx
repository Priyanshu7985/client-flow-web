import Link from "next/link";
import { LinkIcon } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";

export function ReviewLinkError() {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-surface-muted px-6 text-center">
      <Logo />
      <span className="mt-8 flex size-12 items-center justify-center rounded-full bg-surface-raised text-muted-foreground ring-1 ring-border">
        <LinkIcon className="size-5" />
      </span>
      <h1 className="mt-4 text-lg font-semibold text-foreground">This review link isn&apos;t valid</h1>
      <p className="mt-2 max-w-sm text-[13px] text-muted-foreground">
        The link may have expired or been mistyped. Ask your designer to share a fresh review link.
      </p>
      <Button asChild variant="outline" className="mt-6">
        <Link href="/">Go to ClientFlow</Link>
      </Button>
    </div>
  );
}
