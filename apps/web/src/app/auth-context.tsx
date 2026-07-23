import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase, isSupabaseConfigured } from "../lib/supabase.js";

interface AuthState {
  accessToken: string | null;
  email: string | null;
  isLoading: boolean;
  signInWithPassword: (email: string, password: string) => Promise<void>;
  signInWithToken: (token: string) => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

const FIXTURE_TOKEN_KEY = "maitre.fixtureAccessToken";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(
    () => sessionStorage.getItem(FIXTURE_TOKEN_KEY),
  );
  const [email, setEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
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
    });
    return () => subscription.subscription.unsubscribe();
  }, []);

  async function signInWithPassword(signInEmail: string, password: string) {
    if (!supabase) throw new Error("Supabase Auth is not configured (VITE_SUPABASE_URL missing)");
    const { error } = await supabase.auth.signInWithPassword({ email: signInEmail, password });
    if (error) throw error;
  }

  function signInWithToken(token: string) {
    sessionStorage.setItem(FIXTURE_TOKEN_KEY, token);
    setAccessToken(token);
    setEmail(null);
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
