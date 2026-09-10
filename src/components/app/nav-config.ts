import {
  LayoutDashboard,
  FolderKanban,
  Users,
  MessageSquare,
  Settings,
} from "lucide-react";

export const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/clients", label: "Clients", icon: Users },
  { href: "/feedback", label: "Feedback", icon: MessageSquare },
  { href: "/settings", label: "Settings", icon: Settings },
] as const;
