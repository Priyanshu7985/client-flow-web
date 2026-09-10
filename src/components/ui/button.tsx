"use client";

import { forwardRef } from "react";
import { Slot } from "@radix-ui/react-slot";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type Variant = "primary" | "secondary" | "ghost" | "outline" | "danger" | "subtle";
type Size = "sm" | "md" | "lg" | "icon";

const variants: Record<Variant, string> = {
  primary:
    "bg-accent text-accent-foreground hover:bg-accent-hover shadow-[var(--shadow-xs)]",
  secondary:
    "bg-surface-muted text-foreground hover:bg-border/60 border border-border",
  outline:
    "border border-border-strong bg-surface text-foreground hover:bg-surface-muted",
  ghost: "text-muted-foreground hover:bg-surface-muted hover:text-foreground",
  subtle: "bg-accent-soft text-accent-soft-foreground hover:brightness-95",
  danger: "bg-danger text-white hover:brightness-95 shadow-[var(--shadow-xs)]",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-[13px] gap-1.5 rounded-[8px]",
  md: "h-9 px-4 text-sm gap-2 rounded-[9px]",
  lg: "h-11 px-5 text-[15px] gap-2 rounded-[10px]",
  icon: "h-9 w-9 rounded-[9px]",
};

const base =
  "inline-flex items-center justify-center font-medium transition-[background,color,box-shadow,transform] duration-150 active:scale-[0.985] disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring select-none";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  asChild?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      loading,
      children,
      disabled,
      asChild,
      ...props
    },
    ref,
  ) => {
    const classes = cn(base, variants[variant], sizes[size], className);

    if (asChild) {
      return (
        <Slot className={classes} ref={ref} {...props}>
          {children}
        </Slot>
      );
    }

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={classes}
        {...props}
      >
        {loading && <Loader2 className="size-4 animate-spin" aria-hidden />}
        {children}
      </button>
    );
  },
);
Button.displayName = "Button";
