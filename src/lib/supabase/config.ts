export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/**
 * When Supabase env vars are absent the app runs in "demo mode": the data layer
 * serves in-memory sample data so the product can be explored end-to-end before
 * a Supabase project is connected. See src/lib/data.
 */
export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
