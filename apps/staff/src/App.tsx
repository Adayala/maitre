import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StaffShellPage } from "./features/staff/staff-shell-page.js";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: true, staleTime: 5_000 },
  },
});

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <StaffShellPage />
    </QueryClientProvider>
  );
}
