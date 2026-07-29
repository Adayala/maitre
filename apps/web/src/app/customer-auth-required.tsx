import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./auth-context.js";

export function CustomerAuthRequired({ children }: { children: JSX.Element }) {
  const { accessToken, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <section className="auth-gate-card" role="status" aria-live="polite">
        <span>Acceso cliente</span>
        <strong>Verificando tu sesión…</strong>
        <p>Estamos confirmando si ya tenés acceso para continuar con la reserva o ver tus visitas.</p>
      </section>
    );
  }

  if (!accessToken) {
    const redirect = encodeURIComponent(`${location.pathname}${location.search}`);
    return <Navigate to={`/login?next=${redirect}&mode=customer`} replace />;
  }

  return children;
}
