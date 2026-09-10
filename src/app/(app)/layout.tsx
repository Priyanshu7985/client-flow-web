import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { AppShell } from "@/components/app/app-shell";
import {
  DEMO_MODE,
  getNotifications,
  getProfile,
  listProjects,
} from "@/lib/data";
import { demoProfile } from "@/lib/data/sample";

export const metadata: Metadata = { robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const [profile, notifications, projects] = await Promise.all([
    getProfile(),
    getNotifications(),
    listProjects(),
  ]);

  if (!profile && !DEMO_MODE) redirect("/login");

  return (
    <AppShell
      profile={profile ?? demoProfile}
      notifications={notifications}
      projects={projects}
      demoMode={DEMO_MODE}
    >
      {children}
    </AppShell>
  );
}
