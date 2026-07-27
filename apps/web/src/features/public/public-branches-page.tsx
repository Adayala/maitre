import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
const PUBLIC_MENU_TOKEN = "demo-qr-menu-token";

interface PublicBranchPayload {
  data: {
    branch: {
      id: string;
      name: string;
      code: string;
      timezone: string;
      contactEmail: string | null;
      contactPhone: string | null;
    };
  };
}

export function PublicBranchesPage() {
  const branchesQuery = useQuery({
    queryKey: ["public-branches-live", PUBLIC_MENU_TOKEN],
    queryFn: async () => {
      const response = await fetch(`http://127.0.0.1:3001/public/branches/${PUBLIC_MENU_TOKEN}`);
      if (!response.ok) throw new Error("No se pudieron cargar las sucursales públicas");
      return (await response.json()) as PublicBranchPayload;
    },
  });

  return (
    <section className="public-page" aria-labelledby="public-branches-heading">
      <h1 id="public-branches-heading">Sucursales</h1>
      <p>Listado público de sucursales conectado a la surface pública real del backend.</p>

      {branchesQuery.isLoading ? (
        <p role="status">Cargando sucursales…</p>
      ) : branchesQuery.error ? (
        <p role="alert" className="login-error">
          {branchesQuery.error instanceof Error ? branchesQuery.error.message : "No se pudieron cargar las sucursales"}
        </p>
      ) : (
        <div className="public-card-grid">
          {branchesQuery.data?.data.branch ? (
            <article className="public-card">
              <h2>{branchesQuery.data.data.branch.name}</h2>
              <p>Código: {branchesQuery.data.data.branch.code}</p>
              <p>Zona horaria: {branchesQuery.data.data.branch.timezone}</p>
              {branchesQuery.data.data.branch.contactEmail ? <p>Email: {branchesQuery.data.data.branch.contactEmail}</p> : null}
              {branchesQuery.data.data.branch.contactPhone ? <p>Teléfono: {branchesQuery.data.data.branch.contactPhone}</p> : null}
            </article>
          ) : null}
        </div>
      )}

      <Link to="/public/availability" className="public-secondary-cta">
        Consultar disponibilidad
      </Link>
    </section>
  );
}
