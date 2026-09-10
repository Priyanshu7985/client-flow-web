"use server";

import { revalidatePath } from "next/cache";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/data/demo-store";
import { notificationPrefsSchema, profileSchema } from "@/lib/validation/schemas";

export interface SettingsState {
  ok?: boolean;
  error?: string;
}

export async function updateProfileAction(
  _prev: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  const parsed = profileSchema.safeParse({
    full_name: formData.get("full_name"),
    company_name: formData.get("company_name") ?? "",
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  if (!isSupabaseConfigured) {
    db().profile.full_name = parsed.data.full_name;
    db().profile.company_name = parsed.data.company_name || null;
    revalidatePath("/settings", "layout");
    return { ok: true };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: parsed.data.full_name,
      company_name: parsed.data.company_name || null,
    })
    .eq("id", user.id);
  if (error) return { error: error.message };

  revalidatePath("/settings", "layout");
  return { ok: true };
}

export async function updateNotificationPrefsAction(
  _prev: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  const parsed = notificationPrefsSchema.safeParse({
    email_enabled: formData.get("email_enabled") === "on",
    on_client_approval: formData.get("on_client_approval") === "on",
    on_new_feedback: formData.get("on_new_feedback") === "on",
    on_feedback_reply: formData.get("on_feedback_reply") === "on",
  });
  if (!parsed.success) return { error: "Invalid input" };

  if (!isSupabaseConfigured) {
    db().profile.notification_prefs = parsed.data;
    revalidatePath("/settings");
    return { ok: true };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("profiles")
    .update({ notification_prefs: parsed.data })
    .eq("id", user.id);
  if (error) return { error: error.message };

  revalidatePath("/settings");
  return { ok: true };
}
