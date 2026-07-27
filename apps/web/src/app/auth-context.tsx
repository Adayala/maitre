import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { getSupabaseClient, isSupabaseConfigured } from "../lib/supabase.js";

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
  const location = useLocation();
  const [accessToken, setAccessToken] = useState<string | null>(
    () => (isSupabaseConfigured ? null : sessionStorage.getItem(FIXTURE_TOKEN_KEY)),
  );
  const [email, setEmail] = useState<string | null>(null);
  const [authHydrationState, setAuthHydrationState] = useState<"idle" | "loading" | "ready">(
    isSupabaseConfigured ? "idle" : "ready",
  );
  const shouldHydrateAuth = requiresSessionBootstrap(location.pathname);
  const isLoading = shouldHydrateAuth && authHydrationState !== "ready";

  useEffect(() => {
    if (isSupabaseConfigured) {
      sessionStorage.removeItem(FIXTURE_TOKEN_KEY);
    }
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setAuthHydrationState("ready");
      return;
    }

    if (!shouldHydrateAuth || authHydrationState !== "idle") {
      return;
    }

    let isActive = true;
    let unsubscribe = () => {};

    setAuthHydrationState("loading");

    void getSupabaseClient()
      .then(async (supabase) => {
        if (!isActive || !supabase) {
          if (isActive) setAuthHydrationState("ready");
          return;
        }

        const { data } = await supabase.auth.getSession();
        if (!isActive) return;

        if (data.session) {
          setAccessToken(data.session.access_token);
          setEmail(data.session.user.email ?? null);
        }

        const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
          setAccessToken(session?.access_token ?? null);
          setEmail(session?.user.email ?? null);
          setAuthHydrationState("ready");
        });

        unsubscribe = () => subscription.subscription.unsubscribe();
        setAuthHydrationState("ready");
      })
      .catch(() => {
        if (isActive) {
          setAuthHydrationState("ready");
        }
      });

    return () => {
      isActive = false;
      unsubscribe();
    };
  }, [authHydrationState, shouldHydrateAuth]);

  async function signInWithPassword(signInEmail: string, password: string) {
    const supabase = await getSupabaseClient();
    if (!supabase) throw new Error("Supabase Auth is not configured (VITE_SUPABASE_URL missing)");
    const { error } = await supabase.auth.signInWithPassword({ email: signInEmail, password });
    if (error) throw error;
  }

  function signInWithToken(token: string) {
    if (isSupabaseConfigured) {
      throw new Error("This build uses Supabase Auth and does not accept fixture tokens.");
    }
    sessionStorage.setItem(FIXTURE_TOKEN_KEY, token);
    setAccessToken(token);
    setEmail(null);
    setAuthHydrationState("ready");
  }

  async function signOut() {
    sessionStorage.removeItem(FIXTURE_TOKEN_KEY);
    setAccessToken(null);
    setEmail(null);
    const supabase = await getSupabaseClient();
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

function requiresSessionBootstrap(pathname: string) {
  if (pathname === "/login") return true;
  if (!pathname.startsWith("/public")) return true;
  if (pathname === "/public/reservations") return true;
  if (pathname.startsWith("/public/reservations/")) return true;
  return false;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export { isSupabaseConfigured };
