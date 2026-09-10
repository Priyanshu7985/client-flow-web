"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { deleteProjectAction } from "@/lib/projects/actions";

export function DeleteProjectButton({
  projectId,
  projectName,
}: {
  projectId: string;
  projectName: string;
}) {
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <>
      <Button variant="danger" size="sm" onClick={() => setOpen(true)}>
        <Trash2 className="size-3.5" /> Delete project
      </Button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Delete this project?"
        description="This permanently removes the project, its feedback, revisions and review link. This can't be undone."
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)} disabled={busy}>
              Cancel
            </Button>
            <form
              action={async () => {
                setBusy(true);
                await deleteProjectAction(projectId);
              }}
            >
              <Button type="submit" variant="danger" loading={busy} disabled={confirm !== projectName}>
                Delete project
              </Button>
            </form>
          </>
        }
      >
        <div className="space-y-2">
          <p className="text-[13px] text-muted-foreground">
            Type <span className="font-medium text-foreground">{projectName}</span> to confirm.
          </p>
          <Input value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder={projectName} />
        </div>
      </Modal>
    </>
  );
}
