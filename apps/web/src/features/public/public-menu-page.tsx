import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
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
  const menuQuery = useQuery({
    queryKey: ["public-menu-live", PUBLIC_MENU_TOKEN],
    queryFn: async () => {
      const response = await fetch(`http://127.0.0.1:3001/public/menu/${PUBLIC_MENU_TOKEN}`);
      if (!response.ok) throw new Error("No se pudo cargar el menú público");
      return (await response.json()) as PublicMenuPayload;
    },
  });
  const liveMenuData = menuQuery.data?.data ?? null;

  return (
    <section className="public-page" aria-labelledby="public-menu-heading">
      <h1 id="public-menu-heading">Menú público</h1>
      <p>Vista pública de menú conectada a la surface pública real del backend.</p>

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
            <p>Snapshot: {new Date(liveMenuData.menu.asOf).toLocaleString("es-AR")}</p>
          </article>

          <div className="public-card-grid">
            {liveMenuData.categories.map((category, index) => (
              <article key={`${category.name}-${index}`} className="public-card">
                <h2>{category.name}</h2>
                {(() => {
                  const products = category.products ?? [];
                  return products.length ? (
                    <ul>
                      {products
                        .map((product) => (
                          <li key={`${category.name}-${product.name}-${index}`}>
                            <strong>{product.name}</strong> — {product.priceMinorUnits / 100} {product.currency}
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

      <Link to="/public/reservations/new" className="public-cta">
        Reservar desde el menú
      </Link>
    </section>
  );
}
