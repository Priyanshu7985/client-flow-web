"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { relativeTime } from "@/lib/utils/format";
import { Dropdown, DropdownMenu, DropdownTrigger } from "@/components/ui/dropdown";
import type { AppNotification } from "@/lib/types";

export function NotificationsMenu({ notifications }: { notifications: AppNotification[] }) {
  const unread = notifications.filter((n) => !n.read_at).length;

  return (
    <Dropdown>
      <DropdownTrigger asChild>
        <button
          className="relative flex size-9 items-center justify-center rounded-[9px] text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground"
          aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`}
        >
          <Bell className="size-4" />
          {unread > 0 && (
            <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-accent ring-2 ring-surface-raised" />
          )}
        </button>
      </DropdownTrigger>
      <DropdownMenu className="w-80 p-0">
        <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
          <span className="text-[13px] font-semibold text-foreground">Notifications</span>
          {unread > 0 && (
            <span className="text-[11px] text-muted-foreground">{unread} unread</span>
          )}
        </div>
        <div className="max-h-[360px] overflow-y-auto scrollbar-thin">
          {notifications.length === 0 ? (
            <p className="px-4 py-10 text-center text-[13px] text-muted-foreground">
              You&apos;re all caught up.
            </p>
          ) : (
            notifications.slice(0, 12).map((n) => (
              <Link
                key={n.id}
                href={n.project_id ? `/projects/${n.project_id}` : "/feedback"}
                className={cn(
                  "block border-b border-border px-4 py-3 transition-colors last:border-0 hover:bg-surface-muted",
                  !n.read_at && "bg-accent-soft/40",
                )}
              >
                <div className="flex items-start gap-2">
                  {!n.read_at && <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent" />}
                  <div className={cn(!n.read_at ? "" : "pl-3.5")}>
                    <p className="text-[13px] font-medium text-foreground">{n.title}</p>
                    {n.body && (
                      <p className="mt-0.5 line-clamp-2 text-[12px] text-muted-foreground">{n.body}</p>
                    )}
                    <p className="mt-1 text-[11px] text-subtle-foreground">
                      {relativeTime(n.created_at)}
                    </p>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </DropdownMenu>
    </Dropdown>
  );
}
