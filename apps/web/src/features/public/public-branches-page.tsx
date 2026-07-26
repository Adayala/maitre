import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../app/auth-context.js";
import { useTenantContext } from "../../app/tenant-context.js";
import { apiRequest } from "../../lib/api-client.js";

interface Branch {
  id: string;
  name: string;
  code: string;
  status: string;
  timezone: string;
  contactEmail?: string;
  contactPhone?: string;
}

export function PublicBranchesPage() {
  const { accessToken } = useAuth();
  const { selectedTenantId } = useTenantContext();
  const branchesQuery = useQuery({
    queryKey: ["public-branches-live", selectedTenantId],
    queryFn: () =>
      apiRequest<{ data: Branch[] }>("/v1/branches", {
        accessToken: accessToken!,
        tenantId: selectedTenantId!,
      }),
    enabled: Boolean(accessToken && selectedTenantId),
  });

  return (
    <section className="public-page" aria-labelledby="public-branches-heading">
      <h1 id="public-branches-heading">Sucursales</h1>
      <p>Listado público de sucursales. En este entorno, la lectura live todavía reutiliza la sesión autenticada.</p>

      {!accessToken || !selectedTenantId ? (
        <div className="public-card">
          <p>No hay sesión activa para cargar sucursales reales.</p>
          <Link to="/login?mode=customer&next=%2Fpublic%2Fbranches" className="public-secondary-cta">
            Ingresar para ver datos reales
          </Link>
        </div>
      ) : branchesQuery.isLoading ? (
        <p role="status">Cargando sucursales…</p>
      ) : branchesQuery.error ? (
        <p role="alert" className="login-error">
          {branchesQuery.error instanceof Error ? branchesQuery.error.message : "No se pudieron cargar las sucursales"}
        </p>
      ) : (
        <div className="public-card-grid">
          {branchesQuery.data?.data.map((branch) => (
            <article key={branch.id} className="public-card">
              <h2>{branch.name}</h2>
              <p>Código: {branch.code}</p>
              <p>Zona horaria: {branch.timezone}</p>
              <p>Estado: {branch.status}</p>
              {branch.contactEmail ? <p>Email: {branch.contactEmail}</p> : null}
              {branch.contactPhone ? <p>Teléfono: {branch.contactPhone}</p> : null}
            </article>
          ))}
        </div>
      )}

      <Link to="/public/availability" className="public-secondary-cta">
        Consultar disponibilidad
      </Link>
    </section>
  );
}
