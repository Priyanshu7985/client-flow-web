"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useTheme, type ThemeMode } from "./theme-provider";

const options: { value: ThemeMode; icon: React.ComponentType<{ className?: string }>; label: string }[] = [
  { value: "light", icon: Sun, label: "Light" },
  { value: "system", icon: Monitor, label: "System" },
  { value: "dark", icon: Moon, label: "Dark" },
];

export function ThemeToggle({ className }: { className?: string }) {
  const { mode, setMode } = useTheme();
  return (
    <div
      className={cn(
        "inline-flex items-center gap-0.5 rounded-[9px] border border-border bg-surface-muted p-0.5",
        className,
      )}
      role="radiogroup"
      aria-label="Theme"
    >
      {options.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          role="radio"
          aria-checked={mode === value}
          aria-label={label}
          onClick={() => setMode(value)}
          className={cn(
            "flex size-7 items-center justify-center rounded-[7px] transition-colors",
            mode === value
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
