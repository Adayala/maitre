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

  return (
    <section aria-labelledby="brands-heading">
      <h1 id="brands-heading">Marcas</h1>
      <StateView
        isLoading={isLoading}
        error={error as Error | null}
        isEmpty={data?.data.length === 0}
        emptyMessage="Todavía no hay marcas creadas."
        onRetry={() => void refetch()}
      >
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
            {data?.data.map((brand) => (
              <tr key={brand.id}>
                <td>{brand.name}</td>
                <td>{brand.slug}</td>
                <td>{brand.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </StateView>
    </section>
  );
}
