"use client";

import { LogOut, Menu, Settings, User } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import {
  Dropdown,
  DropdownItem,
  DropdownLabel,
  DropdownMenu,
  DropdownSeparator,
  DropdownTrigger,
} from "@/components/ui/dropdown";
import { NotificationsMenu } from "./notifications-menu";
import { SearchCommand } from "./search-command";
import { signOutAction } from "@/lib/auth/actions";
import type { AppNotification, Profile, ProjectWithMeta } from "@/lib/types";

export function Topbar({
  profile,
  notifications,
  projects,
  onOpenSidebar,
}: {
  profile: Profile;
  notifications: AppNotification[];
  projects: ProjectWithMeta[];
  onOpenSidebar: () => void;
}) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/85 px-4 backdrop-blur-md sm:px-6">
      <button
        onClick={onOpenSidebar}
        className="flex size-9 items-center justify-center rounded-[9px] text-muted-foreground hover:bg-surface-muted lg:hidden"
        aria-label="Open navigation"
      >
        <Menu className="size-4.5" />
      </button>

      <div className="flex flex-1 items-center">
        <SearchCommand projects={projects} />
      </div>

      <NotificationsMenu notifications={notifications} />

      <Dropdown>
        <DropdownTrigger asChild>
          <button className="flex items-center gap-2 rounded-[9px] p-1 pr-2 transition-colors hover:bg-surface-muted">
            <Avatar name={profile.full_name} src={profile.avatar_url} size="sm" />
            <span className="hidden text-[13px] font-medium text-foreground sm:block">
              {profile.full_name.split(" ")[0]}
            </span>
          </button>
        </DropdownTrigger>
        <DropdownMenu>
          <DropdownLabel>
            {profile.full_name}
            <span className="block truncate font-normal normal-case tracking-normal text-muted-foreground">
              {profile.email}
            </span>
          </DropdownLabel>
          <DropdownSeparator />
          <DropdownItem icon={User} href="/settings">
            Account settings
          </DropdownItem>
          <DropdownItem icon={Settings} href="/settings#workspace">
            Workspace
          </DropdownItem>
          <DropdownSeparator />
          <form action={signOutAction}>
            <DropdownItem icon={LogOut} destructive>
              Log out
            </DropdownItem>
          </form>
        </DropdownMenu>
      </Dropdown>
    </header>
  );
}
