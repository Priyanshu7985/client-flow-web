"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import {
  updateNotificationPrefsAction,
  updateProfileAction,
  type SettingsState,
} from "@/lib/settings/actions";
import type { Profile } from "@/lib/types";

function SaveButton({ children = "Save" }: { children?: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="sm" loading={pending}>
      {children}
    </Button>
  );
}

export function ProfilePanel({ profile }: { profile: Profile }) {
  const [state, action] = useActionState<SettingsState, FormData>(updateProfileAction, {});
  useEffect(() => {
    if (state.ok) toast.success("Profile saved");
    else if (state.error) toast.error(state.error);
  }, [state]);

  return (
    <Card id="profile">
      <CardHeader>
        <CardTitle>Profile</CardTitle>
      </CardHeader>
      <CardBody>
        <form action={action} className="space-y-4">
          <div className="flex items-center gap-3">
            <Avatar name={profile.full_name} src={profile.avatar_url} size="lg" />
            <p className="text-[12.5px] text-muted-foreground">
              Avatar uploads are enabled once Supabase Storage is connected.
            </p>
          </div>
          <Field label="Full name" htmlFor="full_name">
            <Input id="full_name" name="full_name" defaultValue={profile.full_name} required />
          </Field>
          <Field label="Email" htmlFor="email" hint="Contact support to change your email.">
            <Input id="email" defaultValue={profile.email} disabled />
          </Field>
          <Field label="Company" htmlFor="company_name">
            <Input id="company_name" name="company_name" defaultValue={profile.company_name ?? ""} />
          </Field>
          <div className="flex justify-end">
            <SaveButton />
          </div>
        </form>
      </CardBody>
    </Card>
  );
}

export function WorkspacePanel({ profile }: { profile: Profile }) {
  return (
    <Card id="workspace">
      <CardHeader>
        <CardTitle>Workspace</CardTitle>
      </CardHeader>
      <CardBody className="space-y-4">
        <Field label="Workspace name" htmlFor="ws">
          <Input id="ws" defaultValue={profile.company_name ?? "My workspace"} disabled />
        </Field>
        <div className="rounded-[10px] border border-border bg-surface-muted p-3 text-[12.5px] text-muted-foreground">
          Current plan: <span className="font-medium capitalize text-foreground">{profile.plan}</span>.
          Billing is disabled in this MVP.
        </div>
      </CardBody>
    </Card>
  );
}

const NOTIF_FIELDS = [
  { name: "email_enabled", label: "Email notifications", desc: "Master switch for all emails." },
  { name: "on_client_approval", label: "Client approvals", desc: "When a client approves a project." },
  { name: "on_new_feedback", label: "New feedback", desc: "When a client leaves feedback." },
  { name: "on_feedback_reply", label: "Feedback replies", desc: "When a client replies in a thread." },
] as const;

export function NotificationsPanel({ profile }: { profile: Profile }) {
  const [state, action] = useActionState<SettingsState, FormData>(
    updateNotificationPrefsAction,
    {},
  );
  useEffect(() => {
    if (state.ok) toast.success("Preferences saved");
    else if (state.error) toast.error(state.error);
  }, [state]);

  return (
    <Card id="notifications">
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
      </CardHeader>
      <CardBody>
        <form action={action} className="space-y-1">
          {NOTIF_FIELDS.map((field) => (
            <label
              key={field.name}
              className="flex items-center justify-between gap-4 rounded-[9px] px-1 py-2.5"
            >
              <span>
                <span className="block text-[13px] font-medium text-foreground">{field.label}</span>
                <span className="block text-[12px] text-muted-foreground">{field.desc}</span>
              </span>
              <input
                type="checkbox"
                name={field.name}
                defaultChecked={profile.notification_prefs[field.name]}
                className="size-4 accent-[var(--accent)]"
              />
            </label>
          ))}
          <div className="flex justify-end pt-2">
            <SaveButton>Save preferences</SaveButton>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}

export function AppearancePanel() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return (
    <Card id="appearance">
      <CardHeader>
        <CardTitle>Appearance</CardTitle>
      </CardHeader>
      <CardBody className="flex items-center justify-between gap-4">
        <p className="text-[13px] text-muted-foreground">
          Choose light, dark, or match your system.
        </p>
        {mounted && <ThemeToggle />}
      </CardBody>
    </Card>
  );
}
