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
      // SPEC-007/008/010/011/012 §Authorization
      "tenant:read",
      "tenant:usage",
      "brand:read",
      "brand:write",
      "branch:read",
      "branch:write",
      "salon:create",
      "salon:read",
      "salon:write",
      "table:create",
      "table:read",
      "table:write",
      // SPEC-036 §Permission Matrix
      "subscription:read",
      "service:manage",
      "entitle:read",
      "quota:read",
      // SPEC-043 §Catalog RBAC (simplified for the CRUD model — see
      // packages/modules/catalog/src/domain/menu.ts's note on the deferred
      // versioned/publish model, which SPEC-043's full permission set
      // targets: catalog.menu.publish, catalog.draft.write, etc.)
      "menu:create",
      "menu:read",
      "menu:write",
      "menu:archive",
      "category:create",
      "category:read",
      "category:write",
      "product:create",
      "product:read",
      "product:write",
      "product:archive",
      // SPEC-045 §contract — "Acceso requiere permiso sensible"; OWNER/ADMIN only.
      "audit:read",
      // SPEC-046/047
      "dashboard:read",
      // SPEC-065 §Floor RBAC — ADMIN gets full Floor operational access.
      "visit:create",
      "visit:move",
      "visit:close",
      "visit:reopen",
      "occupancy:manage",
      "table-status:read",
      "check:read",
      "check:adjust",
      "check:void",
      "check:settle",
      "payment:create",
      "payment:capture",
      "payment:refund",
      "payment:reconcile",
      "service-period:manage",
    ],
  },
  role_manager: {
    id: "role_manager",
    name: "Manager",
    description: "Views configuration, cannot manage organization or users",
    permissions: [
      "organization:read",
      "user:read",
      "role:read",
      "permission:read",
      // SPEC-008/010/011/012 §Authorization
      "brand:read",
      "branch:read",
      "salon:read",
      "table:read",
      // SPEC-036 §Permission Matrix
      "subscription:read",
      "entitle:read",
      "quota:read",
      // SPEC-046/047
      "dashboard:read",
      // SPEC-043 — MANAGER may edit but not archive (matches contract.md's
      // "MANAGER puede editar drafts... sólo con permisos explícitos")
      "menu:read",
      "menu:write",
      "category:read",
      "category:write",
      "product:read",
      "product:write",
      // SPEC-065 §Floor RBAC — MANAGER "supervisa/corrige con permisos
      // explícitos": authorizes reopen/void/refund/force-close plus full
      // read/operate access, matching contract.md.
      "visit:create",
      "visit:move",
      "visit:close",
      "visit:reopen",
      "occupancy:manage",
      "table-status:read",
      "check:read",
      "check:adjust",
      "check:void",
      "check:settle",
      "payment:create",
      "payment:capture",
      "payment:refund",
      "payment:reconcile",
      "service-period:manage",
    ],
  },
  role_employee: {
    id: "role_employee",
    name: "Employee",
    description: "No organization management; read-only identity access",
    // SPEC-012 §Authorization — EMPLOYEE may list/read tables (operational),
    // unlike brands/branches/salons which stay administrative (SPEC-016).
    // SPEC-043 — "roles operativos leen menú publicado necesario".
    permissions: [
      "user:read",
      "role:read",
      "permission:read",
      "table:read",
      "menu:read",
      "category:read",
      "product:read",
    ],
  },
  // SPEC-065 §Floor RBAC — "MAITRE administra seating/moves y ve Floor
  // completo por branch scope". Full operational Floor access except the
  // manager-only corrective/authorization actions (reopen, void, refund).
  role_maitre: {
    id: "role_maitre",
    name: "Maître",
    description: "Floor coordination — seating, moves, full Floor read",
    permissions: [
      "menu:read",
      "category:read",
      "product:read",
      "visit:create",
      "visit:move",
      "visit:close",
      "occupancy:manage",
      "table-status:read",
      "check:read",
      "service-period:manage",
    ],
  },
  // SPEC-065 — "WAITER opera Visits y mesas asignadas/permitidas": takes
  // orders, opens/closes own Visits and Checks, cannot void/refund/reopen
  // (those require MANAGER authorization per contract.md).
  role_waiter: {
    id: "role_waiter",
    name: "Waiter",
    description: "Order taking — operates Visit/Check per branch/ownership",
    permissions: [
      "menu:read",
      "category:read",
      "product:read",
      "visit:create",
      "visit:move",
      "visit:close",
      "occupancy:manage",
      "table-status:read",
      "check:read",
      "check:adjust",
    ],
  },
  // SPEC-065 — "COOK sólo lectura mínima si requerida": no guest/check
  // access per contract.md ("COOK no accede a guest/check salvo
  // contrato"); read-only table status for kitchen-adjacent awareness.
  role_cook: {
    id: "role_cook",
    name: "Cook",
    description: "Kitchen operations — read-only minimal Floor access",
    permissions: ["table-status:read"],
  },
  // SPEC-065 — "CASHIER cobra/refund dentro de LimitsPolicy": handles
  // payment capture/refund and reads Check/Payment, without managing
  // seating (matches contract.md's "CASHIER lee Check/Payment necesarios
  // sin gestionar seating"). LimitsPolicy itself is out of this MVP scope.
  role_cashier: {
    id: "role_cashier",
    name: "Cashier",
    description: "Cash/payments — capture, refund, Check/Payment read",
    permissions: [
      "check:read",
      "check:settle",
      "payment:create",
      "payment:capture",
      "payment:refund",
      "payment:reconcile",
    ],
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
