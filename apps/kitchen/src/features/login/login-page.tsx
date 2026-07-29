import { useState, type FormEvent } from "react";
import { useAuth, isSupabaseConfigured } from "../../app/auth-context.js";

// Login for the KDS. Deliberately minimal: a kitchen tablet signs in once and
// stays signed in for the shift. Supabase is the normal path; fixture-token
// access remains only for local fallback builds without Supabase config.
export function LoginPage() {
  const { signInWithPassword, signInWithToken } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fixtureToken, setFixtureToken] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const checklist = [
    "Entrar a la estación correcta para tomar, preparar y entregar comandas.",
    "Ver alertas, prioridad y tiempos de cocina sin depender de otras pantallas.",
    "Mantener foco operativo durante el turno con lectura rápida y acciones táctiles.",
  ];
  const focusAreas = [
    {
      title: "Toma y priorización",
      description: "Después del acceso, la cocina puede reclamar comandas y ordenar el trabajo por urgencia o flujo.",
    },
    {
      title: "Preparación visible",
      description: "La pantalla concentra timers, estado de preparación, alertas y handoff para cada estación.",
    },
    {
      title: "Continuidad del turno",
      description: "La app está pensada para quedar abierta durante servicio y sostener un ritmo de operación continuo.",
    },
  ];

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
        <div className="login-layout">
          <div className="login-copy">
            <div className="login-brand">
              <span className="login-logo" aria-hidden="true">
                🍳
              </span>
              <div>
                <h1>Maitre Cocina</h1>
                <p className="login-sub">Kitchen Display System por estación</p>
              </div>
            </div>

            <article className="login-panel">
              <p className="login-eyebrow">Front de producción</p>
              <strong>Entrá para tomar comandas, seguir tiempos y coordinar handoff desde la estación.</strong>
              <p>
                Esta app concentra la operación de cocina: recibir trabajo, medir urgencia, ejecutar preparación y
                dejar visible cuándo cada plato está listo para entregar.
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

            <div className="login-focus-grid" aria-label="Focos de cocina">
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
              <h2>Ingresar a la estación</h2>
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
            <div className="login-fixture login-form-card">
              <h2>Acceso local con token</h2>
              <p>
                Supabase Auth no está configurado en este build. Pegá un access token válido para continuar con la
                estación de cocina en entorno local.
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
