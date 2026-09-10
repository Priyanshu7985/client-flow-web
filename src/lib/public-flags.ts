import { isSupabaseConfigured } from "@/lib/supabase/config";

/** Client-safe flags (rely only on NEXT_PUBLIC_* env, inlined at build). */
export const DEMO_MODE_PUBLIC = !isSupabaseConfigured;
