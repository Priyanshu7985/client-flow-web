"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { AlertCircle } from "lucide-react";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/input";
import { createProjectAction, type FormState } from "@/lib/projects/actions";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" loading={pending}>
      Create Project
    </Button>
  );
}

export function NewProjectForm() {
  const [state, action] = useActionState<FormState, FormData>(createProjectAction, {});
  const fe = state.fieldErrors ?? {};

  return (
    <Card>
      <CardBody>
        <form action={action} className="space-y-5">
          {state.error && (
            <p className="flex items-start gap-2 rounded-[9px] border border-danger/25 bg-danger/10 px-3 py-2 text-[13px] text-danger">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              {state.error}
            </p>
          )}

          <Field label="Project name" htmlFor="name" error={fe.name}>
            <Input id="name" name="name" placeholder="Acme Marketing Site" required />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Client name" htmlFor="client_name" error={fe.client_name}>
              <Input id="client_name" name="client_name" placeholder="Jordan Lee" required />
            </Field>
            <Field label="Client email" htmlFor="client_email" error={fe.client_email}>
              <Input
                id="client_email"
                name="client_email"
                type="email"
                placeholder="jordan@acme.com"
                required
              />
            </Field>
          </div>

          <Field
            label="Website URL"
            htmlFor="website_url"
            error={fe.website_url}
            hint="The staging or live site your client will review."
          >
            <Input id="website_url" name="website_url" placeholder="https://acme-staging.com" required />
          </Field>

          <Field label="Description" htmlFor="description" error={fe.description}>
            <Textarea
              id="description"
              name="description"
              placeholder="What's the scope of this project?"
            />
          </Field>

          <Field label="Deadline" htmlFor="deadline" error={fe.deadline}>
            <Input id="deadline" name="deadline" type="date" />
          </Field>

          <div className="flex justify-end gap-2 pt-1">
            <Submit />
          </div>
        </form>
      </CardBody>
    </Card>
  );
}
