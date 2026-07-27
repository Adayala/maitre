const url = import.meta.env["VITE_SUPABASE_URL"] as string | undefined;
const publishableKey = import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"] as string | undefined;

// SPEC-023 — the browser only ever talks to the identity provider's SDK
// directly for login/refresh/logout; it sends only the resulting access
// token to Maitre's API as Authorization: Bearer <token>.
export const isSupabaseConfigured = Boolean(url && publishableKey);

interface SupabaseSessionUser {
  email?: string | null;
}

interface SupabaseSession {
  access_token: string;
  user: SupabaseSessionUser;
}

interface SupabaseAuthSubscription {
  data: {
    subscription: {
      unsubscribe: () => void;
    };
  };
}

interface SupabaseAuthClient {
  getSession: () => Promise<{ data: { session: SupabaseSession | null } }>;
  onAuthStateChange: (
    callback: (_event: string, session: SupabaseSession | null) => void,
  ) => SupabaseAuthSubscription;
  signInWithPassword: (credentials: {
    email: string;
    password: string;
  }) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

export interface SupabaseBrowserClient {
  auth: SupabaseAuthClient;
}

let supabaseClientPromise: Promise<SupabaseBrowserClient | null> | null = null;

export async function getSupabaseClient(): Promise<SupabaseBrowserClient | null> {
  if (!isSupabaseConfigured) return null;

  supabaseClientPromise ??= import("@supabase/supabase-js").then(({ createClient }) =>
    createClient(url!, publishableKey!) as unknown as SupabaseBrowserClient,
  );

  return supabaseClientPromise;
}
