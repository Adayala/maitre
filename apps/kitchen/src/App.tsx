import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "./app/auth-context.js";
import { SessionProvider, useSession } from "./app/session-context.js";
import { StationProvider, useStation } from "./app/station-context.js";
import { LoginPage } from "./features/login/login-page.js";
import { SetupPage } from "./features/setup/setup-page.js";
import { KdsPage } from "./features/kds/kds-page.js";

// A KDS is a single-purpose kiosk, so there's no router: the app is a small
// gate that resolves auth → device setup (tenant/branch/station) → the queue.
const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } },
});

function Gate() {
  const { accessToken, isLoading: authLoading } = useAuth();
  const { selectedTenantId, selectedBranchId } = useSession();
  const { selectedStationId } = useStation();

  if (!accessToken) return <LoginPage />;
  if (authLoading) return null;

  const ready = selectedTenantId && selectedBranchId && selectedStationId;
  return ready ? <KdsPage /> : <SetupPage />;
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SessionProvider>
          <StationProvider>
            <Gate />
          </StationProvider>
        </SessionProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
