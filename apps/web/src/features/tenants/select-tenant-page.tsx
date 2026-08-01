import { useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../../app/auth-context.js";
import { useTenantContext } from "../../app/tenant-context.js";

export function SelectTenantPage() {
  const navigate = useNavigate();
  const { accessToken } = useAuth();
  const { me, selectedTenantId, selectTenant, isLoading, error } =
    useTenantContext();
  const tenants = me?.tenants ?? [];

  useEffect(() => {
    const onlyTenant = tenants.length === 1 ? tenants[0] : undefined;
    if (onlyTenant && selectedTenantId !== onlyTenant.id)
      selectTenant(onlyTenant.id);
  }, [selectedTenantId, selectTenant, tenants]);

  if (!accessToken) return <Navigate to="/login" replace />;
  if (isLoading)
    return (
      <main id="main-content" className="tenant-select">
        <p role="status">Cargando organizaciones…</p>
      </main>
    );
  if (error) {
    return (
      <main id="main-content" className="tenant-select">
        <section
          className="tenant-select__frame"
          aria-labelledby="tenant-error-heading"
        >
          <p className="tenant-select__kicker">Acceso organizacional</p>
          <h1 id="tenant-error-heading">No pudimos cargar tus tenants</h1>
          <p role="alert">{error.message}</p>
          <button type="button" onClick={() => window.location.reload()}>
            Reintentar
          </button>
        </section>
      </main>
    );
  }
  if (tenants.length === 1) return <Navigate to="/" replace />;

  return (
    <main id="main-content" className="tenant-select">
      <section
        className="tenant-select__frame"
        aria-labelledby="tenant-select-heading"
      >
        <header className="tenant-select__header">
          <p className="tenant-select__kicker">Paso 01 / Contexto operativo</p>
          <h1 id="tenant-select-heading">¿Qué organización vas a gestionar?</h1>
          <p>
            Tu elección define el perímetro de datos y permisos de esta sesión.
          </p>
        </header>
        {tenants.length > 0 ? (
          <div
            className="tenant-grid"
            role="list"
            aria-label="Tenants disponibles"
          >
            {tenants.map((tenant, index) => (
              <div role="listitem" key={tenant.id}>
                <button
                  type="button"
                  className={
                    tenant.id === selectedTenantId
                      ? "tenant-card tenant-card--active"
                      : "tenant-card"
                  }
                  onClick={() => {
                    selectTenant(tenant.id);
                    navigate("/");
                  }}
                >
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <strong>{tenant.name}</strong>
                  <small>
                    {tenant.branches.length} sucursal(es) disponibles
                  </small>
                  <b aria-hidden="true">→</b>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <article className="tenant-select__empty">
            <h2>No tenés tenants disponibles</h2>
            <p>
              Pedile a un administrador que te asigne una organización antes de
              continuar.
            </p>
          </article>
        )}
      </section>
    </main>
  );
}
