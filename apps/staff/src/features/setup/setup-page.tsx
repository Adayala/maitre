import { useSession } from "../../app/session-context.js";
import { useAuth } from "../../app/auth-context.js";
import { StateView } from "../../components/state-view.js";

export function SetupPage() {
  const { signOut } = useAuth();
  const {
    tenants,
    isLoading,
    error,
    selectedTenantId,
    selectedBranchId,
    selectTenant,
    selectBranch,
  } = useSession();

  const activeTenant = tenants.find((t) => t.id === selectedTenantId) ?? null;
  const branches = activeTenant?.branches ?? [];
  const step: "tenant" | "branch" = !selectedTenantId ? "tenant" : "branch";

  return (
    <main className="setup">
      <div className="setup-card">
        <div className="setup-brand">
          <span aria-hidden="true">👑</span>
          <h1>Configurar owner</h1>
        </div>
        <ol className="setup-steps" aria-hidden="true">
          <li className={step === "tenant" ? "on" : selectedTenantId ? "done" : ""}>Empresa</li>
          <li className={step === "branch" ? "on" : selectedBranchId ? "done" : ""}>Sucursal</li>
        </ol>

        {step === "tenant" ? (
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
                <button key={t.id} type="button" className="option-btn" onClick={() => selectTenant(t.id)}>
                  {t.name}
                </button>
              ))}
            </div>
          </StateView>
        ) : null}

        {step === "branch" ? (
          <>
            <h2 className="setup-q">Elegí la sucursal por defecto</h2>
            <StateView
              isLoading={isLoading}
              error={error ?? null}
              isEmpty={branches.length === 0}
              emptyIcon="🏬"
              emptyTitle="Sin sucursales"
              emptyMessage="Esta empresa no tiene sucursales visibles para tu usuario."
            >
              <div className="setup-options">
                <button type="button" className="option-btn" onClick={() => selectBranch("")}>
                  <span>Todas las sucursales</span>
                  <span className="option-sub">Vista consolidada</span>
                </button>
                {branches.map((b) => (
                  <button key={b.id} type="button" className="option-btn" onClick={() => selectBranch(b.id)}>
                    <span>{b.name}</span>
                    <span className="option-sub">{b.code}</span>
                  </button>
                ))}
              </div>
            </StateView>
          </>
        ) : null}

        {selectedTenantId && tenants.length > 1 ? (
          <button type="button" className="btn btn--ghost setup-back" onClick={() => selectTenant("")}>
            ← Cambiar empresa
          </button>
        ) : null}

        <button type="button" className="btn btn--ghost setup-signout" onClick={() => signOut()}>
          Cerrar sesión
        </button>
      </div>
    </main>
  );
}
