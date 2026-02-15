import { createClient, SupabaseClient } from "@supabase/supabase-js";

let cached: SupabaseClient<any> | null = null;

export function getSupabaseServerClient() {
  if (cached) return cached;

  const url = process.env.SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error("Supabase env vars are missing");
  }

  cached = createClient<any>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}

export function isMockMode() {
  return process.env.USE_MOCK_DATA === "true";
}
