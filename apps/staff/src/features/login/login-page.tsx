import { useEffect, useRef, useState, type FormEvent } from "react";
import { useAuth, isSupabaseConfigured } from "../../app/auth-context.js";

const SUBMIT_FAILSAFE_MS = 12_000;

export function LoginPage() {
  const { signInWithPassword, signInWithToken } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fixtureToken, setFixtureToken] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (submitTimerRef.current !== null) {
        window.clearTimeout(submitTimerRef.current);
      }
    };
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    if (submitTimerRef.current !== null) {
      window.clearTimeout(submitTimerRef.current);
    }
    submitTimerRef.current = window.setTimeout(() => {
      setIsSubmitting(false);
      setError("El login no respondió. Probá de nuevo.");
    }, SUBMIT_FAILSAFE_MS);
    try {
      await signInWithPassword(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo iniciar sesión");
    } finally {
      if (submitTimerRef.current !== null) {
        window.clearTimeout(submitTimerRef.current);
        submitTimerRef.current = null;
      }
      setIsSubmitting(false);
    }
  }

  return (
    <main className="login">
      <div className="login-card">
        <div className="login-brand">
          <span className="login-logo" aria-hidden="true">
            👑
          </span>
          <div>
            <h1>Maitre Owner</h1>
            <p className="login-sub">Panel operativo y de configuración</p>
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
            {isSubmitting ? (
              <button
                type="button"
                className="btn btn--ghost btn--xl"
                onClick={() => {
                  if (submitTimerRef.current !== null) {
                    window.clearTimeout(submitTimerRef.current);
                    submitTimerRef.current = null;
                  }
                  setIsSubmitting(false);
                  setError("Login cancelado. Podés reintentar.");
                }}
              >
                Cancelar intento
              </button>
            ) : null}
          </form>
        ) : (
          <div className="login-fixture">
            <p>Pegá un access token válido para entrar al panel owner.</p>
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

        <div className="login-fixture">
          <p>Acceso rápido de desarrollo para destrabar la prueba local.</p>
          <div className="cashier-action-row">
            <button
              type="button"
              className="btn btn--ghost btn--xl"
              onClick={() => {
                setError(null);
                signInWithToken("demo-token");
              }}
            >
              Entrar con demo-token
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
