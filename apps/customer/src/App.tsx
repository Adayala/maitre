import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "./app/auth-context.js";
import { SessionProvider, useSession } from "./app/session-context.js";
import { CustomerPage } from "./features/customer/customer-page.js";
import { BrandPresentationProvider } from "../../../packages/brand-presentation/src/index.js";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: true, staleTime: 5_000 },
  },
});

function BrandTheme({ children }: { children: React.ReactNode }) {
  const { accessToken } = useAuth();
  const { selectedTenantId, selectedBranchId } = useSession();
  const publicTenantId = (import.meta.env["VITE_PUBLIC_TENANT_ID"] as string | undefined) ?? null;
  const publicBrandId = (import.meta.env["VITE_PUBLIC_BRAND_ID"] as string | undefined) ?? null;
  return <BrandPresentationProvider apiUrl={import.meta.env["VITE_API_URL"] ?? "http://localhost:3001"} accessToken={accessToken} tenantId={selectedTenantId ?? publicTenantId} branchId={selectedBranchId} brandId={accessToken ? null : publicBrandId} surface="PUBLIC_HOME">{children}</BrandPresentationProvider>;
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SessionProvider>
          <BrandTheme><CustomerPage /></BrandTheme>
        </SessionProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
