"use client";

import { Monitor, Smartphone, Tablet } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { DeviceMode } from "@/lib/types";

const options: { value: DeviceMode; icon: React.ComponentType<{ className?: string }>; label: string }[] = [
  { value: "desktop", icon: Monitor, label: "Desktop" },
  { value: "tablet", icon: Tablet, label: "Tablet" },
  { value: "mobile", icon: Smartphone, label: "Mobile" },
];

export function DeviceSelector({
  value,
  onChange,
}: {
  value: DeviceMode;
  onChange: (value: DeviceMode) => void;
}) {
  return (
    <div className="inline-flex items-center gap-0.5 rounded-[9px] border border-border bg-surface-muted p-0.5">
      {options.map(({ value: v, icon: Icon, label }) => (
        <button
          key={v}
          onClick={() => onChange(v)}
          aria-label={label}
          aria-pressed={value === v}
          className={cn(
            "flex size-7 items-center justify-center rounded-[7px] transition-colors",
            value === v
              ? "bg-surface-raised text-foreground shadow-[var(--shadow-xs)]"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <Icon className="size-3.5" />
        </button>
      ))}
    </div>
  );
}
