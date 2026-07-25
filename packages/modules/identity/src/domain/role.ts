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
      "fiscalEntity:read",
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
      // SPEC-080 §Reservations RBAC — ADMIN gets the full canonical set
      // (branch-scoped in practice via requireTenantContext), including
      // Guest PII/export/anonymize and policy override.
      "reservation:read",
      "reservation:create",
      "reservation:confirm",
      "reservation:cancel",
      "reservation:seat",
      "reservation:no_show",
      "waitlist:read",
      "waitlist:manage",
      "waitlist:priority_override",
      "guest:pii_read",
      "guest:pii_write",
      "guest:export",
      "guest:anonymize",
      "reservation:notification_send",
      "reservation:policy_override",
      // SPEC-097 §Ordering RBAC — ADMIN gets the full canonical set including
      // the elevated exceptions (cancel_prepared) and audit read. The spec's
      // dotted names (order.read, kitchen.line.start, ...) are mapped to the
      // codebase's resource:action convention, exactly as SPEC-080's
      // reservation.notification.send became reservation:notification_send.
      "order:read",
      "order:create",
      "order:submit",
      "order:modify",
      "order:cancel",
      "order:cancel_prepared",
      "kitchen:line_start",
      "kitchen:line_ready",
      "order:deliver",
      "special_request:review",
      "order:audit_read",
      // SPEC-109 §Kitchen RBAC — ADMIN gets the full canonical Kitchen set. The
      // spec's dotted names (kitchen.queue.read, kitchen.command.claim, ...) are
      // mapped to the codebase's resource:action convention (kitchen:queue_read,
      // kitchen:command_claim), exactly as SPEC-097's kitchen.line.start became
      // kitchen:line_start.
      "kitchen:queue_read",
      "kitchen:command_claim",
      "kitchen:command_start",
      "kitchen:command_hold",
      "kitchen:command_ready",
      "kitchen:command_handoff",
      "kitchen:command_cancel",
      "kitchen:command_transfer",
      "kitchen:command_reprioritize",
      "kitchen:station_manage",
      "kitchen:alert_acknowledge",
      "kitchen:alert_resolve",
      "kitchen:alert_escalate",
      "workshift:read_own",
      "workshift:plan",
      "workshift:assign",
      "time:clock",
      "time:read_own",
      "time:adjust_request",
      "time:adjust_approve",
      "time:read_sensitive",
      "time:export",
      "labor_policy:manage",
      "labor_policy:review",
      // SPEC-135 §Cash RBAC — ADMIN gets the full canonical Cash set. The spec's
      // dotted names (cash.session.open, cash.reconciliation.approve, ...) are
      // mapped to the codebase's resource:action convention (cash:session_open,
      // cash:reconciliation_approve), exactly as SPEC-109's kitchen.command.claim
      // became kitchen:command_claim. Register configuration reuses cash:report_read
      // as its manager-tier gate (SPEC-135 defines no dedicated register-admin
      // permission).
      "cash:session_open",
      "cash:session_close",
      "cash:movement_record",
      "cash:movement_compensate",
      "cash:count",
      "cash:reconciliation_submit",
      "cash:reconciliation_approve",
      "discount:apply",
      "discount:override",
      "discount:manage",
      "cash:report_read",
      "cash:report_export",
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
      "fiscalEntity:read",
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
      // SPEC-080 §Reservations RBAC — MANAGER "gestiona reservas y
      // waitlist dentro de branch scope", same full set as ADMIN.
      "reservation:read",
      "reservation:create",
      "reservation:confirm",
      "reservation:cancel",
      "reservation:seat",
      "reservation:no_show",
      "waitlist:read",
      "waitlist:manage",
      "waitlist:priority_override",
      "guest:pii_read",
      "guest:pii_write",
      "guest:export",
      "guest:anonymize",
      "reservation:notification_send",
      "reservation:policy_override",
      // SPEC-097 §Ordering RBAC — MANAGER authorizes exceptions (prepared
      // cancellation, overrides) and sees the full Ordering surface.
      "order:read",
      "order:create",
      "order:submit",
      "order:modify",
      "order:cancel",
      "order:cancel_prepared",
      "kitchen:line_start",
      "kitchen:line_ready",
      "order:deliver",
      "special_request:review",
      "order:audit_read",
      // SPEC-109 §Kitchen RBAC — MANAGER administers stations/routing and holds
      // the override authority (cancel/transfer/reprioritize, station manage,
      // alert escalate), so it gets the full canonical set.
      "kitchen:queue_read",
      "kitchen:command_claim",
      "kitchen:command_start",
      "kitchen:command_hold",
      "kitchen:command_ready",
      "kitchen:command_handoff",
      "kitchen:command_cancel",
      "kitchen:command_transfer",
      "kitchen:command_reprioritize",
      "kitchen:station_manage",
      "kitchen:alert_acknowledge",
      "kitchen:alert_resolve",
      "kitchen:alert_escalate",
      "workshift:read_own",
      "workshift:plan",
      "workshift:assign",
      "time:clock",
      "time:read_own",
      "time:adjust_request",
      "time:adjust_approve",
      "time:read_sensitive",
      "labor_policy:review",
      // SPEC-135 §Cash RBAC — MANAGER approves within LimitsPolicy and holds the
      // elevated cash authority (compensations, reconciliation approval, discount
      // management/override, report export), so it gets the full canonical set.
      "cash:session_open",
      "cash:session_close",
      "cash:movement_record",
      "cash:movement_compensate",
      "cash:count",
      "cash:reconciliation_submit",
      "cash:reconciliation_approve",
      "discount:apply",
      "discount:override",
      "discount:manage",
      "cash:report_read",
      "cash:report_export",
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
      "workshift:read_own",
      "time:read_own",
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
      // SPEC-080 §Reservations RBAC — MAITRE gets the full branch-scoped
      // operational set including waitlist priority overrides and Guest
      // PII (front-of-house role coordinating seating/reservations
      // day-to-day), but not policy override (manager-only correction).
      "reservation:read",
      "reservation:create",
      "reservation:confirm",
      "reservation:cancel",
      "reservation:seat",
      "reservation:no_show",
      "waitlist:read",
      "waitlist:manage",
      "waitlist:priority_override",
      "guest:pii_read",
      "guest:pii_write",
      "reservation:notification_send",
      // SPEC-109 §Kitchen RBAC — "MAITRE administra routing y excepciones":
      // full Kitchen authority (stations, exceptions, alerts) as the
      // front-of-house coordinator, matching MANAGER's kitchen surface.
      "kitchen:queue_read",
      "kitchen:command_claim",
      "kitchen:command_start",
      "kitchen:command_hold",
      "kitchen:command_ready",
      "kitchen:command_handoff",
      "kitchen:command_cancel",
      "kitchen:command_transfer",
      "kitchen:command_reprioritize",
      "kitchen:station_manage",
      "kitchen:alert_acknowledge",
      "kitchen:alert_resolve",
      "kitchen:alert_escalate",
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
      // SPEC-080 §Reservations RBAC — WAITER "sólo accede al contexto
      // operativo necesario y no recibe PII/export por default": can read
      // Reservations, seat them, and read/manage the Waitlist, but no
      // create/confirm/cancel/no-show, no Guest PII, no priority override,
      // no policy override, no notification send.
      "reservation:read",
      "reservation:seat",
      "waitlist:read",
      "waitlist:manage",
      // SPEC-097 §Ordering RBAC — WAITER operates Orders within branch/
      // ownership: take/submit/modify/cancel orders and deliver to the table,
      // but NOT cancel already-prepared items (manager exception) nor read the
      // order audit trail.
      "order:read",
      "order:create",
      "order:submit",
      "order:modify",
      "order:cancel",
      "order:deliver",
    ],
  },
  // SPEC-097 §Ordering RBAC — "COOK actúa sólo sobre líneas de stations
  // asignadas": drives kitchen line start/ready and reads the orders it works.
  // This is the role's first real content (was empty pre-Ordering). Station
  // ownership scoping itself is a documented deferred gap (no ShiftAssignment
  // entity yet).
  // SPEC-109 §Kitchen RBAC — "COOK opera comandos y colas dentro de sus stations
  // asignadas": production operations only (claim/start/hold/resume/ready/handoff)
  // plus reading its queue and the orders it works. NOT cancel/transfer/
  // reprioritize/station.manage/alert.escalate — those are MANAGER/MAITRE. Station
  // ownership scoping itself is a documented deferred gap (no ShiftAssignment
  // enforcement yet). kitchen:line_start/line_ready remain for the Ordering
  // per-item transition endpoint (SPEC-097).
  role_cook: {
    id: "role_cook",
    name: "Cook",
    description: "Kitchen operations — claims and drives production commands, reads worked orders",
    permissions: [
      "table-status:read",
      "order:read",
      "kitchen:line_start",
      "kitchen:line_ready",
      "kitchen:queue_read",
      "kitchen:command_claim",
      "kitchen:command_start",
      "kitchen:command_hold",
      "kitchen:command_ready",
      "kitchen:command_handoff",
    ],
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
      // SPEC-097 §Ordering RBAC — "CASHIER lee el mínimo necesario para
      // coordinación con Check": order read only.
      "order:read",
      // SPEC-135 §Cash RBAC — "CASHIER opera su sesión dentro de límites
      // aprobados": open/close its own session, record ordinary movements and
      // perform the physical count. NOT compensation, reconciliation
      // submit/approve, discount management/override or report export — those are
      // MANAGER-tier per the approved scope.
      "cash:session_open",
      "cash:session_close",
      "cash:movement_record",
      "cash:count",
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
