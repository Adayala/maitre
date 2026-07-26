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

export function PublicPromotionsPage() {
  const { accessToken } = useAuth();
  const { selectedTenantId } = useTenantContext();
  const brandsQuery = useQuery({
    queryKey: ["public-promotions-fallback", selectedTenantId],
    queryFn: () =>
      apiRequest<{ data: Brand[] }>("/v1/brands", {
        accessToken: accessToken!,
        tenantId: selectedTenantId!,
      }),
    enabled: Boolean(accessToken && selectedTenantId),
  });

  return (
    <section className="public-page" aria-labelledby="public-promotions-heading">
      <h1 id="public-promotions-heading">Promociones</h1>
      <p>Surface pública editorial. Todavía no existe API de promociones; acá mostramos un fallback honesto derivado del tenant actual.</p>
      <div className="public-card-grid">
        {brandsQuery.data?.data.length ? (
          brandsQuery.data.data.map((brand) => (
            <article key={brand.id} className="public-card">
              <h2>{brand.name}</h2>
              <p>Marca activa en el tenant actual.</p>
              <p>Slug: {brand.slug}</p>
              <p>Estado: {brand.status}</p>
            </article>
          ))
        ) : (
          <>
            <article className="public-card">
              <h2>Happy hour</h2>
              <p>Placeholder de promoción pública con vigencia y sucursal aplicable.</p>
            </article>
            <article className="public-card">
              <h2>Menú ejecutivo</h2>
              <p>Otro bloque promocional para probar navegación pública.</p>
            </article>
          </>
        )}
      </div>
      <Link to="/public/reservations/new" className="public-cta">
        Reservar con promo
      </Link>
    </section>
  );
}
