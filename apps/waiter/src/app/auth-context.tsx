import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase, isSupabaseConfigured } from "../lib/supabase.js";

// Supabase-first auth for the waiter app. Fixture tokens remain available only
// as a local fallback when the build has no Supabase config.
interface AuthState {
  accessToken: string | null;
  email: string | null;
  isLoading: boolean;
  signInWithPassword: (email: string, password: string) => Promise<void>;
  signInWithToken: (token: string) => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

const FIXTURE_TOKEN_KEY = "maitre.waiter.fixtureAccessToken";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(
    () => (isSupabaseConfigured ? null : sessionStorage.getItem(FIXTURE_TOKEN_KEY)),
  );
  const [email, setEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isSupabaseConfigured) {
      sessionStorage.removeItem(FIXTURE_TOKEN_KEY);
    }
    if (!supabase) {
      setIsLoading(false);
      return;
    }
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setAccessToken(data.session.access_token);
        setEmail(data.session.user.email ?? null);
      }
      setIsLoading(false);
    });
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setAccessToken(session?.access_token ?? null);
      setEmail(session?.user.email ?? null);
      setIsLoading(false);
    });
    return () => subscription.subscription.unsubscribe();
  }, []);

  async function signInWithPassword(signInEmail: string, password: string) {
    if (!supabase) throw new Error("Supabase Auth no está configurado (falta VITE_SUPABASE_URL)");
    const { error } = await supabase.auth.signInWithPassword({ email: signInEmail, password });
    if (error) throw error;
  }

  function signInWithToken(token: string) {
    if (isSupabaseConfigured) {
      throw new Error("Este build usa Supabase Auth; no acepta fixture tokens.");
    }
    sessionStorage.setItem(FIXTURE_TOKEN_KEY, token);
    setAccessToken(token);
    setEmail(null);
    setIsLoading(false);
  }

  async function signOut() {
    sessionStorage.removeItem(FIXTURE_TOKEN_KEY);
    setAccessToken(null);
    setEmail(null);
    if (supabase) await supabase.auth.signOut();
  }

  return (
    <AuthContext.Provider
      value={{ accessToken, email, isLoading, signInWithPassword, signInWithToken, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export { isSupabaseConfigured };
