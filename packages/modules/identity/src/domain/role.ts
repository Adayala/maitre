// SPEC-018 — Role Entity. Roles are predefined (not created dynamically in
// I0). Permission sets encode the matrices from SPEC-016 (Organization RBAC)
// and SPEC-026 (Identity RBAC). Staff roles (MAITRE/WAITER/COOK/CASHIER) are
// listed per SPEC-018 but carry no permissions yet — their domain RBAC specs
// (Floor/Kitchen/Cash, Fase 2+) are out of scope for I0.

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
}

export const ROLE_REGISTRY: Readonly<Record<string, Role>> = Object.freeze({
  role_owner: {
    id: "role_owner",
    name: "Owner",
    description: "Full control",
    permissions: ["*"],
  },
  role_admin: {
    id: "role_admin",
    name: "Admin",
    description: "Manages organization structure and users",
    permissions: [
      "brand:create",
      "branch:create",
      "organization:read",
      "organization:write",
      "user:create",
      "user:read",
      "user:write",
      "role:read",
      "permission:read",
    ],
  },
  role_manager: {
    id: "role_manager",
    name: "Manager",
    description: "Views configuration, cannot manage organization or users",
    permissions: ["organization:read", "user:read", "role:read", "permission:read"],
  },
  role_employee: {
    id: "role_employee",
    name: "Employee",
    description: "No organization management; read-only identity access",
    permissions: ["user:read", "role:read", "permission:read"],
  },
  role_maitre: {
    id: "role_maitre",
    name: "Maître",
    description: "Floor coordination (permissions defined by SPEC-066 RBAC, Fase 2)",
    permissions: [],
  },
  role_waiter: {
    id: "role_waiter",
    name: "Waiter",
    description: "Order taking (permissions defined by SPEC-074 RBAC, Fase 2)",
    permissions: [],
  },
  role_cook: {
    id: "role_cook",
    name: "Cook",
    description: "Kitchen operations (permissions defined by SPEC-085 RBAC, Fase 2)",
    permissions: [],
  },
  role_cashier: {
    id: "role_cashier",
    name: "Cashier",
    description: "Cash/payments (permissions defined by SPEC-135 RBAC, Fase 4)",
    permissions: [],
  },
});

export class UnknownRoleError extends Error {
  constructor(roleId: string) {
    super(`Unknown or inactive role "${roleId}"`);
    this.name = "UnknownRoleError";
  }
}

/**
 * SPEC-020 §Roles — "Roles desconocidos/inactivos no se ignoran: invalidan
 * el cambio." Resolves every roleId or throws.
 */
export function resolveRoles(roleIds: string[]): Role[] {
  return roleIds.map((id) => {
    const role = ROLE_REGISTRY[id];
    if (!role) throw new UnknownRoleError(id);
    return role;
  });
}
