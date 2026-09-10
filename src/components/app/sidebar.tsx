"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { NAV_ITEMS } from "./nav-config";

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col gap-1 p-3">
      <div className="flex h-12 items-center px-2">
        <Logo href="/dashboard" />
      </div>

      <Button asChild size="sm" className="mt-1 w-full justify-start" onClick={onNavigate}>
        <Link href="/projects/new">
          <Plus className="size-4" />
          New Project
        </Link>
      </Button>

      <nav className="mt-3 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const active =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "relative flex items-center gap-3 rounded-[9px] px-3 py-2 text-[13.5px] font-medium transition-colors",
                active
                  ? "text-foreground"
                  : "text-muted-foreground hover:bg-surface-muted hover:text-foreground",
              )}
            >
              {active && (
                <motion.span
                  layoutId="sidebar-active"
                  className="absolute inset-0 rounded-[9px] bg-surface-muted"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              )}
              <item.icon className="relative z-10 size-4" />
              <span className="relative z-10">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto rounded-[12px] border border-border bg-surface p-3">
        <p className="text-[12px] font-medium text-foreground">Pro plan</p>
        <p className="mt-0.5 text-[11.5px] text-muted-foreground">
          Unlimited projects & revision history.
        </p>
      </div>
    </div>
  );
}
