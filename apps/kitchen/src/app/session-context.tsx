import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../lib/api-client.js";
import { useAuth } from "./auth-context.js";

// Resolves the acting context for the KDS: which tenant + branch this device
// operates within. Mirrors apps/web's tenant-context but also tracks a branch,
// since the kitchen queue, stations and alerts are all branch-scoped. Both
// selections are sticky in localStorage — a kitchen tablet is dedicated to one
// place for a whole shift — and auto-resolved when there is only one option.

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
  selectedBranch: MeBranch | null;
  selectTenant: (tenantId: string) => void;
  selectBranch: (branchId: string) => void;
}

const SessionContext = createContext<SessionState | null>(null);

const TENANT_KEY = "maitre.kitchen.selectedTenantId";
const BRANCH_KEY = "maitre.kitchen.selectedBranchId";

export function SessionProvider({ children }: { children: ReactNode }) {
  const { accessToken } = useAuth();
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(
    () => localStorage.getItem(TENANT_KEY),
  );
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(
    () => localStorage.getItem(BRANCH_KEY),
  );

  const { data, isLoading, error } = useQuery({
    queryKey: ["me-context", accessToken],
    queryFn: () => apiRequest<MeContextResponse>("/v1/me/context", { accessToken: accessToken! }),
    enabled: Boolean(accessToken),
  });

  function selectTenant(tenantId: string) {
    // Changing (or clearing) the tenant always invalidates the branch choice.
    localStorage.removeItem(BRANCH_KEY);
    setSelectedBranchId(null);
    if (tenantId) {
      localStorage.setItem(TENANT_KEY, tenantId);
      setSelectedTenantId(tenantId);
    } else {
      localStorage.removeItem(TENANT_KEY);
      setSelectedTenantId(null);
    }
  }

  function selectBranch(branchId: string) {
    if (branchId) {
      localStorage.setItem(BRANCH_KEY, branchId);
      setSelectedBranchId(branchId);
    } else {
      localStorage.removeItem(BRANCH_KEY);
      setSelectedBranchId(null);
    }
  }

  const tenants = data?.tenants ?? [];
  const resolvedTenantId =
    selectedTenantId ?? (tenants.length === 1 ? tenants[0]!.id : null);
  const activeTenant = tenants.find((t) => t.id === resolvedTenantId) ?? null;
  const branches = activeTenant?.branches ?? [];
  const resolvedBranchId =
    selectedBranchId ?? (branches.length === 1 ? branches[0]!.id : null);
  const selectedBranch = branches.find((b) => b.id === resolvedBranchId) ?? null;

  useEffect(() => {
    if (!data) return;
    if (selectedTenantId && !tenants.some((tenant) => tenant.id === selectedTenantId)) {
      localStorage.removeItem(TENANT_KEY);
      localStorage.removeItem(BRANCH_KEY);
      setSelectedTenantId(null);
      setSelectedBranchId(null);
      return;
    }
    if (!selectedTenantId && tenants.length === 1) {
      localStorage.setItem(TENANT_KEY, tenants[0]!.id);
      setSelectedTenantId(tenants[0]!.id);
    }
  }, [data, selectedTenantId, tenants]);

  useEffect(() => {
    if (!data || !resolvedTenantId) return;
    if (selectedBranchId && !branches.some((branch) => branch.id === selectedBranchId)) {
      localStorage.removeItem(BRANCH_KEY);
      setSelectedBranchId(null);
      return;
    }
    if (!selectedBranchId && branches.length === 1) {
      localStorage.setItem(BRANCH_KEY, branches[0]!.id);
      setSelectedBranchId(branches[0]!.id);
    }
  }, [branches, data, resolvedTenantId, selectedBranchId]);

  return (
    <SessionContext.Provider
      value={{
        ...(data ? { me: data } : {}),
        isLoading,
        ...(error ? { error: error as Error } : {}),
        tenants,
        selectedTenantId: resolvedTenantId,
        selectedBranchId: selectedBranch ? resolvedBranchId : null,
        selectedBranch,
        selectTenant,
        selectBranch,
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
