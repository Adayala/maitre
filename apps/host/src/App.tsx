import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "./app/auth-context.js";
import { SessionProvider, useSession } from "./app/session-context.js";
import { LoginPage } from "./features/login/login-page.js";
import { SetupPage } from "./features/setup/setup-page.js";
import { HostPage } from "./features/host/host-page.js";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: true, staleTime: 5_000 },
  },
});

function Gate() {
  const { accessToken, isLoading: authLoading } = useAuth();
  const { selectedTenantId, selectedBranchId } = useSession();

  if (!accessToken) return <LoginPage />;
  if (authLoading) return <LoginPage />;

  const ready = selectedTenantId && selectedBranchId;
  if (!ready) return <SetupPage />;

  return <HostPage />;
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
