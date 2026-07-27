import { createClient } from "@supabase/supabase-js";

const url = import.meta.env["VITE_SUPABASE_URL"] as string | undefined;
const publishableKey = import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"] as string | undefined;

// SPEC-023 — the browser only talks to the identity provider's SDK for
// login/refresh/logout; Maitre's API receives only the resulting bearer token.
export const supabase = url && publishableKey ? createClient(url, publishableKey) : null;

export const isSupabaseConfigured = Boolean(supabase);
