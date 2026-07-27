import { useTenantQuery } from "../../lib/use-tenant-query.js";
import { StateView } from "../../components/state-view.js";

interface Brand {
  id: string;
  name: string;
  slug: string;
  status: string;
}

export function BrandsPage() {
  const { data, isLoading, error, refetch } = useTenantQuery<{ data: Brand[] }>(
    "brands",
    "/v1/brands",
  );
  const brands = data?.data ?? [];
  const activeBrands = brands.filter((brand) => isBrandActive(brand.status));
  const inactiveBrands = brands.filter((brand) => !isBrandActive(brand.status));
  const summary = getBrandsSummary(brands.length, activeBrands.length, inactiveBrands.length);
  const checklist = [
    { label: "Al menos una marca creada", done: brands.length > 0 },
    { label: "Slug visible", done: brands.every((brand) => brand.slug.trim().length > 0) && brands.length > 0 },
    { label: "Marca publicable", done: activeBrands.length > 0 },
    { label: "Base comercial relevada", done: brands.length > 0 },
  ];

  return (
    <section aria-labelledby="brands-heading" className="overview-page">
      <h1 id="brands-heading">Marcas</h1>
      <StateView
        isLoading={isLoading}
        error={error as Error | null}
        isEmpty={brands.length === 0}
        emptyMessage="Todavía no hay marcas creadas."
        onRetry={() => void refetch()}
      >
        {brands.length > 0 && (
          <>
            <article className={`overview-priority overview-priority--${summary.tone}`}>
              <div className="overview-priority__copy">
                <span className="overview-priority__eyebrow">Estado comercial</span>
                <strong>{summary.title}</strong>
                <p>{summary.message}</p>
              </div>
            </article>

            <dl className="kpi-grid">
              <div>
                <dt>Marcas</dt>
                <dd>{brands.length}</dd>
              </div>
              <div>
                <dt>Activas</dt>
                <dd>{activeBrands.length}</dd>
              </div>
              <div>
                <dt>A revisar</dt>
                <dd>{inactiveBrands.length}</dd>
              </div>
              <div>
                <dt>Slugs definidos</dt>
                <dd>{brands.filter((brand) => brand.slug.trim().length > 0).length}</dd>
              </div>
            </dl>

            <article className="overview-card">
              <h2>Checklist de publicación</h2>
              <div className="overview-checklist">
                {checklist.map((step) => (
                  <div key={step.label} className={`overview-check ${step.done ? "overview-check--done" : ""}`}>
                    <strong>{step.done ? "✓" : "•"}</strong>
                    <span>{step.label}</span>
                  </div>
                ))}
              </div>
            </article>

            <section className="profile-module-grid" aria-label="Resumen de marcas">
              {brands.map((brand) => {
                const status = describeBrandStatus(brand.status);
                return (
                  <article key={brand.id} className="profile-card">
                    <p className="profile-eyebrow">{status.label}</p>
                    <h2>{brand.name}</h2>
                    <p>
                      Slug <strong>{brand.slug}</strong>
                    </p>
                    <p>{status.message}</p>
                  </article>
                );
              })}
            </section>

            <article className="overview-card">
              <h2>Detalle tabular</h2>
              <table>
                <caption className="sr-only">Listado de marcas</caption>
                <thead>
                  <tr>
                    <th scope="col">Nombre</th>
                    <th scope="col">Slug</th>
                    <th scope="col">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {brands.map((brand) => (
                    <tr key={brand.id}>
                      <td>{brand.name}</td>
                      <td>{brand.slug}</td>
                      <td>{brand.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </article>
          </>
        )}
      </StateView>
    </section>
  );
}

function normalizeBrandStatus(status: string) {
  return status.trim().toUpperCase();
}

function isBrandActive(status: string) {
  const normalized = normalizeBrandStatus(status);
  return normalized === "ACTIVE" || normalized === "PUBLISHED" || normalized === "ENABLED";
}

function describeBrandStatus(status: string) {
  if (isBrandActive(status)) {
    return {
      label: "Lista para comunicar",
      message: "La marca aparece en estado apto para ser usada como referencia comercial y pública.",
    };
  }

  return {
    label: "Revisar publicación",
    message: "Conviene validar estado y visibilidad antes de usar esta marca como eje comercial principal.",
  };
}

function getBrandsSummary(total: number, active: number, inactive: number) {
  if (total === 0) {
    return {
      tone: "warning" as const,
      title: "Todavía no hay marcas cargadas",
      message: "Sin una marca visible cuesta ordenar catálogo, sedes y experiencia pública del tenant.",
    };
  }

  if (active === 0) {
    return {
      tone: "warning" as const,
      title: "Hay marcas, pero ninguna parece publicada",
      message: "La estructura comercial existe, aunque todavía no se ve una marca lista para sostener la experiencia visible.",
    };
  }

  if (inactive > 0) {
    return {
      tone: "info" as const,
      title: "Base comercial armada con pendientes",
      message: `Hay ${inactive} marca(s) para revisar antes de tomarlas como habilitadas en todos los frentes.`,
    };
  }

  return {
    tone: "success" as const,
    title: "Marcas listas para sostener operación y experiencia pública",
    message: "La capa comercial visible ya muestra una base consistente para seguir afinando owner app y experiencia cliente.",
  };
}
