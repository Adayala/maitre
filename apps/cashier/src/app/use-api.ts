import { useCallback } from "react";
import { apiRequest, type RequestOptions } from "../lib/api-client.js";
import { useAuth } from "./auth-context.js";
import { useSession } from "./session-context.js";

// A thin binding that injects the current access token + tenant selection into
// every request, so feature code just calls `api("/v1/...", { method, body })`.
export function useApi() {
  const { accessToken } = useAuth();
  const { selectedTenantId, selectedBranchId } = useSession();

  return useCallback(
    <T>(
      path: string,
      options: Omit<RequestOptions, "accessToken" | "tenantId" | "branchId"> = {},
    ): Promise<T> => {
      return apiRequest<T>(path, {
        accessToken: accessToken!,
        ...(selectedTenantId ? { tenantId: selectedTenantId } : {}),
        ...(selectedBranchId ? { branchId: selectedBranchId } : {}),
        ...options,
      });
    },
    [accessToken, selectedBranchId, selectedTenantId],
  );
}
