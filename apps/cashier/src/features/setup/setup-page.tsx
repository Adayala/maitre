import { useQuery } from "@tanstack/react-query";
import { useSession } from "../../app/session-context.js";
import { useAuth } from "../../app/auth-context.js";
import { StateView } from "../../components/state-view.js";
import { useApi } from "../../app/use-api.js";
import type { ApiData, CashRegister } from "../../lib/cashier-types.js";

export function SetupPage() {
  const { signOut } = useAuth();
  const api = useApi();
  const {
    tenants,
    isLoading,
    error,
    selectedTenantId,
    selectedBranchId,
    selectTenant,
    selectBranch,
    selectRegister,
  } = useSession();

  const activeTenant = tenants.find((t) => t.id === selectedTenantId) ?? null;
  const branches = activeTenant?.branches ?? [];
  const registerQuery = useQuery({
    queryKey: ["cashier-registers", selectedBranchId],
    enabled: Boolean(selectedBranchId),
    queryFn: () => api<ApiData<CashRegister[]>>(`/v1/branches/${selectedBranchId}/cash-registers`),
  });
  const registers = registerQuery.data?.data ?? [];

  const step: "tenant" | "branch" | "register" = !selectedTenantId
    ? "tenant"
    : !selectedBranchId
      ? "branch"
      : "register";

  return (
    <main className="setup">
      <div className="setup-card">
        <div className="setup-brand">
          <span aria-hidden="true">💳</span>
          <h1>Configurar caja</h1>
        </div>
        <ol className="setup-steps" aria-hidden="true">
          <li className={step === "tenant" ? "on" : selectedTenantId ? "done" : ""}>Empresa</li>
          <li className={step === "branch" ? "on" : selectedBranchId ? "done" : ""}>Sucursal</li>
          <li className={step === "register" ? "on" : ""}>Caja</li>
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
                  <button key={b.id} type="button" className="option-btn" onClick={() => selectBranch(b.id)}>
                    <span>{b.name}</span>
                    <span className="option-sub">{b.code}</span>
                  </button>
                ))}
              </div>
            </StateView>
          </>
        ) : null}

        {step === "register" ? (
          <>
            <h2 className="setup-q">Elegí la caja</h2>
            <StateView
              isLoading={registerQuery.isLoading}
              error={(registerQuery.error as Error) ?? null}
              isEmpty={registers.length === 0}
              emptyIcon="🧾"
              emptyTitle="Sin cajas"
              emptyMessage="Esta sucursal no tiene cajas visibles para tu usuario."
            >
              <div className="setup-options">
                {registers.map((register) => (
                  <button
                    key={register.id}
                    type="button"
                    className="option-btn"
                    onClick={() => selectRegister(register.id)}
                  >
                    <span>{register.displayName}</span>
                    <span className="option-sub">{register.code}</span>
                  </button>
                ))}
              </div>
            </StateView>
          </>
        ) : null}

        {selectedBranchId ? (
          <button type="button" className="btn btn--ghost setup-back" onClick={() => selectBranch("")}>
            ← Cambiar sucursal
          </button>
        ) : selectedTenantId && tenants.length > 1 ? (
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
