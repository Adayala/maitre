import { useEffect, useRef, useState, type FormEvent } from "react";
import { Navigate, useSearchParams } from "react-router-dom";
import { useAuth, isSupabaseConfigured } from "../../app/auth-context.js";

const SUBMIT_FAILSAFE_MS = 12_000;

// SPEC-023 — login happens via the identity provider's SDK; this screen never
// touches passwords beyond forwarding them to supabase-js directly. A
// fixture-token field is offered only when Supabase Auth isn't configured in
// the local build.
export function LoginPage() {
  const { accessToken, signInWithPassword, signInWithToken } = useAuth();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fixtureToken, setFixtureToken] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitTimerRef = useRef<number | null>(null);
  const next = searchParams.get("next") ?? "/";
  const mode = searchParams.get("mode");
  const isCustomerMode = mode === "customer";
  const checklist = isCustomerMode
    ? [
        "Ingresar con cuenta para continuar una reserva o ver tus reservas.",
        "Sin login igual podés navegar menú, promociones y sucursales públicas.",
        "Después del ingreso volvés al flujo que estabas haciendo.",
      ]
    : [
        "Usá tu acceso de staff u owner para entrar al backoffice.",
        "El contexto del tenant se carga después del login.",
        "Si el build local no tiene Supabase Auth, podés usar token manual.",
      ];

  useEffect(() => {
    return () => {
      if (submitTimerRef.current !== null) {
        window.clearTimeout(submitTimerRef.current);
      }
    };
  }, []);

  if (accessToken) return <Navigate to={next} replace />;

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
    <main className="login-page">
      <section className="login-card">
        <div className="login-copy">
          <p className="profile-eyebrow">{isCustomerMode ? "Acceso cliente" : "Acceso interno"}</p>
          <h1>{isCustomerMode ? "Entrá para seguir tu experiencia como cliente" : "Entrá al centro operativo"}</h1>
          <p>
            {isCustomerMode
              ? "El acceso te deja continuar una reserva, revisar tus reservas activas y retomar el flujo sin perder contexto."
              : "Desde acá se habilita el backoffice del tenant para owner, administración y operación interna."}
          </p>
          <article className="overview-card">
            <h2>Qué pasa después</h2>
            <div className="overview-checklist">
              {checklist.map((step) => (
                <div key={step} className="overview-check overview-check--done">
                  <strong>✓</strong>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </article>
        </div>

        {isSupabaseConfigured ? (
          <form onSubmit={handleSubmit} aria-label="Iniciar sesión" className="login-form-card">
            <h2>{isCustomerMode ? "Ingresar para reservar" : "Ingresar al dashboard"}</h2>
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
            {isSubmitting ? (
              <button
                type="button"
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
          <div className="login-form-card">
            <h2>Acceso local con token</h2>
            <p>
              Supabase Auth no está configurado en este build. Pegá un access token válido del backend local para
              continuar con pruebas.
            </p>
            <label htmlFor="fixture-token">Access token</label>
            <input
              id="fixture-token"
              type="text"
              value={fixtureToken}
              onChange={(e) => setFixtureToken(e.target.value)}
            />
            <button type="button" onClick={() => signInWithToken(fixtureToken)} disabled={!fixtureToken.trim()}>
              Continuar
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
