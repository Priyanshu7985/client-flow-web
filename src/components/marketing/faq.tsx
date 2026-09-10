"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const faqs = [
  {
    q: "Do my clients need to create an account?",
    a: "No. You share a private review link and your client can view the site, leave pinned feedback, reply, and approve — all without signing up.",
  },
  {
    q: "How does the visual feedback actually work?",
    a: "Your client's website loads in a review frame with a transparent capture layer on top. When they click a spot, we store the exact position as a percentage of the page along with the page URL and device, so the marker stays anchored as the layout reflows.",
  },
  {
    q: "What if a website can't be embedded?",
    a: "Some sites block being shown in a frame via security headers. ClientFlow detects this and shows a clear message with a link to open the site directly. We never bypass a site's security policy.",
  },
  {
    q: "Can I manage multiple revisions of a project?",
    a: "Yes. Every project has a revision history — each round captures its feedback count, changes made, and status, so you always know where a project stands.",
  },
  {
    q: "Is client approval binding?",
    a: "When a client approves, we write an immutable approval record with their name and a timestamp. It can't be edited afterwards.",
  },
  {
    q: "Which plan should I start on?",
    a: "Start on Free — it covers two active projects with full visual feedback and client review links. Upgrade to Pro when you need unlimited projects and revision history.",
  },
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="mx-auto max-w-2xl divide-y divide-border rounded-[14px] border border-border bg-surface-raised">
      {faqs.map((faq, i) => {
        const isOpen = open === i;
        return (
          <div key={faq.q}>
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
              aria-expanded={isOpen}
            >
              <span className="text-[14.5px] font-medium text-foreground">{faq.q}</span>
              <Plus
                className={cn(
                  "size-4 shrink-0 text-muted-foreground transition-transform duration-200",
                  isOpen && "rotate-45",
                )}
              />
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <p className="px-5 pb-5 text-[13.5px] leading-relaxed text-muted-foreground">
                    {faq.a}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
