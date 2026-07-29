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
  const summary = getSetupSummary(step, {
    tenantCount: tenants.length,
    branchCount: branches.length,
  });
  const checklist = [
    { label: "Empresa resuelta", done: Boolean(selectedTenantId) },
    { label: "Sucursal lista para recibir", done: step === "branch" ? branches.length > 0 : false },
  ];

  return (
    <main className="setup">
      <div className="setup-card">
        <div className="setup-brand">
          <span aria-hidden="true">🧭</span>
          <h1>Configurar host</h1>
        </div>

        <article className="setup-panel">
          <p className="setup-eyebrow">Arranque de recepción</p>
          <strong>{summary.title}</strong>
          <p>{summary.message}</p>
        </article>

        <ol className="setup-steps" aria-hidden="true">
          <li className={step === "tenant" ? "on" : selectedTenantId ? "done" : ""}>Empresa</li>
          <li className={step === "branch" ? "on" : selectedBranchId ? "done" : ""}>Sucursal</li>
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
            <p className="setup-hint">Primero definimos qué restaurante o tenant va a atender este dispositivo de host.</p>
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
            <h2 className="setup-q">Elegí la sucursal de trabajo</h2>
            <p className="setup-hint">Ahora definimos en qué sede va a operar recepción durante el turno.</p>
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

function getSetupSummary(
  step: "tenant" | "branch",
  counts: { tenantCount: number; branchCount: number },
) {
  if (step === "tenant") {
    return {
      title: "Primero elegí la empresa",
      message: `Hay ${counts.tenantCount} empresa(s) visible(s) para tu usuario. Esta selección define el contexto de recepción.`,
    };
  }

  return {
    title: "Último paso: fijar la sucursal del turno",
    message: `La empresa ya quedó resuelta. Tenés ${counts.branchCount} sucursal(es) disponibles para entrar al panel host correcto.`,
  };
}
