"use client";

import { Minus, Plus } from "lucide-react";

export function ZoomControls({
  zoom,
  onZoom,
}: {
  zoom: number;
  onZoom: (zoom: number) => void;
}) {
  const step = (delta: number) =>
    onZoom(Math.min(1.5, Math.max(0.4, Math.round((zoom + delta) * 100) / 100)));

  return (
    <div className="inline-flex items-center gap-0.5 rounded-[9px] border border-border bg-surface-muted p-0.5">
      <button
        onClick={() => step(-0.1)}
        className="flex size-7 items-center justify-center rounded-[7px] text-muted-foreground hover:text-foreground"
        aria-label="Zoom out"
      >
        <Minus className="size-3.5" />
      </button>
      <button
        onClick={() => onZoom(1)}
        className="min-w-[44px] rounded-[7px] px-1 text-[12px] font-medium tabular-nums text-foreground hover:bg-surface-raised"
      >
        {Math.round(zoom * 100)}%
      </button>
      <button
        onClick={() => step(0.1)}
        className="flex size-7 items-center justify-center rounded-[7px] text-muted-foreground hover:text-foreground"
        aria-label="Zoom in"
      >
        <Plus className="size-3.5" />
      </button>
    </div>
  );
}
