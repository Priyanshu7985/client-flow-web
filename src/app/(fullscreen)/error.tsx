"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function FullscreenError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center px-6 text-center">
      <h1 className="text-lg font-semibold text-foreground">Couldn&apos;t open the review</h1>
      <p className="mt-2 max-w-sm text-[13px] text-muted-foreground">
        Something went wrong. Your project data is safe.
      </p>
      <div className="mt-6 flex gap-2">
        <Button onClick={reset} variant="outline">Retry</Button>
        <Button asChild><Link href="/dashboard">Back to dashboard</Link></Button>
      </div>
    </div>
  );
}
