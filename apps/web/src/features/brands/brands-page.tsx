import { useTenantQuery } from "../../lib/use-tenant-query.js";
import { StateView } from "../../components/state-view.js";
import { Link } from "react-router-dom";

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
  const pendingChecklist = checklist.filter((step) => !step.done).map((step) => step.label);
  const nextStep = getBrandsNextStep({
    total: brands.length,
    active: activeBrands.length,
    inactive: inactiveBrands.length,
  });
  const brandQuickLinks = [
    {
      eyebrow: "Sedes",
      label: "Branches",
      detail: "Cruzar si las marcas visibles ya tienen sucursales listas para operar o mostrarse al cliente.",
      to: "/branches",
    },
    {
      eyebrow: "Experiencia",
      label: "Web pública · Cliente",
      detail: "Validar si la capa comercial ya alcanza para discovery, promociones y reservas.",
      to: "/profiles",
    },
    {
      eyebrow: "Gobierno",
      label: "Settings / Subscription",
      detail: "Conectar marca visible con configuración del tenant y capacidades contratadas.",
      to: "/settings",
    },
  ];
  const brandStageCards = [
    {
      label: "Crear",
      title: brands.length > 0 ? `${brands.length} marca(s) cargada(s)` : "Falta primera marca",
      detail:
        brands.length > 0
          ? "La base comercial ya existe dentro del tenant."
          : "El owner todavía necesita definir la marca que va a ordenar catálogo y experiencia.",
      tone: brands.length > 0 ? "success" : "warning",
      to: "/brands",
    },
    {
      label: "Publicar",
      title: activeBrands.length > 0 ? `${activeBrands.length} activa(s)` : "Nada visible todavía",
      detail:
        activeBrands.length > 0
          ? "Ya hay al menos una referencia comercial lista para usarse."
          : "Conviene habilitar una marca visible antes de seguir abriendo frentes.",
      tone: activeBrands.length > 0 ? "success" : "warning",
      to: "/brands",
    },
    {
      label: "Conectar",
      title: "Marcas con sedes",
      detail: "El siguiente control útil es validar si cada marca visible ya aterriza en sucursales reales.",
      tone: "info",
      to: "/branches",
    },
    {
      label: "Exponer",
      title: "Experiencia pública",
      detail: "Después conviene cruzar marcas con perfiles y experiencia cliente.",
      tone: "info",
      to: "/profiles",
    },
  ] as const;

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
              <p>
                {pendingChecklist.length > 0
                  ? `Todavía conviene resolver: ${pendingChecklist.join(", ")}.`
                  : "La capa comercial visible ya quedó suficientemente armada para seguir afinando experiencia y operación."}
              </p>
            </article>

            <article className="overview-card">
              <h2>Siguiente paso recomendado</h2>
              <div className="overview-link-grid">
                <Link className="overview-link-card overview-link-card--primary" to={nextStep.to}>
                  <span>{nextStep.eyebrow}</span>
                  <strong>{nextStep.label}</strong>
                  <p>{nextStep.detail}</p>
                </Link>
              </div>
            </article>

            <article className="overview-card">
              <h2>Ciclo comercial</h2>
              <div className="owner-stage-grid">
                {brandStageCards.map((card) => (
                  <Link key={card.label} className={`owner-stage-card owner-stage-card--${card.tone}`} to={card.to}>
                    <span>{card.label}</span>
                    <strong>{card.title}</strong>
                    <p>{card.detail}</p>
                  </Link>
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
              <h2>Atajos relacionados</h2>
              <div className="overview-link-grid">
                {brandQuickLinks.map((link) => (
                  <Link key={link.label} className="overview-link-card" to={link.to}>
                    <span>{link.eyebrow}</span>
                    <strong>{link.label}</strong>
                    <p>{link.detail}</p>
                  </Link>
                ))}
              </div>
            </article>

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

function getBrandsNextStep({
  total,
  active,
  inactive,
}: {
  total: number;
  active: number;
  inactive: number;
}) {
  if (total === 0) {
    return {
      eyebrow: "Capa comercial",
      label: "Crear primera marca",
      detail: "Sin una marca visible cuesta ordenar catálogo, sedes y experiencia pública del tenant.",
      to: "/brands",
    };
  }

  if (active === 0) {
    return {
      eyebrow: "Publicación",
      label: "Habilitar una marca visible",
      detail: "La estructura comercial existe, pero todavía falta una marca plenamente utilizable como referencia pública.",
      to: "/brands",
    };
  }

  if (inactive > 0) {
    return {
      eyebrow: "Normalización",
      label: "Revisar marcas pendientes",
      detail: "Conviene resolver estados incompletos antes de apoyarse en esas marcas para todos los frentes del tenant.",
      to: "/brands",
    };
  }

  return {
    eyebrow: "Siguiente control",
    label: "Cruzar marca con sedes y experiencia",
    detail: "Con la base comercial lista, el próximo paso útil es validar cómo se proyecta en sucursales y superficies públicas.",
    to: "/branches",
  };
}
