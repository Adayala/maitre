import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  prefetchOnIntent,
  preloadReservationCreationExperience,
} from "../../lib/route-prefetch.js";
const PUBLIC_MENU_TOKEN = "demo-qr-menu-token";

interface PublicMenuPayload {
  data: {
    menu: {
      name: string;
      slug: string;
      asOf: string;
    };
    categories: Array<{
      name: string;
      products: Array<{
        name: string;
        priceMinorUnits: number;
        currency: string;
        allergens?: string[];
      }>;
    }>;
  };
}

export function PublicMenuPage() {
  const reservePrefetchProps = prefetchOnIntent(preloadReservationCreationExperience);
  const menuQuery = useQuery({
    queryKey: ["public-menu-live", PUBLIC_MENU_TOKEN],
    queryFn: async () => {
      const response = await fetch(`http://127.0.0.1:3001/public/menu/${PUBLIC_MENU_TOKEN}`);
      if (!response.ok) throw new Error("No se pudo cargar el menú público");
      return (await response.json()) as PublicMenuPayload;
    },
  });
  const liveMenuData = menuQuery.data?.data ?? null;
  const categories = liveMenuData?.categories ?? [];
  const products = categories.flatMap((category) => category.products ?? []);
  const menuSnapshot = liveMenuData ? new Date(liveMenuData.menu.asOf).toLocaleString("es-AR") : "—";
  const menuChecklist = [
    { label: "El menú público cargó correctamente", done: Boolean(liveMenuData) },
    { label: "Hay categorías visibles para explorar", done: categories.length > 0 },
    { label: "Hay productos concretos para evaluar", done: products.length > 0 },
  ];
  const menuPending = menuChecklist.filter((step) => !step.done).map((step) => step.label);
  const menuRoutes = [
    {
      badge: "Siguiente acción",
      title: "Reservar desde el menú",
      description: "Si ya encontraste una propuesta que te interesa, podés pasar directo al flujo de reserva.",
      to: "/public/reservations/new",
      cta: "Reservar ahora",
      accent: true,
      prefetch: reservePrefetchProps,
    },
    {
      badge: "Comparar opciones",
      title: "Revisar sucursales",
      description: "Útil para elegir mejor la sede antes de cerrar una salida.",
      to: "/public/branches",
      cta: "Ver sucursales",
    },
    {
      badge: "Discovery",
      title: "Explorar promociones",
      description: "Si todavía estás evaluando la propuesta, podés complementar el menú con campañas vigentes.",
      to: "/public/promotions",
      cta: "Ver promociones",
    },
  ];

  return (
    <section className="public-page" aria-labelledby="public-menu-heading">
      <article className="public-hero-card">
        <p className="profile-eyebrow">Consulta pública</p>
        <h1 id="public-menu-heading">Menú público</h1>
        <p>
          Vista pública del menú conectada a la surface real del backend para explorar la oferta antes de reservar
          o visitar una sucursal.
        </p>

        <div className="public-journey-strip" aria-label="Recorrido sugerido">
          <div className="public-journey-pill">
            <span>1. Explorar</span>
            <strong>Mirá qué ofrece la carta</strong>
          </div>
          <div className="public-journey-pill">
            <span>2. Confirmar</span>
            <strong>Elegí sucursal o promoción</strong>
          </div>
          <div className="public-journey-pill">
            <span>3. Reservar</span>
            <strong>Entrá al flujo de reserva</strong>
          </div>
        </div>
      </article>

      {menuQuery.isLoading ? (
        <p role="status">Cargando menú real…</p>
      ) : menuQuery.error ? (
        <p role="alert" className="login-error">
          {menuQuery.error instanceof Error ? menuQuery.error.message : "No se pudo cargar el menú"}
        </p>
      ) : liveMenuData ? (
        <>
          <article className="public-card">
            <h2>Siguiente paso recomendado</h2>
            <div className="public-checklist">
              {menuChecklist.map((step) => (
                <div key={step.label} className={`public-check-item ${step.done ? "public-check-item--done" : ""}`}>
                  <strong>{step.done ? "✓" : "•"}</strong>
                  <span>{step.label}</span>
                </div>
              ))}
            </div>
            <p className="public-field-hint">
              {menuPending.length > 0
                ? `Todavía falta contexto porque no quedó resuelto: ${menuPending.join(", ")}.`
                : "Ya tenés contexto suficiente para pasar a sucursales, promos o reserva."}
            </p>
          </article>

          <article className="public-card">
            <h2>Qué hacer después de mirar la carta</h2>
            <div className="public-route-grid">
              {menuRoutes.map((route) => (
                <Link
                  key={route.to}
                  to={route.to}
                  className={`public-route-card ${route.accent ? "public-route-card--accent" : ""}`}
                  {...(route.prefetch ?? {})}
                >
                  <div className="public-route-meta">
                    <span className={`public-route-badge ${route.accent ? "public-route-badge--accent" : ""}`}>
                      {route.badge}
                    </span>
                    <h3>{route.title}</h3>
                  </div>
                  <p>{route.description}</p>
                  <span className="public-route-link">{route.cta}</span>
                </Link>
              ))}
            </div>
          </article>

          <article className="public-card">
            <h2>{liveMenuData.menu.name}</h2>
            <p>Slug: {liveMenuData.menu.slug}</p>
            <p>Snapshot: {menuSnapshot}</p>
          </article>

          <div className="public-card-grid">
            <article className="public-card">
              <h2>Categorías</h2>
              <p>
                <strong>{categories.length}</strong> sección(es) visibles para navegar la carta.
              </p>
            </article>
            <article className="public-card">
              <h2>Productos</h2>
              <p>
                <strong>{products.length}</strong> opción(es) cargadas en el snapshot actual.
              </p>
            </article>
            <article className="public-card">
              <h2>Próximo paso recomendado</h2>
              <p>Si algo te interesa, podés pasar directo a reservar o seguir viendo sucursales y promociones.</p>
            </article>
          </div>

          <div className="public-card-grid">
            {liveMenuData.categories.map((category, index) => (
              <article key={`${category.name}-${index}`} className="public-card">
                <h2>{category.name}</h2>
                <p>{(category.products ?? []).length} producto(s)</p>
                {(() => {
                  const products = category.products ?? [];
                  return products.length ? (
                    <ul>
                      {products
                        .map((product) => (
                          <li key={`${category.name}-${product.name}-${index}`}>
                            <strong>{product.name}</strong> — {formatMoney(product.priceMinorUnits, product.currency)}
                            {product.allergens?.length ? ` · Alergenos: ${product.allergens.join(", ")}` : ""}
                          </li>
                        ))}
                    </ul>
                  ) : (
                    <p>Sin productos visibles en esta categoría.</p>
                  );
                })()}
              </article>
            ))}
          </div>
        </>
      ) : (
        <div className="public-card">
          <p>No hay un menú público visible ahora.</p>
          <p className="public-field-hint">
            Mientras tanto, podés seguir por sucursales o promociones para no cortar la exploración del cliente.
          </p>
        </div>
      )}

      <div className="public-button-row">
        <Link to="/public/reservations/new" className="public-cta" {...reservePrefetchProps}>
          Reservar desde el menú
        </Link>
        <Link to="/public/branches" className="public-secondary-cta">
          Ver sucursales
        </Link>
        <Link to="/public/promotions" className="public-secondary-cta">
          Ver promociones
        </Link>
      </div>
    </section>
  );
}

function formatMoney(minorUnits: number, currency: string) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(minorUnits / 100);
}
