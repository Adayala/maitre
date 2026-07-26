import { useState, type FormEvent } from "react";
import { Navigate, useSearchParams } from "react-router-dom";
import { useAuth, isSupabaseConfigured } from "../../app/auth-context.js";

// SPEC-023 — login happens via the identity provider's SDK; this screen
// never touches passwords beyond forwarding them to supabase-js directly.
// A fixture-token field is offered only when Supabase Auth isn't
// configured (AUTH_DRIVER=fixture, local/demo backend).
export function LoginPage() {
  const { accessToken, signInWithPassword, signInWithToken } = useAuth();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fixtureToken, setFixtureToken] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const next = searchParams.get("next") ?? "/";
  const mode = searchParams.get("mode");

  if (accessToken) return <Navigate to={next} replace />;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await signInWithPassword(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo iniciar sesión");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="login-page">
      <h1>{mode === "customer" ? "Maitre — Cliente" : "Maitre — Dash"}</h1>
      {mode === "customer" ? (
        <p>Para continuar con tu reserva necesitamos que inicies sesión.</p>
      ) : null}

      {isSupabaseConfigured ? (
        <form onSubmit={handleSubmit} aria-label="Iniciar sesión">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
          />
          <label htmlFor="password">Contraseña</label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
          {error && (
            <p role="alert" className="login-error">
              {error}
            </p>
          )}
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Ingresando…" : "Ingresar"}
          </button>
        </form>
      ) : (
        <div>
          <p>
            Supabase Auth no está configurado en este build (falta VITE_SUPABASE_URL). Pegá un
            access token válido (por ejemplo, el token de demo del backend) para continuar.
          </p>
          <label htmlFor="fixture-token">Access token</label>
          <input
            id="fixture-token"
            type="text"
            value={fixtureToken}
            onChange={(e) => setFixtureToken(e.target.value)}
          />
          <button type="button" onClick={() => signInWithToken(fixtureToken)}>
            Continuar
          </button>
        </div>
      )}
    </main>
  );
}
