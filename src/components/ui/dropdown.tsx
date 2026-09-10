"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import { popoverMotion } from "@/lib/utils/motion";

interface Ctx {
  open: boolean;
  setOpen: (v: boolean) => void;
  id: string;
}
const DropdownContext = createContext<Ctx | null>(null);

export function Dropdown({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <DropdownContext.Provider value={{ open, setOpen, id }}>
      <div ref={ref} className="relative">
        {children}
      </div>
    </DropdownContext.Provider>
  );
}

function useDropdown() {
  const ctx = useContext(DropdownContext);
  if (!ctx) throw new Error("Dropdown parts must be used within <Dropdown>");
  return ctx;
}

export function DropdownTrigger({
  children,
  asChild,
}: {
  children: React.ReactElement<Record<string, unknown>>;
  asChild?: boolean;
}) {
  const { open, setOpen, id } = useDropdown();
  const toggle = useCallback(() => setOpen(!open), [open, setOpen]);

  if (asChild) {
    return (
      <span onClick={toggle} aria-haspopup="menu" aria-expanded={open} aria-controls={id}>
        {children}
      </span>
    );
  }
  return (
    <button type="button" onClick={toggle} aria-haspopup="menu" aria-expanded={open} aria-controls={id}>
      {children}
    </button>
  );
}

export function DropdownMenu({
  children,
  align = "end",
  className,
}: {
  children: React.ReactNode;
  align?: "start" | "end";
  className?: string;
}) {
  const { open, id } = useDropdown();
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          {...popoverMotion}
          id={id}
          role="menu"
          className={cn(
            "absolute z-40 mt-2 min-w-[200px] origin-top rounded-[12px] border border-border bg-surface-raised p-1.5 shadow-[var(--shadow-md)]",
            align === "end" ? "right-0" : "left-0",
            className,
          )}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function DropdownItem({
  children,
  onSelect,
  href,
  destructive,
  icon: Icon,
  disabled,
}: {
  children: React.ReactNode;
  onSelect?: () => void;
  href?: string;
  destructive?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
  disabled?: boolean;
}) {
  const { setOpen } = useDropdown();
  const className = cn(
    "flex w-full items-center gap-2.5 rounded-[8px] px-2.5 py-2 text-left text-[13px] font-medium transition-colors disabled:opacity-40",
    destructive ? "text-danger hover:bg-danger/10" : "text-foreground hover:bg-surface-muted",
  );
  const content = (
    <>
      {Icon && <Icon className="size-4 opacity-70" />}
      {children}
    </>
  );

  if (href) {
    return (
      <Link href={href} role="menuitem" className={className} onClick={() => setOpen(false)}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type={onSelect ? "button" : "submit"}
      role="menuitem"
      disabled={disabled}
      onClick={() => {
        onSelect?.();
        setOpen(false);
      }}
      className={className}
    >
      {content}
    </button>
  );
}

export function DropdownSeparator() {
  return <div className="my-1 h-px bg-border" />;
}

export function DropdownLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-subtle-foreground">
      {children}
    </div>
  );
}
