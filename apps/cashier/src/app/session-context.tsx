import { createContext, useContext, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../lib/api-client.js";
import { useAuth } from "./auth-context.js";

interface MeBranch {
  id: string;
  code: string;
  name: string;
}
interface MeTenant {
  id: string;
  name: string;
  branches: MeBranch[];
}
interface MeContextResponse {
  user: { id: string; displayName: string; email: string | null };
  tenants: MeTenant[];
}

interface SessionState {
  me?: MeContextResponse;
  isLoading: boolean;
  error?: Error;
  tenants: MeTenant[];
  selectedTenantId: string | null;
  selectedBranchId: string | null;
  selectedRegisterId: string | null;
  selectedBranch: MeBranch | null;
  selectTenant: (tenantId: string) => void;
  selectBranch: (branchId: string) => void;
  selectRegister: (registerId: string) => void;
}

const SessionContext = createContext<SessionState | null>(null);

const TENANT_KEY = "maitre.cashier.selectedTenantId";
const BRANCH_KEY = "maitre.cashier.selectedBranchId";
const REGISTER_KEY = "maitre.cashier.selectedRegisterId";

export function SessionProvider({ children }: { children: ReactNode }) {
  const { accessToken } = useAuth();
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(
    () => localStorage.getItem(TENANT_KEY),
  );
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(
    () => localStorage.getItem(BRANCH_KEY),
  );
  const [selectedRegisterId, setSelectedRegisterId] = useState<string | null>(
    () => localStorage.getItem(REGISTER_KEY),
  );

  const { data, isLoading, error } = useQuery({
    queryKey: ["me-context", accessToken],
    queryFn: () => apiRequest<MeContextResponse>("/v1/me/context", { accessToken: accessToken! }),
    enabled: Boolean(accessToken),
  });

  function selectTenant(tenantId: string) {
    localStorage.removeItem(BRANCH_KEY);
    localStorage.removeItem(REGISTER_KEY);
    setSelectedBranchId(null);
    setSelectedRegisterId(null);
    if (tenantId) {
      localStorage.setItem(TENANT_KEY, tenantId);
      setSelectedTenantId(tenantId);
    } else {
      localStorage.removeItem(TENANT_KEY);
      setSelectedTenantId(null);
    }
  }

  function selectBranch(branchId: string) {
    localStorage.removeItem(REGISTER_KEY);
    setSelectedRegisterId(null);
    if (branchId) {
      localStorage.setItem(BRANCH_KEY, branchId);
      setSelectedBranchId(branchId);
    } else {
      localStorage.removeItem(BRANCH_KEY);
      setSelectedBranchId(null);
    }
  }

  function selectRegister(registerId: string) {
    if (registerId) {
      localStorage.setItem(REGISTER_KEY, registerId);
      setSelectedRegisterId(registerId);
    } else {
      localStorage.removeItem(REGISTER_KEY);
      setSelectedRegisterId(null);
    }
  }

  const tenants = data?.tenants ?? [];
  const resolvedTenantId = selectedTenantId ?? (tenants.length === 1 ? tenants[0]!.id : null);
  const activeTenant = tenants.find((t) => t.id === resolvedTenantId) ?? null;
  const branches = activeTenant?.branches ?? [];
  const resolvedBranchId = selectedBranchId ?? (branches.length === 1 ? branches[0]!.id : null);
  const selectedBranch = branches.find((b) => b.id === resolvedBranchId) ?? null;

  return (
    <SessionContext.Provider
      value={{
        ...(data ? { me: data } : {}),
        isLoading,
        ...(error ? { error: error as Error } : {}),
        tenants,
        selectedTenantId: resolvedTenantId,
        selectedBranchId: selectedBranch ? resolvedBranchId : null,
        selectedRegisterId,
        selectedBranch,
        selectTenant,
        selectBranch,
        selectRegister,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession(): SessionState {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used within SessionProvider");
  return ctx;
}
