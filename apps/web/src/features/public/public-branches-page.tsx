import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  prefetchOnIntent,
  preloadReservationCreationExperience,
} from "../../lib/route-prefetch.js";
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
  const reservePrefetchProps = prefetchOnIntent(preloadReservationCreationExperience);
  const branchesQuery = useQuery({
    queryKey: ["public-branches-live", PUBLIC_MENU_TOKEN],
    queryFn: async () => {
      const apiUrl = (import.meta.env["VITE_API_URL"] as string | undefined) ?? "http://localhost:3001";
      const response = await fetch(`${apiUrl}/public/branches/${PUBLIC_MENU_TOKEN}`);
      if (!response.ok) throw new Error("No se pudieron cargar las sucursales públicas");
      return (await response.json()) as PublicBranchPayload;
    },
  });

  return (
    <section className="public-page" aria-labelledby="public-branches-heading">
      <h1 id="public-branches-heading">Sucursales</h1>
      <p>Listado público de sucursales conectado a la surface pública real del backend.</p>

      <article className="public-card public-info-card">
        <strong>Qué resuelve esta pantalla</strong>
        <p>
          Antes de reservar, el cliente puede validar en qué sede quiere continuar y por qué canal conviene seguir.
        </p>
        <div className="public-detail-list">
          <span><strong>Objetivo:</strong> elegir sede antes de reservar</span>
          <span><strong>Siguiente paso:</strong> revisar disponibilidad o pasar a reserva</span>
        </div>
      </article>

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
              <div className="public-route-meta">
                <span className="public-route-badge">Sucursal visible</span>
                <h2>{branchesQuery.data.data.branch.name}</h2>
              </div>
              <div className="public-checklist">
                <div className="public-check-item public-check-item--done">
                  <strong>✓</strong>
                  <span>Ya encontraste una sede visible para continuar.</span>
                </div>
                <div className="public-check-item">
                  <strong>→</strong>
                  <span>Ahora conviene validar horario o pasar directo a la reserva.</span>
                </div>
              </div>
              <div className="public-detail-list">
                <span>
                  <strong>Código:</strong> {branchesQuery.data.data.branch.code}
                </span>
                <span>
                  <strong>Zona horaria:</strong> {branchesQuery.data.data.branch.timezone}
                </span>
                {branchesQuery.data.data.branch.contactEmail ? (
                  <span>
                    <strong>Email:</strong> {branchesQuery.data.data.branch.contactEmail}
                  </span>
                ) : null}
                {branchesQuery.data.data.branch.contactPhone ? (
                  <span>
                    <strong>Teléfono:</strong> {branchesQuery.data.data.branch.contactPhone}
                  </span>
                ) : null}
              </div>
              <div className="public-button-row">
                <Link to="/public/availability" className="public-secondary-cta">
                  Consultar disponibilidad
                </Link>
                <Link to="/public/reservations/new" className="public-cta" {...reservePrefetchProps}>
                  Reservar en esta sede
                </Link>
              </div>
            </article>
          ) : null}
        </div>
      )}

      <article className="public-card">
        <h2>Recorrido desde sucursales</h2>
        <div className="public-checklist">
          <div className="public-check-item public-check-item--done">
            <strong>1</strong>
            <span>Elegí la sede que mejor te sirve.</span>
          </div>
          <div className="public-check-item">
            <strong>2</strong>
            <span>Consultá disponibilidad pública si todavía dudás del horario.</span>
          </div>
          <div className="public-check-item">
            <strong>3</strong>
            <span>Pasá a reserva autenticada cuando ya tengas una decisión.</span>
          </div>
        </div>
      </article>

      <div className="public-button-row">
        <Link to="/public/availability" className="public-secondary-cta">
          Consultar disponibilidad
        </Link>
        <Link to="/public/menu" className="public-secondary-cta">
          Ver menú
        </Link>
      </div>
    </section>
  );
}
