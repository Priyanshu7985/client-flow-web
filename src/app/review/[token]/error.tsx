"use client";

import { useEffect } from "react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";

export default function ReviewError({
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
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-surface-muted px-6 text-center">
      <Logo />
      <h1 className="mt-8 text-lg font-semibold text-foreground">Couldn&apos;t load this review</h1>
      <p className="mt-2 max-w-sm text-[13px] text-muted-foreground">
        Something went wrong loading the review. Try again in a moment.
      </p>
      <Button onClick={reset} variant="outline" className="mt-6">
        Try again
      </Button>
    </div>
  );
}
