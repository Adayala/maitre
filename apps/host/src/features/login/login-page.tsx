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
  const checklist = [
    "Ver llegadas próximas, reservas pendientes y walk-ins desde el atril.",
    "Asignar mesas con contexto de sala sin saltar entre herramientas.",
    "Mantener trazabilidad de espera, confirmación y seating durante el turno.",
  ];
  const focusAreas = [
    {
      title: "Recepción en tiempo real",
      description: "La app está pensada para tablet o teléfono en el atril, con lectura rápida y acciones táctiles.",
    },
    {
      title: "Reserva + waitlist",
      description: "Desde el acceso correcto, el host puede confirmar reservas, registrar walk-ins y ordenar prioridades.",
    },
    {
      title: "Sin fricción de contexto",
      description: "Después del login se resuelve tenant, sucursal y panel operativo para empezar a trabajar enseguida.",
    },
  ];

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
        <div className="login-layout">
          <div className="login-copy">
            <div className="login-brand">
              <span className="login-logo" aria-hidden="true">
                🧭
              </span>
              <div>
                <h1>Maitre Host</h1>
                <p className="login-sub">Reservas, lista de espera y asignación de mesas</p>
              </div>
            </div>

            <article className="login-panel">
              <p className="login-eyebrow">Front de recepción</p>
              <strong>Entrá para coordinar sala, llegadas y seating desde un solo flujo.</strong>
              <p>
                Esta app concentra la operación del host: leer próximas llegadas, resolver reservas pendientes y
                mantener la lista de espera sin perder visibilidad del salón.
              </p>
            </article>

            <article className="login-panel">
              <h2>Qué pasa después</h2>
              <div className="login-checklist">
                {checklist.map((step) => (
                  <div key={step} className="login-check login-check--done">
                    <strong>✓</strong>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </article>

            <div className="login-focus-grid" aria-label="Focos del host">
              {focusAreas.map((area) => (
                <article key={area.title} className="login-panel">
                  <h2>{area.title}</h2>
                  <p>{area.description}</p>
                </article>
              ))}
            </div>
          </div>

          {isSupabaseConfigured ? (
            <form onSubmit={handleSubmit} aria-label="Iniciar sesión" className="login-form-card">
              <h2>Ingresar al atril operativo</h2>
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
            <div className="login-fixture login-form-card">
              <h2>Acceso local con token</h2>
              <p>
                Este build local no tiene Supabase Auth. Pegá un access token válido para entrar al panel host
                y seguir probando el flujo operativo.
              </p>
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
      </div>
    </main>
  );
}
