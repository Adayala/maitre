import { createContext, useContext, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../lib/api-client.js";
import { useAuth } from "./auth-context.js";

interface MeContextBranch {
  id: string;
  code: string;
  name: string;
}

interface MeContextTenant {
  id: string;
  name: string;
  branches: MeContextBranch[];
}

interface MeContextResponse {
  user: { id: string; displayName: string; email: string | null };
  tenants: MeContextTenant[];
}

interface TenantContextState {
  me?: MeContextResponse;
  isLoading: boolean;
  error?: Error;
  selectedTenantId: string | null;
  selectTenant: (tenantId: string) => void;
}

const TenantContext = createContext<TenantContextState | null>(null);

export function TenantProvider({ children }: { children: ReactNode }) {
  const { accessToken } = useAuth();
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(
    () => localStorage.getItem("maitre.selectedTenantId"),
  );

  const { data, isLoading, error } = useQuery({
    queryKey: ["me-context", accessToken],
    queryFn: () => apiRequest<MeContextResponse>("/v1/me/context", { accessToken: accessToken! }),
    enabled: Boolean(accessToken),
  });

  function selectTenant(tenantId: string) {
    localStorage.setItem("maitre.selectedTenantId", tenantId);
    setSelectedTenantId(tenantId);
  }

  return (
    <TenantContext.Provider
      value={{
        ...(data ? { me: data } : {}),
        isLoading,
        ...(error ? { error: error as Error } : {}),
        selectedTenantId:
          selectedTenantId ?? (data?.tenants.length === 1 ? data.tenants[0]!.id : null),
        selectTenant,
      }}
    >
      {children}
    </TenantContext.Provider>
  );
}

export function useTenantContext(): TenantContextState {
  const ctx = useContext(TenantContext);
  if (!ctx) throw new Error("useTenantContext must be used within TenantProvider");
  return ctx;
}
