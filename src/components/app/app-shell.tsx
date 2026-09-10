"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { MobileNav } from "./mobile-nav";
import { DemoBanner } from "./demo-banner";
import type { AppNotification, Profile, ProjectWithMeta } from "@/lib/types";

export function AppShell({
  profile,
  notifications,
  projects,
  demoMode,
  children,
}: {
  profile: Profile;
  notifications: AppNotification[];
  projects: ProjectWithMeta[];
  demoMode: boolean;
  children: React.ReactNode;
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[248px_1fr]">
      {/* desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen border-r border-border bg-surface lg:block">
        <Sidebar />
      </aside>

      {/* mobile drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-zinc-950/45 backdrop-blur-[2px]"
              onClick={() => setDrawerOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", stiffness: 380, damping: 38 }}
              className="absolute inset-y-0 left-0 w-[264px] border-r border-border bg-surface"
            >
              <button
                onClick={() => setDrawerOpen(false)}
                className="absolute right-3 top-4 flex size-8 items-center justify-center rounded-[8px] text-muted-foreground hover:bg-surface-muted"
                aria-label="Close navigation"
              >
                <X className="size-4" />
              </button>
              <Sidebar onNavigate={() => setDrawerOpen(false)} />
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      <div className="flex min-h-screen flex-col">
        <Topbar
          profile={profile}
          notifications={notifications}
          projects={projects}
          onOpenSidebar={() => setDrawerOpen(true)}
        />
        {demoMode && <DemoBanner />}
        <main className="flex-1 px-4 pb-24 pt-6 sm:px-6 lg:pb-10">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>
      </div>

      <MobileNav />
    </div>
  );
}
