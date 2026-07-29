import { useState, type FormEvent } from "react";
import { useAuth, isSupabaseConfigured } from "../../app/auth-context.js";

export function LoginPage() {
  const { signInWithPassword, signInWithToken } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fixtureToken, setFixtureToken] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const checklist = [
    "Abrir caja, seguir cobros y controlar cierres desde una sola pantalla.",
    "Tener a mano sesiones, checks abiertos y conciliación sin cambiar de app.",
    "Entrar directo al contexto operativo de la caja del turno.",
  ];
  const focusAreas = [
    {
      title: "Cobro táctil",
      description: "La experiencia está pensada para operar rápido sobre tablet o puesto fijo con acciones claras.",
    },
    {
      title: "Seguimiento de sesión",
      description: "Después del acceso, la app orienta apertura, movimientos, pagos y cierre de caja.",
    },
    {
      title: "Menos fricción operativa",
      description: "El login correcto evita saltos entre herramientas y concentra caja, checks y conciliación.",
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
                💳
              </span>
              <div>
                <h1>Maitre Caja</h1>
                <p className="login-sub">Cobros, sesión de caja y conciliación operativa</p>
              </div>
            </div>

            <article className="login-panel">
              <p className="login-eyebrow">Front de cobro</p>
              <strong>Entrá para operar pagos, sesión de caja y seguimiento de checks desde el mismo flujo.</strong>
              <p>
                Esta app concentra la capa de caja del restaurante: abrir sesión, monitorear movimientos, resolver
                cobros y dejar visible el estado financiero del turno.
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

            <div className="login-focus-grid" aria-label="Focos de caja">
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
              <h2>Ingresar a caja</h2>
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
            <div className="login-fixture login-form-card">
              <h2>Acceso local con token</h2>
              <p>
                Este build local no tiene Supabase Auth. Pegá un access token válido para entrar a la app de caja
                y continuar con pruebas operativas.
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
