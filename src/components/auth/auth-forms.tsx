"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { DEMO_MODE_PUBLIC } from "@/lib/public-flags";
import {
  resetPasswordAction,
  signInAction,
  signUpAction,
  updatePasswordAction,
  type AuthState,
} from "@/lib/auth/actions";

function SubmitButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" loading={pending}>
      {children}
    </Button>
  );
}

function Feedback({ state }: { state: AuthState }) {
  if (state.error) {
    return (
      <p className="flex items-start gap-2 rounded-[9px] border border-danger/25 bg-danger/10 px-3 py-2 text-[13px] text-danger">
        <AlertCircle className="mt-0.5 size-4 shrink-0" />
        {state.error}
      </p>
    );
  }
  if (state.message) {
    return (
      <p className="flex items-start gap-2 rounded-[9px] border border-success/25 bg-success/10 px-3 py-2 text-[13px] text-success">
        <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
        {state.message}
      </p>
    );
  }
  return null;
}

function DemoHint() {
  if (!DEMO_MODE_PUBLIC) return null;
  return (
    <p className="rounded-[9px] border border-border bg-surface-muted px-3 py-2 text-[12.5px] text-muted-foreground">
      Demo mode — Supabase isn&apos;t connected. Submit with anything to explore the app with sample data.
    </p>
  );
}

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  auth_callback: "That sign-in link has expired or was already used. Please log in again.",
};

export function LoginForm() {
  const [state, action] = useActionState(signInAction, {});
  const params = useSearchParams();
  const next = params.get("next") ?? "/dashboard";
  const urlError = params.get("error");
  const merged: AuthState = state.error
    ? state
    : urlError && AUTH_ERROR_MESSAGES[urlError]
      ? { error: AUTH_ERROR_MESSAGES[urlError] }
      : state;
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">Welcome back</h1>
        <p className="mt-1 text-[13px] text-muted-foreground">Log in to your ClientFlow workspace.</p>
      </div>
      <form action={action} className="space-y-4">
        <input type="hidden" name="next" value={next} />
        <DemoHint />
        <Feedback state={merged} />
        <Field label="Email" htmlFor="email">
          <Input id="email" name="email" type="email" autoComplete="email" placeholder="you@studio.com" required />
        </Field>
        <Field label="Password" htmlFor="password">
          <Input id="password" name="password" type="password" autoComplete="current-password" placeholder="••••••••" required />
        </Field>
        <div className="flex justify-end">
          <Link href="/reset-password" className="text-[12.5px] text-accent hover:underline">
            Forgot password?
          </Link>
        </div>
        <SubmitButton>Log in</SubmitButton>
      </form>
      <p className="text-center text-[13px] text-muted-foreground">
        New to ClientFlow?{" "}
        <Link href="/signup" className="font-medium text-accent hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}

export function SignupForm() {
  const [state, action] = useActionState(signUpAction, {});
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">Create your workspace</h1>
        <p className="mt-1 text-[13px] text-muted-foreground">Start collecting visual feedback in minutes.</p>
      </div>
      <form action={action} className="space-y-4">
        <DemoHint />
        <Feedback state={state} />
        <Field label="Full name" htmlFor="full_name">
          <Input id="full_name" name="full_name" autoComplete="name" placeholder="Alex Designer" required />
        </Field>
        <Field label="Email" htmlFor="email">
          <Input id="email" name="email" type="email" autoComplete="email" placeholder="you@studio.com" required />
        </Field>
        <Field label="Password" htmlFor="password" hint="At least 8 characters.">
          <Input id="password" name="password" type="password" autoComplete="new-password" placeholder="••••••••" required />
        </Field>
        <SubmitButton>Create account</SubmitButton>
      </form>
      <p className="text-center text-[13px] text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-accent hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}

export function ResetForm() {
  const [state, action] = useActionState(resetPasswordAction, {});
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">Reset your password</h1>
        <p className="mt-1 text-[13px] text-muted-foreground">
          We&apos;ll email you a link to set a new one.
        </p>
      </div>
      <form action={action} className="space-y-4">
        <Feedback state={state} />
        <Field label="Email" htmlFor="email">
          <Input id="email" name="email" type="email" autoComplete="email" placeholder="you@studio.com" required />
        </Field>
        <SubmitButton>Send reset link</SubmitButton>
      </form>
      <p className="text-center text-[13px] text-muted-foreground">
        <Link href="/login" className="font-medium text-accent hover:underline">
          Back to log in
        </Link>
      </p>
    </div>
  );
}

export function UpdatePasswordForm() {
  const [state, action] = useActionState(updatePasswordAction, {});
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">Set a new password</h1>
      </div>
      <form action={action} className="space-y-4">
        <Feedback state={state} />
        <Field label="New password" htmlFor="password" hint="At least 8 characters.">
          <Input id="password" name="password" type="password" autoComplete="new-password" required />
        </Field>
        <SubmitButton>Update password</SubmitButton>
      </form>
    </div>
  );
}
