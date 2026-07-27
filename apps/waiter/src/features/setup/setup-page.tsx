import { useSession } from "../../app/session-context.js";
import { useAuth } from "../../app/auth-context.js";
import { StateView } from "../../components/state-view.js";

// One-time (sticky) device setup: pick tenant → branch. Each level auto-resolves
// when there is a single option, so most waiters tap nothing and go straight to
// the floor. Re-entered from the floor header's "Cambiar sucursal".
export function SetupPage() {
  const { signOut } = useAuth();
  const {
    tenants,
    isLoading,
    error,
    selectedTenantId,
    selectTenant,
    selectBranch,
  } = useSession();

  const activeTenant = tenants.find((t) => t.id === selectedTenantId) ?? null;
  const branches = activeTenant?.branches ?? [];
  const step: "tenant" | "branch" = selectedTenantId ? "branch" : "tenant";

  return (
    <main className="setup">
      <div className="setup-card">
        <div className="setup-brand">
          <span aria-hidden="true">🧑‍🍳</span>
          <h1>Configurar dispositivo</h1>
        </div>
        <ol className="setup-steps" aria-hidden="true">
          <li className={step === "tenant" ? "on" : selectedTenantId ? "done" : ""}>Empresa</li>
          <li className={step === "branch" ? "on" : ""}>Sucursal</li>
        </ol>

        {step === "tenant" && (
          <StateView
            isLoading={isLoading}
            error={error ?? null}
            isEmpty={tenants.length === 0}
            loadingLabel="Cargando empresas…"
            emptyIcon="🏢"
            emptyTitle="Sin acceso"
            emptyMessage="Tu usuario no tiene empresas asignadas."
          >
            <h2 className="setup-q">Elegí la empresa</h2>
            <div className="setup-options">
              {tenants.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className="option-btn"
                  onClick={() => selectTenant(t.id)}
                >
                  {t.name}
                </button>
              ))}
            </div>
          </StateView>
        )}

        {step === "branch" && (
          <>
            <h2 className="setup-q">Elegí la sucursal</h2>
            <StateView
              isLoading={isLoading}
              error={error ?? null}
              isEmpty={branches.length === 0}
              emptyIcon="🏬"
              emptyTitle="Sin sucursales"
              emptyMessage="Esta empresa no tiene sucursales visibles para tu usuario."
            >
              <div className="setup-options">
                {branches.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    className="option-btn"
                    onClick={() => selectBranch(b.id)}
                  >
                    <span>{b.name}</span>
                    <span className="option-sub">{b.code}</span>
                  </button>
                ))}
              </div>
            </StateView>
            {tenants.length > 1 && (
              <button
                type="button"
                className="btn btn--ghost setup-back"
                onClick={() => selectTenant("")}
              >
                ← Cambiar empresa
              </button>
            )}
          </>
        )}

        <button type="button" className="btn btn--ghost setup-signout" onClick={() => signOut()}>
          Cerrar sesión
        </button>
      </div>
    </main>
  );
}
