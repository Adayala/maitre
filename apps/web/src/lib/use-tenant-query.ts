import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { apiRequest } from "./api-client.js";
import { useAuth } from "../app/auth-context.js";
import { useTenantContext } from "../app/tenant-context.js";

export function useTenantQuery<T>(
  key: string,
  path: string,
  options?: Partial<UseQueryOptions<T>>,
) {
  const { accessToken } = useAuth();
  const { selectedTenantId } = useTenantContext();

  return useQuery<T>({
    queryKey: [key, selectedTenantId],
    queryFn: () =>
      apiRequest<T>(path, { accessToken: accessToken!, tenantId: selectedTenantId! }),
    enabled: Boolean(accessToken && selectedTenantId),
    ...options,
  });
}
