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
  const summary = getSetupSummary(step, {
    tenantCount: tenants.length,
    branchCount: branches.length,
    registerCount: registers.length,
  });
  const checklist = [
    { label: "Empresa resuelta", done: Boolean(selectedTenantId) },
    { label: "Sucursal resuelta", done: Boolean(selectedBranchId) },
    { label: "Caja lista para operar", done: step !== "register" ? false : registers.length > 0 },
  ];

  return (
    <main className="setup">
      <div className="setup-card">
        <div className="setup-brand">
          <span aria-hidden="true">💳</span>
          <h1>Configurar caja</h1>
        </div>

        <article className="setup-panel">
          <p className="setup-eyebrow">Arranque operativo</p>
          <strong>{summary.title}</strong>
          <p>{summary.message}</p>
        </article>

        <ol className="setup-steps" aria-hidden="true">
          <li className={step === "tenant" ? "on" : selectedTenantId ? "done" : ""}>Empresa</li>
          <li className={step === "branch" ? "on" : selectedBranchId ? "done" : ""}>Sucursal</li>
          <li className={step === "register" ? "on" : ""}>Caja</li>
        </ol>

        <div className="setup-checklist" aria-label="Estado de configuración">
          {checklist.map((item) => (
            <div key={item.label} className={`setup-check ${item.done ? "setup-check--done" : ""}`}>
              <strong>{item.done ? "✓" : "•"}</strong>
              <span>{item.label}</span>
            </div>
          ))}
        </div>

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
            <p className="setup-hint">Primero definimos qué tenant comercial vas a operar desde esta caja.</p>
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
            <p className="setup-hint">Ahora definimos en qué sede va a trabajar esta caja durante el turno.</p>
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
            <p className="setup-hint">El último paso es fijar la caja física o lógica sobre la que vas a abrir sesión.</p>
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

function getSetupSummary(
  step: "tenant" | "branch" | "register",
  counts: { tenantCount: number; branchCount: number; registerCount: number },
) {
  if (step === "tenant") {
    return {
      title: "Primero elegí la empresa",
      message: `Hay ${counts.tenantCount} empresa(s) visible(s) para tu usuario. Esta elección define el resto del contexto operativo.`,
    };
  }

  if (step === "branch") {
    return {
      title: "Ahora elegí la sucursal",
      message: `La empresa ya quedó resuelta. Tenés ${counts.branchCount} sucursal(es) disponibles para seguir con la caja correcta.`,
    };
  }

  return {
    title: "Último paso: fijar la caja del turno",
    message: `Quedan ${counts.registerCount} caja(s) visible(s) en esta sucursal. Cuando elijas una, entrás al flujo operativo completo.`,
  };
}
