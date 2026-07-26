import { useState, type FormEvent } from "react";
import { useAuth, isSupabaseConfigured } from "../../app/auth-context.js";

// Login for the KDS. Deliberately minimal: a kitchen tablet signs in once and
// stays signed in for the shift. Uses the same dual-mode pattern as apps/web —
// Supabase password sign-in when configured, otherwise a pasted fixture token.
export function LoginPage() {
  const { signInWithPassword, signInWithToken } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fixtureToken, setFixtureToken] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    <main className="login">
      <div className="login-card">
        <div className="login-brand">
          <span className="login-logo" aria-hidden="true">
            🍳
          </span>
          <div>
            <h1>Maitre Cocina</h1>
            <p className="login-sub">Kitchen Display System</p>
          </div>
        </div>

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
            <button type="submit" className="btn btn--primary btn--xl" disabled={isSubmitting}>
              {isSubmitting ? "Ingresando…" : "Ingresar"}
            </button>
          </form>
        ) : (
          <div className="login-fixture">
            <p>
              Supabase Auth no está configurado en este build. Pegá un access token válido (por
              ejemplo, el token de demo del backend) para continuar.
            </p>
            <label htmlFor="fixture-token">Access token</label>
            <input
              id="fixture-token"
              type="text"
              value={fixtureToken}
              onChange={(e) => setFixtureToken(e.target.value)}
              placeholder="demo-token"
            />
            <button
              type="button"
              className="btn btn--primary btn--xl"
              onClick={() => signInWithToken(fixtureToken.trim())}
              disabled={!fixtureToken.trim()}
            >
              Continuar
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
