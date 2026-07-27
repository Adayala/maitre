import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./app/auth-context.js";
import { SessionProvider } from "./app/session-context.js";
import { CustomerPage } from "./features/customer/customer-page.js";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: true, staleTime: 5_000 },
  },
});

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SessionProvider>
          <CustomerPage />
        </SessionProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
