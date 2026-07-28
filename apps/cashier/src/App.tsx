import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "./app/auth-context.js";
import { SessionProvider, useSession } from "./app/session-context.js";
import { LoginPage } from "./features/login/login-page.js";
import { SetupPage } from "./features/setup/setup-page.js";
import { CashierPage } from "./features/cashier/cashier-page.js";
import { apiRequest } from "./lib/api-client.js";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: true, staleTime: 5_000 },
  },
});

function Gate() {
  const { accessToken, isLoading: authLoading } = useAuth();
  const { selectedTenantId, selectedBranchId, selectedRegisterId } = useSession();
  const access = useQuery({
    queryKey: ["subscription-access", selectedTenantId, selectedBranchId],
    queryFn: () =>
      apiRequest<SubscriptionAccess>(
        `/v1/subscriptions/${selectedTenantId}/access?branchId=${selectedBranchId}`,
        { accessToken: accessToken!, tenantId: selectedTenantId! },
      ),
    enabled: Boolean(accessToken && selectedTenantId && selectedBranchId),
  });

  if (!accessToken) return <LoginPage />;
  if (authLoading) return null;

  const ready = selectedTenantId && selectedBranchId && selectedRegisterId;
  if (!ready) return <SetupPage />;
  if (access.isLoading) return <SubscriptionState title="Validando suscripción…" />;
  if (access.error) return <SubscriptionState title="No se pudo validar la suscripción" />;
  const services = access.data?.data.services ?? [];
  if (!services.some((service) => service.code === "CASH")) {
    return <SubscriptionState title="Maitre Cash no está contratado para esta sucursal" />;
  }

  return (
    <>
      <SubscriptionCapacity services={services} codes={["CASH", "CASHIERS"]} />
      <CashierPage />
    </>
  );
}

interface SubscriptionAccess {
  data: { services: Array<{ code: string; quantity: number; scopeRefId: string | null }> };
}
function SubscriptionState({ title }: { title: string }) {
  return <main className="state state--empty"><h1>{title}</h1><p>Consultá al administrador del tenant.</p></main>;
}
function SubscriptionCapacity({ services, codes }: { services: SubscriptionAccess["data"]["services"]; codes: string[] }) {
  const visible = services.filter((service) => codes.includes(service.code));
  return <aside className="app-subscription-summary">Suscripción: {visible.map((service) => `${service.code} × ${service.quantity}`).join(" · ")}</aside>;
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
