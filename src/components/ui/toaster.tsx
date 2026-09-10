"use client";

import { Toaster as SonnerToaster } from "sonner";
import { useTheme } from "@/components/theme/theme-provider";

export function Toaster() {
  const { resolved } = useTheme();
  return (
    <SonnerToaster
      theme={resolved}
      position="bottom-right"
      toastOptions={{
        classNames: {
          toast:
            "rounded-[10px] border border-border bg-surface-raised text-foreground shadow-[var(--shadow-md)]",
          description: "text-muted-foreground",
        },
      }}
    />
  );
}

export { toast } from "sonner";
