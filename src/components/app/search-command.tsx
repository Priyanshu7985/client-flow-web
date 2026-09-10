"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Search, CornerDownLeft } from "lucide-react";
import { dialogMotion, overlayMotion } from "@/lib/utils/motion";
import type { ProjectWithMeta } from "@/lib/types";

export function SearchCommand({ projects }: { projects: ProjectWithMeta[] }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 20);
    else {
      setQuery("");
      setActive(0);
    }
  }, [open]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q
      ? projects.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.client?.name.toLowerCase().includes(q) ||
            p.website_url.toLowerCase().includes(q),
        )
      : projects.slice(0, 6);
    return list.slice(0, 8);
  }, [query, projects]);

  const go = (id: string) => {
    router.push(`/projects/${id}`);
    setOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex h-9 w-full max-w-xs items-center gap-2 rounded-[9px] border border-border bg-surface-muted px-3 text-[13px] text-muted-foreground transition-colors hover:border-border-strong"
      >
        <Search className="size-4" />
        <span className="flex-1 text-left">Search projects…</span>
        <kbd className="hidden rounded border border-border bg-surface px-1.5 text-[10px] font-medium sm:inline">
          ⌘K
        </kbd>
      </button>

      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {open && (
              <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[12vh]">
                <motion.div
                  {...overlayMotion}
                  className="absolute inset-0 bg-zinc-950/45 backdrop-blur-[2px]"
                  onClick={() => setOpen(false)}
                />
                <motion.div
                  {...dialogMotion}
                  role="dialog"
                  aria-label="Search"
                  className="relative w-full max-w-lg overflow-hidden rounded-[14px] border border-border bg-surface-raised shadow-[var(--shadow-lg)]"
                >
                  <div className="flex items-center gap-2.5 border-b border-border px-4">
                    <Search className="size-4 text-muted-foreground" />
                    <input
                      ref={inputRef}
                      value={query}
                      onChange={(e) => {
                        setQuery(e.target.value);
                        setActive(0);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "ArrowDown") {
                          e.preventDefault();
                          setActive((a) => Math.min(a + 1, results.length - 1));
                        }
                        if (e.key === "ArrowUp") {
                          e.preventDefault();
                          setActive((a) => Math.max(a - 1, 0));
                        }
                        if (e.key === "Enter" && results[active]) go(results[active].id);
                      }}
                      placeholder="Search projects and clients…"
                      className="h-12 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-subtle-foreground"
                    />
                  </div>
                  <div className="max-h-80 overflow-y-auto p-1.5 scrollbar-thin">
                    {results.length === 0 ? (
                      <p className="px-3 py-8 text-center text-[13px] text-muted-foreground">
                        No matches for “{query}”.
                      </p>
                    ) : (
                      results.map((p, i) => (
                        <button
                          key={p.id}
                          onClick={() => go(p.id)}
                          onMouseEnter={() => setActive(i)}
                          className={`flex w-full items-center justify-between gap-3 rounded-[8px] px-3 py-2.5 text-left ${
                            i === active ? "bg-surface-muted" : ""
                          }`}
                        >
                          <span>
                            <span className="block text-[13px] font-medium text-foreground">
                              {p.name}
                            </span>
                            <span className="block text-[11.5px] text-muted-foreground">
                              {p.client?.name ?? "No client"}
                            </span>
                          </span>
                          {i === active && (
                            <CornerDownLeft className="size-3.5 text-muted-foreground" />
                          )}
                        </button>
                      ))
                    )}
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  );
}
