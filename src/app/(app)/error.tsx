"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AppError({
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
    <div className="flex flex-col items-center justify-center rounded-[14px] border border-dashed border-border-strong py-16 text-center">
      <span className="flex size-11 items-center justify-center rounded-full bg-danger/10 text-danger">
        <AlertTriangle className="size-5" />
      </span>
      <h2 className="mt-4 text-[15px] font-semibold text-foreground">Couldn&apos;t load this page</h2>
      <p className="mt-1.5 max-w-sm text-[13px] text-muted-foreground">
        Something went wrong on our side. Your data is safe.
      </p>
      <Button onClick={reset} variant="outline" className="mt-5">
        Retry
      </Button>
    </div>
  );
}
