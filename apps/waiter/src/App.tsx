import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "./app/auth-context.js";
import { SessionProvider, useSession } from "./app/session-context.js";
import { NavProvider, useNav } from "./app/nav-context.js";
import { LoginPage } from "./features/login/login-page.js";
import { SetupPage } from "./features/setup/setup-page.js";
import { FloorPage } from "./features/floor/floor-page.js";
import { VisitPage } from "./features/visit/visit-page.js";
import { OrderPage } from "./features/order/order-page.js";

// The waiter app gates on auth → device context (tenant/branch) → the floor.
// A short polling refetch keeps the floor/visit reasonably live without a
// realtime channel (documented: polling-only, no push).
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: true, staleTime: 5_000 },
  },
});

function Router() {
  const { current } = useNav();
  switch (current.name) {
    case "floor":
      return <FloorPage />;
    case "visit":
      return <VisitPage visitId={current.visitId} />;
    case "order":
      return <OrderPage visitId={current.visitId} orderId={current.orderId} />;
  }
}

function Gate() {
  const { accessToken, isLoading: authLoading } = useAuth();
  const { selectedTenantId, selectedBranchId } = useSession();

  if (!accessToken) return <LoginPage />;
  if (authLoading) return null;

  const ready = selectedTenantId && selectedBranchId;
  if (!ready) return <SetupPage />;

  return (
    <NavProvider>
      <Router />
    </NavProvider>
  );
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SessionProvider>
          <Gate />
        </SessionProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
