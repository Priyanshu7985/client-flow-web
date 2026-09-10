"use client";

import { useState } from "react";
import { Info, X } from "lucide-react";

export function DemoBanner() {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;
  return (
    <div className="flex items-center gap-2.5 border-b border-border bg-accent-soft px-4 py-2 text-[12.5px] text-accent-soft-foreground sm:px-6">
      <Info className="size-3.5 shrink-0" />
      <p className="flex-1">
        Demo mode — sample data, changes are kept in memory only. Connect Supabase (see{" "}
        <code className="rounded bg-black/5 px-1 dark:bg-white/10">.env.example</code>) to persist.
      </p>
      <button onClick={() => setDismissed(true)} aria-label="Dismiss">
        <X className="size-3.5" />
      </button>
    </div>
  );
}
