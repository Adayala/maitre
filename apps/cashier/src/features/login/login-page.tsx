import { useState, type FormEvent } from "react";
import { useAuth, isSupabaseConfigured } from "../../app/auth-context.js";

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
            💳
          </span>
          <div>
            <h1>Maitre Caja</h1>
            <p className="login-sub">App de cajero</p>
          </div>
        </div>

        {isSupabaseConfigured ? (
          <form onSubmit={handleSubmit} aria-label="Iniciar sesión">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            <label htmlFor="password">Contraseña</label>
            <input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            {error && <p role="alert" className="login-error">{error}</p>}
            <button type="submit" className="btn btn--primary btn--xl" disabled={isSubmitting}>
              {isSubmitting ? "Ingresando…" : "Ingresar"}
            </button>
          </form>
        ) : (
          <div className="login-fixture">
            <p>Este build local no tiene Supabase Auth. Pegá un access token válido para entrar a la app de caja.</p>
            <label htmlFor="fixture-token">Access token</label>
            <input
              id="fixture-token"
              type="text"
              value={fixtureToken}
              onChange={(e) => setFixtureToken(e.target.value)}
              placeholder="Bearer token"
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
