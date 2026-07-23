import { useTenantQuery } from "../../lib/use-tenant-query.js";
import { StateView } from "../../components/state-view.js";

interface Branch {
  id: string;
  name: string;
  code: string;
  status: string;
  timezone: string;
}

export function BranchesPage() {
  const { data, isLoading, error, refetch } = useTenantQuery<{ data: Branch[] }>(
    "branches",
    "/v1/branches",
  );

  return (
    <section aria-labelledby="branches-heading">
      <h1 id="branches-heading">Sucursales</h1>
      <StateView
        isLoading={isLoading}
        error={error as Error | null}
        isEmpty={data?.data.length === 0}
        emptyMessage="Todavía no hay sucursales creadas."
        onRetry={() => void refetch()}
      >
        <table>
          <caption className="sr-only">Listado de sucursales</caption>
          <thead>
            <tr>
              <th scope="col">Nombre</th>
              <th scope="col">Código</th>
              <th scope="col">Zona horaria</th>
              <th scope="col">Estado</th>
            </tr>
          </thead>
          <tbody>
            {data?.data.map((branch) => (
              <tr key={branch.id}>
                <td>{branch.name}</td>
                <td>{branch.code}</td>
                <td>{branch.timezone}</td>
                <td>{branch.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </StateView>
    </section>
  );
}
