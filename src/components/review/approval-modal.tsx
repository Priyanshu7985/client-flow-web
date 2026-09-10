"use client";

import { useState } from "react";
import { PartyPopper } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/input";

export function ApprovalModal({
  open,
  onClose,
  onConfirm,
  defaultName,
  openCount,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: (name: string, note: string) => Promise<void>;
  defaultName: string;
  openCount: number;
}) {
  const [name, setName] = useState(defaultName);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const confirm = async () => {
    if (name.trim().length < 2) {
      setError("Please enter your name.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await onConfirm(name.trim(), note.trim());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Approve this project?"
      description="This records your approval with your name and today's date. It can't be undone."
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button onClick={confirm} loading={busy}>
            <PartyPopper className="size-4" /> Approve project
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {openCount > 0 && (
          <p className="rounded-[9px] border border-status-open/25 bg-status-open-soft px-3 py-2 text-[12.5px] text-status-open">
            {openCount} feedback {openCount === 1 ? "item is" : "items are"} still open. You can still
            approve, but the designer may want to address them first.
          </p>
        )}
        {error && (
          <p className="rounded-[9px] border border-danger/25 bg-danger/10 px-3 py-2 text-[12.5px] text-danger">
            {error}
          </p>
        )}
        <Field label="Your name" htmlFor="approver">
          <Input id="approver" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jordan Lee" />
        </Field>
        <Field label="Note (optional)" htmlFor="note">
          <Textarea
            id="note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            placeholder="Anything you want on record with the approval."
          />
        </Field>
      </div>
    </Modal>
  );
}
