import { useSession } from "../../app/session-context.js";
import { useStation } from "../../app/station-context.js";
import { useAuth } from "../../app/auth-context.js";
import { StateView } from "../../components/state-view.js";

// The one-time (sticky) device setup cascade: pick tenant → branch → station.
// Each level auto-resolves when there's a single option, so most kitchens only
// ever tap the station. Shown whenever any level is unresolved; re-entered via
// the header's "Cambiar estación".
export function SetupPage() {
  const { signOut } = useAuth();
  const {
    tenants,
    isLoading: sessionLoading,
    error: sessionError,
    selectedTenantId,
    selectedBranchId,
    selectTenant,
    selectBranch,
  } = useSession();
  const {
    stations,
    isLoading: stationsLoading,
    error: stationsError,
    selectStation,
  } = useStation();

  const activeTenant = tenants.find((t) => t.id === selectedTenantId) ?? null;
  const branches = activeTenant?.branches ?? [];

  let step: "tenant" | "branch" | "station" = "tenant";
  if (selectedTenantId) step = selectedBranchId ? "station" : "branch";
  const summary = getSetupSummary(step, {
    tenantCount: tenants.length,
    branchCount: branches.length,
    stationCount: stations.length,
  });
  const checklist = [
    { label: "Empresa resuelta", done: Boolean(selectedTenantId) },
    { label: "Sucursal resuelta", done: Boolean(selectedBranchId) },
    { label: "Estación lista para cocinar", done: step === "station" ? stations.length > 0 : false },
  ];

  return (
    <main className="setup">
      <div className="setup-card">
        <div className="setup-brand">
          <span aria-hidden="true">🍳</span>
          <h1>Configurar dispositivo</h1>
        </div>

        <article className="setup-panel">
          <p className="setup-eyebrow">Arranque de estación</p>
          <strong>{summary.title}</strong>
          <p>{summary.message}</p>
        </article>

        <ol className="setup-steps" aria-hidden="true">
          <li className={step === "tenant" ? "on" : selectedTenantId ? "done" : ""}>Empresa</li>
          <li className={step === "branch" ? "on" : selectedBranchId ? "done" : ""}>Sucursal</li>
          <li className={step === "station" ? "on" : ""}>Estación</li>
        </ol>

        <div className="setup-checklist" aria-label="Estado de configuración">
          {checklist.map((item) => (
            <div key={item.label} className={`setup-check ${item.done ? "setup-check--done" : ""}`}>
              <strong>{item.done ? "✓" : "•"}</strong>
              <span>{item.label}</span>
            </div>
          ))}
        </div>

        {step === "tenant" && (
          <StateView
            isLoading={sessionLoading}
            error={sessionError ?? null}
            isEmpty={tenants.length === 0}
            loadingLabel="Cargando empresas…"
            emptyIcon="🏢"
            emptyTitle="Sin acceso"
            emptyMessage="Tu usuario no tiene empresas asignadas."
          >
            <h2 className="setup-q">Elegí la empresa</h2>
            <p className="setup-hint">Primero definimos para qué restaurante o tenant va a operar este dispositivo de cocina.</p>
            <div className="setup-options">
              {tenants.map((t) => (
                <button key={t.id} type="button" className="option-btn" onClick={() => selectTenant(t.id)}>
                  {t.name}
                </button>
              ))}
            </div>
          </StateView>
        )}

        {step === "branch" && (
          <>
            <h2 className="setup-q">Elegí la sucursal</h2>
            <p className="setup-hint">Ahora definimos en qué sede va a cocinar esta estación durante el turno.</p>
            <StateView isLoading={sessionLoading} error={sessionError ?? null} isEmpty={branches.length === 0} emptyIcon="🏬" emptyTitle="Sin sucursales" emptyMessage="Esta empresa no tiene sucursales visibles para tu usuario.">
              <div className="setup-options">
                {branches.map((b) => (
                  <button key={b.id} type="button" className="option-btn" onClick={() => selectBranch(b.id)}>
                    <span>{b.name}</span>
                    <span className="option-sub">{b.code}</span>
                  </button>
                ))}
              </div>
            </StateView>
            {tenants.length > 1 && (
              <button type="button" className="btn btn--ghost setup-back" onClick={() => selectTenant("")}>
                ← Cambiar empresa
              </button>
            )}
          </>
        )}

        {step === "station" && (
          <>
            <h2 className="setup-q">¿Qué estación es este dispositivo?</h2>
            <p className="setup-hint">El último paso es fijar la estación que va a tomar y producir comandas desde este dispositivo.</p>
            <StateView
              isLoading={stationsLoading}
              error={stationsError ?? null}
              isEmpty={stations.length === 0}
              loadingLabel="Cargando estaciones…"
              emptyIcon="🍽️"
              emptyTitle="Sin estaciones"
              emptyMessage="No hay estaciones activas en esta sucursal. Pedile a un encargado que cree una."
            >
              <div className="setup-options">
                {stations.map((s) => (
                  <button key={s.id} type="button" className="option-btn option-btn--station" onClick={() => selectStation(s.id)}>
                    <span className="option-station-name">{s.displayName}</span>
                    <span className="option-sub">
                      {s.code}
                      {s.capabilities.length > 0 && ` · ${s.capabilities.join(", ")}`}
                    </span>
                  </button>
                ))}
              </div>
            </StateView>
            {branches.length > 1 && (
              <button type="button" className="btn btn--ghost setup-back" onClick={() => selectBranch("")}>
                ← Cambiar sucursal
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

function getSetupSummary(
  step: "tenant" | "branch" | "station",
  counts: { tenantCount: number; branchCount: number; stationCount: number },
) {
  if (step === "tenant") {
    return {
      title: "Primero elegí la empresa",
      message: `Hay ${counts.tenantCount} empresa(s) visible(s) para tu usuario. Esta selección define el contexto de la cocina.`,
    };
  }

  if (step === "branch") {
    return {
      title: "Ahora elegí la sucursal",
      message: `La empresa ya quedó resuelta. Tenés ${counts.branchCount} sucursal(es) disponibles para ubicar esta estación.`,
    };
  }

  return {
    title: "Último paso: fijar la estación del turno",
    message: `Quedan ${counts.stationCount} estación(es) visible(s) en esta sucursal. Cuando elijas una, entrás al KDS operativo.`,
  };
}
