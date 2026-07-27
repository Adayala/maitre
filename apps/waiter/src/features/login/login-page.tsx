import { useState, type FormEvent } from "react";
import { useAuth, isSupabaseConfigured } from "../../app/auth-context.js";

// Login for the waiter app. Supabase is the normal path; fixture-token access
// remains only for local fallback builds without Supabase config.
export function LoginPage() {
  const { signInWithPassword, signInWithToken } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fixtureToken, setFixtureToken] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const checklist = [
    "Ver mesas activas, visitas y pedidos sin perder tiempo en navegación.",
    "Tomar órdenes, seguir estado y volver rápido al piso del salón.",
    "Entrar directo al contexto operativo del turno y la sucursal.",
  ];
  const focusAreas = [
    {
      title: "Piso del salón",
      description: "La app está pensada para mozos en movimiento, con acceso rápido a mesas, visitas y cuenta.",
    },
    {
      title: "Pedido en curso",
      description: "Después del acceso, el flujo prioriza abrir mesa, cargar pedido y seguir estado de entrega.",
    },
    {
      title: "Menos fricción de servicio",
      description: "El login correcto evita perder contexto y ayuda a sostener ritmo durante todo el turno.",
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
                🧑‍🍳
              </span>
              <div>
                <h1>Maitre Salón</h1>
                <p className="login-sub">Mesas, visitas y toma de pedido en piso</p>
              </div>
            </div>

            <article className="login-panel">
              <p className="login-eyebrow">Front de servicio</p>
              <strong>Entrá para operar mesas, visitas y pedidos desde el flujo del salón.</strong>
              <p>
                Esta app concentra la operación del mozo: leer el estado del piso, abrir visitas, cargar pedidos y
                sostener seguimiento de cada mesa sin salir del contexto de servicio.
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

            <div className="login-focus-grid" aria-label="Focos de salón">
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
              <h2>Ingresar al salón</h2>
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
                app de salón en entorno local.
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
