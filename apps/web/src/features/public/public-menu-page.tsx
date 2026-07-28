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
      const apiUrl = (import.meta.env["VITE_API_URL"] as string | undefined) ?? "http://localhost:3001";
      const response = await fetch(`${apiUrl}/public/menu/${PUBLIC_MENU_TOKEN}`);
      if (!response.ok) throw new Error("No se pudo cargar el menú público");
      return (await response.json()) as PublicMenuPayload;
    },
  });
  const liveMenuData = menuQuery.data?.data ?? null;
  const categories = liveMenuData?.categories ?? [];
  const products = categories.flatMap((category) => category.products ?? []);
  const menuSnapshot = liveMenuData ? new Date(liveMenuData.menu.asOf).toLocaleString("es-AR") : "—";

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
