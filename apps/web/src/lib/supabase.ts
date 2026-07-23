import { createClient } from "@supabase/supabase-js";

const url = import.meta.env["VITE_SUPABASE_URL"] as string | undefined;
const publishableKey = import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"] as string | undefined;

// SPEC-023 — the browser only ever talks to the identity provider's SDK
// directly for login/refresh/logout; it sends only the resulting access
// token to Maitre's API as Authorization: Bearer <token>.
export const supabase = url && publishableKey ? createClient(url, publishableKey) : null;

export const isSupabaseConfigured = Boolean(supabase);
