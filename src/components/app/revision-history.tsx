"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { Layers, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/input";
import { RevisionStatusBadge } from "@/components/ui/status-badge";
import { formatDate, pluralize } from "@/lib/utils/format";
import { createRevisionAction, type FormState } from "@/lib/projects/actions";
import type { Revision } from "@/lib/types";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="sm" loading={pending}>
      Create revision
    </Button>
  );
}

export function RevisionHistory({
  projectId,
  revisions,
}: {
  projectId: string;
  revisions: Revision[];
}) {
  const [open, setOpen] = useState(false);
  const action = createRevisionAction.bind(null, projectId);
  const [state, formAction] = useActionState<FormState, FormData>(action, {});

  useEffect(() => {
    if (state.ok) setOpen(false);
  }, [state.ok]);

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-[15px] font-semibold text-foreground">Revisions</h2>
        <Button variant="ghost" size="sm" onClick={() => setOpen((v) => !v)}>
          <Plus className="size-3.5" /> New revision
        </Button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            action={formAction}
            className="mb-3 overflow-hidden rounded-[12px] border border-border bg-surface-raised p-4"
          >
            <div className="space-y-3">
              {state.error && <p className="text-[12.5px] text-danger">{state.error}</p>}
              <Field label="Label" htmlFor="label">
                <Input id="label" name="label" placeholder="Client feedback round 2" required />
              </Field>
              <Field label="Notes" htmlFor="notes">
                <Textarea id="notes" name="notes" rows={2} placeholder="What changed in this round?" />
              </Field>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Submit />
              </div>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <ol className="space-y-2.5">
        {revisions.map((rev) => (
          <li
            key={rev.id}
            className="flex items-start gap-3 rounded-[12px] border border-border bg-surface-raised p-3.5"
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-surface-muted text-[13px] font-semibold text-foreground">
              {rev.number}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-[13.5px] font-medium text-foreground">{rev.label}</p>
                <RevisionStatusBadge status={rev.status} />
              </div>
              {rev.notes && <p className="mt-0.5 text-[12.5px] text-muted-foreground">{rev.notes}</p>}
              <p className="mt-1 text-[11.5px] text-subtle-foreground">
                {formatDate(rev.created_at)} · {pluralize(rev.change_count, "change")} ·{" "}
                {pluralize(rev.feedback_count, "feedback item")}
              </p>
            </div>
          </li>
        ))}
        {revisions.length === 0 && (
          <li className="flex items-center gap-2 rounded-[12px] border border-dashed border-border-strong p-4 text-[13px] text-muted-foreground">
            <Layers className="size-4" /> No revisions yet.
          </li>
        )}
      </ol>
    </div>
  );
}
