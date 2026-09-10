"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, MousePointerClick, RefreshCw, ThumbsUp } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";

const steps = [
  { icon: MousePointerClick, title: "Click where something needs changing", body: "Leave a pinned comment anywhere on the site." },
  { icon: RefreshCw, title: "Review the updates", body: "Your designer resolves feedback and pushes changes." },
  { icon: ThumbsUp, title: "Approve when you're happy", body: "One click records your sign-off." },
];

export function ReviewIntro({
  projectName,
  designerName,
  designerCompany,
  onStart,
}: {
  projectName: string;
  designerName: string;
  designerCompany: string | null;
  onStart: (name: string) => void;
}) {
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const start = () => {
    if (name.trim().length < 2) {
      setError("Please enter your name.");
      return;
    }
    onStart(name.trim());
  };

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-surface-muted bg-grid px-5 py-10">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md rounded-[16px] border border-border bg-surface-raised p-6 shadow-[var(--shadow-lg)]"
      >
        <Logo />
        <p className="mt-6 text-[12px] font-semibold uppercase tracking-wide text-accent">
          Website review
        </p>
        <h1 className="mt-1.5 text-xl font-semibold tracking-tight text-foreground">{projectName}</h1>
        <p className="mt-1 text-[13px] text-muted-foreground">
          {designerCompany ?? designerName} has invited you to review this website and share feedback.
        </p>

        <ol className="mt-5 space-y-3">
          {steps.map((step, i) => (
            <li key={step.title} className="flex gap-3">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-accent-soft text-[11px] font-bold text-accent-soft-foreground">
                {i + 1}
              </span>
              <div>
                <p className="text-[13px] font-medium text-foreground">{step.title}</p>
                <p className="text-[12px] text-muted-foreground">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-6 space-y-3">
          <Field label="Your name" htmlFor="reviewer-name" error={error ?? undefined}>
            <Input
              id="reviewer-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && start()}
              placeholder="e.g. Jordan Lee"
              autoFocus
            />
          </Field>
          <Button onClick={start} className="w-full">
            Start reviewing <ArrowRight className="size-4" />
          </Button>
          <p className="text-center text-[11px] text-subtle-foreground">
            No account needed. Your name is shown with your feedback.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
