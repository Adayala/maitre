import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../app/auth-context.js";
import { useTenantContext } from "../../app/tenant-context.js";
import { apiRequest } from "../../lib/api-client.js";

interface Brand {
  id: string;
  name: string;
  slug: string;
  status: string;
}

interface Menu {
  id: string;
  brandId: string;
  name: string;
  slug: string;
  description?: string;
  status: string;
}

interface Category {
  id: string;
  menuId: string;
  name: string;
  status: string;
}

interface Product {
  id: string;
  categoryId: string;
  name: string;
  description?: string;
  priceMinorUnits: number;
  currency: string;
  allergens?: string[];
  status: string;
}

export function PublicMenuPage() {
  const { accessToken } = useAuth();
  const { selectedTenantId } = useTenantContext();

  const menuQuery = useQuery({
    queryKey: ["public-menu-live", selectedTenantId],
    queryFn: async () => {
      const brands = await apiRequest<{ data: Brand[] }>("/v1/brands", {
        accessToken: accessToken!,
        tenantId: selectedTenantId!,
      });
      const activeBrand = brands.data.find((brand) => brand.status === "ACTIVE") ?? brands.data[0] ?? null;
      if (!activeBrand) return null;

      const menus = await apiRequest<{ data: Menu[] }>(`/v1/brands/${activeBrand.id}/menus`, {
        accessToken: accessToken!,
        tenantId: selectedTenantId!,
      });
      const activeMenu = menus.data.find((menu) => menu.status === "ACTIVE") ?? menus.data[0] ?? null;
      if (!activeMenu) return { brand: activeBrand, menu: null, categories: [], productsByCategoryId: {} as Record<string, Product[]> };

      const categories = await apiRequest<{ data: Category[] }>(`/v1/menus/${activeMenu.id}/categories`, {
        accessToken: accessToken!,
        tenantId: selectedTenantId!,
      });

      const productEntries = await Promise.all(
        categories.data.map(async (category) => {
          const products = await apiRequest<{ data: Product[] }>(`/v1/categories/${category.id}/products`, {
            accessToken: accessToken!,
            tenantId: selectedTenantId!,
          });
          return [category.id, products.data] as const;
        }),
      );

      return {
        brand: activeBrand,
        menu: activeMenu,
        categories: categories.data,
        productsByCategoryId: Object.fromEntries(productEntries),
      };
    },
    enabled: Boolean(accessToken && selectedTenantId),
  });
  const liveMenuData = menuQuery.data && menuQuery.data.menu ? menuQuery.data : null;

  return (
    <section className="public-page" aria-labelledby="public-menu-heading">
      <h1 id="public-menu-heading">Menú público</h1>
      <p>Vista pública de menú. En este entorno, los datos live requieren sesión hasta materializar la API pública dedicada.</p>

      {!accessToken || !selectedTenantId ? (
        <div className="public-card">
          <p>No hay sesión activa para cargar el menú live del tenant actual.</p>
          <Link to="/login?mode=customer&next=%2Fpublic%2Fmenu" className="public-secondary-cta">
            Ingresar para ver datos reales
          </Link>
        </div>
      ) : menuQuery.isLoading ? (
        <p role="status">Cargando menú real…</p>
      ) : menuQuery.error ? (
        <p role="alert" className="login-error">
          {menuQuery.error instanceof Error ? menuQuery.error.message : "No se pudo cargar el menú"}
        </p>
      ) : liveMenuData ? (
        <>
          <article className="public-card">
            <h2>{liveMenuData.menu.name}</h2>
            <p>{liveMenuData.menu.description ?? "Menú activo del tenant."}</p>
            <p>Marca: {liveMenuData.brand.name}</p>
          </article>

          <div className="public-card-grid">
            {liveMenuData.categories.map((category) => (
              <article key={category.id} className="public-card">
                <h2>{category.name}</h2>
                {(() => {
                  const products = liveMenuData.productsByCategoryId[category.id] ?? [];
                  return products.length ? (
                    <ul>
                      {products
                        .filter((product) => product.status !== "ARCHIVED")
                        .map((product) => (
                          <li key={product.id}>
                            <strong>{product.name}</strong> — {product.priceMinorUnits / 100} {product.currency}
                            {product.description ? ` · ${product.description}` : ""}
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
          <p>No hay un menú activo visible en este tenant todavía.</p>
        </div>
      )}

      <Link to="/public/reservations/new" className="public-cta">
        Reservar desde el menú
      </Link>
    </section>
  );
}
