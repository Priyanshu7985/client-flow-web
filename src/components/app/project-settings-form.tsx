"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/input";
import { updateProjectAction, type FormState } from "@/lib/projects/actions";
import type { ProjectWithMeta } from "@/lib/types";

function Save() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="sm" loading={pending}>
      Save changes
    </Button>
  );
}

export function ProjectSettingsForm({ project }: { project: ProjectWithMeta }) {
  const action = updateProjectAction.bind(null, project.id);
  const [state, formAction] = useActionState<FormState, FormData>(action, {});

  useEffect(() => {
    if (state.ok) toast.success("Project updated");
    else if (state.error) toast.error(state.error);
  }, [state]);

  const deadlineValue = project.deadline ? project.deadline.slice(0, 10) : "";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Project details</CardTitle>
      </CardHeader>
      <CardBody>
        <form action={formAction} className="space-y-4">
          <Field label="Project name" htmlFor="name">
            <Input id="name" name="name" defaultValue={project.name} required />
          </Field>
          <Field label="Website URL" htmlFor="website_url">
            <Input id="website_url" name="website_url" defaultValue={project.website_url} required />
          </Field>
          <Field label="Description" htmlFor="description">
            <Textarea id="description" name="description" defaultValue={project.description ?? ""} />
          </Field>
          <Field label="Deadline" htmlFor="deadline">
            <Input id="deadline" name="deadline" type="date" defaultValue={deadlineValue} />
          </Field>
          <div className="flex justify-end">
            <Save />
          </div>
        </form>
      </CardBody>
    </Card>
  );
}
