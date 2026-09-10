"use client";

import { useState } from "react";
import { Check, Link2 } from "lucide-react";
import { toast } from "sonner";
import { Button, type ButtonProps } from "@/components/ui/button";

export function CopyLinkButton({
  value,
  label = "Share Client Link",
  variant = "outline",
  size = "sm",
}: {
  value: string;
  label?: string;
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
}) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      variant={variant}
      size={size}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          toast.success("Client link copied");
          setTimeout(() => setCopied(false), 2000);
        } catch {
          toast.error("Couldn't copy link");
        }
      }}
    >
      {copied ? <Check className="size-3.5" /> : <Link2 className="size-3.5" />}
      {label}
    </Button>
  );
}
