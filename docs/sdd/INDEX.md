# SDD Specifications Index

Índice maestro de todas las especificaciones de Maitre.

**Convención:** Cada spec vive en su propio directorio con múltiples documentos.

```
/docs/sdd/
├── _guides/                          (documentos transversales)
│   ├── README.md                     (cómo leer las specs)
│   ├── SPEC_STRUCTURE.md             (estructura de directorios)
│   ├── 00-mvp-specifications-roadmap.md
│   ├── 01-priority-specs-todo.md
│   ├── 15-applications-and-devices.md
│   ├── 16-api-specifications.md
│   └── 17-event-specifications.md
│
├── spec-entity-tenant/               (spec individual)
│   ├── README.md
│   ├── structure.md
│   ├── rules.md
│   ├── lifecycle.md
│   ├── examples.md
│   └── relationships.md
│
└── spec-api-tenants/
    ├── README.md
    ├── post-create.md
    ├── get-fetch.md
    ├── patch-update.md
    ├── errors.md
    ├── examples.md
    └── authorization.md
```

---

## Fase 1: Plataforma Fundacional

### Organization Domain

#### Entidades

- [ ] [spec-entity-tenant](spec-entity-tenant/) — Tenant: comprador, límite de aislamiento
- [ ] spec-entity-brand — Brand: identidad comercial
- [ ] spec-entity-fiscal-entity — FiscalEntity: CUIT, condición tributaria
- [ ] spec-entity-branch — Branch: sucursal física
- [ ] spec-entity-salon — Salon: área física con mesas
- [ ] spec-entity-table — Table: mesa, capacidad, posición

#### APIs

- [ ] spec-api-tenants — POST /tenants, GET /tenants/:id, PATCH /tenants/:id
- [ ] spec-api-brands — POST /brands, GET, PATCH, DELETE
- [ ] spec-api-fiscal-entities — POST /fiscal-entities, GET, PATCH
- [ ] spec-api-branches — POST /branches, GET, PATCH
- [ ] spec-api-salons — POST /branches/:id/salons, GET, PATCH, DELETE
- [ ] spec-api-tables — POST /salons/:id/tables, GET, PATCH, DELETE

#### Eventos

- [ ] spec-event-tenant-created — TenantCreated
- [ ] spec-event-brand-created — BrandCreated
- [ ] spec-event-branch-created — BranchCreated

#### RBAC

- [ ] spec-rbac-organization — Quién puede crear/editar tenant, brand, branch

---

### Identity Domain

#### Entidades

- [ ] spec-entity-user — User: email, rol, status
- [ ] spec-entity-role — Role: OWNER, ADMIN, MANAGER, MAÎTRE, WAITER, COOK, CASHIER
- [ ] spec-entity-membership — Membership: usuario → tenant + roles + branches
- [ ] spec-entity-permission — Permission: recurso + acción

#### APIs

- [ ] spec-api-users — POST /users (invitar), GET, PATCH, DELETE
- [ ] spec-api-roles — GET /roles (read-only)
- [ ] spec-api-auth — POST /auth/login, /refresh, /logout

#### Eventos

- [ ] spec-event-user-invited — UserInvited
- [ ] spec-event-user-authenticated — UserAuthenticated

#### RBAC

- [ ] spec-rbac-identity — Quién puede invitar, desactivar, cambiar roles

---

### Subscription Domain

#### Entidades

- [ ] spec-entity-subscription — Subscription: items, status, billing cycle
- [ ] spec-entity-subscription-item — SubscriptionItem: serviceCode, scope, branches
- [ ] spec-entity-entitlement — Entitlement: derecho efectivo (FLOOR.ACCESS)
- [ ] spec-entity-quota — Quota: límite cuantitativo (MAX_BRANCHES)

#### APIs

- [ ] spec-api-subscriptions — POST /subscriptions, GET, PATCH (agregar items)
- [ ] spec-api-entitlements — GET /subscriptions/:id/entitlements (read-only)

#### Eventos

- [ ] spec-event-service-activated — ServiceActivated
- [ ] spec-event-service-deactivated — ServiceDeactivated

#### Cálculos

- [ ] spec-calculation-entitlements — Cómo se derivan entitlements de items

#### RBAC

- [ ] spec-rbac-subscription — Solo OWNER/ADMIN modifican

---

### Catalog Domain

#### Entidades

- [ ] spec-entity-menu — Menu: versión, status, branch
- [ ] spec-entity-category — Category: nombre, orden
- [ ] spec-entity-product — Product: nombre, precio, foto, alérgenos

#### APIs

- [ ] spec-api-menus — POST /menus, GET, PATCH
- [ ] spec-api-categories — POST /menus/:id/categories, GET, PATCH, DELETE
- [ ] spec-api-products — POST /categories/:id/products, GET, PATCH, DELETE

#### RBAC

- [ ] spec-rbac-catalog — MANAGER/ADMIN crean/editan menú

---

### Audit Domain

#### Entidades

- [ ] spec-entity-audit-log — AuditLog: actor, action, resource, old/new value

#### APIs

- [ ] spec-api-audit — GET /audit/logs?resource=...&actor=...

---

### Dashboard

- [ ] spec-api-dashboard-setup — GET /dashboard/setup-status (qué falta)
- [ ] spec-api-dashboard-overview — GET /dashboard (resumen tenant)

---

## Fase 2: Operación Mínima

### Shifts Domain

- [ ] spec-entity-service-template — PlantillaServicio
- [ ] spec-entity-service-day — JornadaServicio
- [ ] spec-entity-tour — Plaza (grupo de mesas + mozo + jornada)
- [ ] spec-api-service-templates
- [ ] spec-api-service-days
- [ ] spec-api-tours
- [ ] spec-event-service-day-opened

### Floor Domain

- [ ] spec-entity-visit — Visita
- [ ] spec-entity-table-occupation — OcupacionMesa
- [ ] spec-state-machine-visit — Estados: WAITING, SEATED, ORDERING, IN_SERVICE, CHECK_REQUESTED, PAYING, CLOSED
- [ ] spec-state-machine-table — Estados derivados: AVAILABLE, OCCUPIED, PAYING, CLEANING, BLOCKED
- [ ] spec-api-visits — POST, GET, PATCH
- [ ] spec-api-tables-status — GET estado actual
- [ ] spec-event-visit-opened
- [ ] spec-event-table-status-changed
- [ ] spec-rbac-floor

### Ordering Domain

- [ ] spec-entity-order — Order
- [ ] spec-entity-order-item — OrderItem
- [ ] spec-state-machine-order — Estados: DRAFT, SUBMITTED, ACCEPTED, IN_PREP, READY, DELIVERED, CANCELLED
- [ ] spec-api-orders — POST, GET, PATCH
- [ ] spec-event-order-submitted
- [ ] spec-event-order-item-approved
- [ ] spec-rbac-ordering

### Kitchen Domain

- [ ] spec-entity-preparation-center — CentroPreparacion
- [ ] spec-entity-station — Estacion
- [ ] spec-entity-kitchen-ticket — Comanda
- [ ] spec-entity-ticket-item — TicketItem
- [ ] spec-state-machine-ticket
- [ ] spec-api-kitchen-tickets — GET filtrado por estación
- [ ] spec-api-kitchen-items — PATCH cambiar status
- [ ] spec-event-kitchen-ticket-created
- [ ] spec-event-kitchen-item-ready
- [ ] spec-rbac-kitchen

### Bill & Payment (básico)

- [ ] spec-entity-bill — Cuenta
- [ ] spec-state-machine-bill
- [ ] spec-api-bills — POST (generar), GET
- [ ] spec-event-check-requested
- [ ] spec-event-bill-generated

### QR Menu

- [ ] spec-api-public-menus — GET /public/branches/:id/menu (sin auth)

### Dashboard Operativo

- [ ] spec-api-dashboard-floor
- [ ] spec-api-dashboard-kitchen

### App Flows (Fase 2)

- [ ] spec-app-floor-open-service
- [ ] spec-app-floor-open-visit
- [ ] spec-app-floor-take-order
- [ ] spec-app-kitchen-receive-ticket

---

## Fase 3: Adquisición y Autoservicio

### Reservations

- [ ] spec-entity-reservation
- [ ] spec-entity-group
- [ ] spec-state-machine-reservation
- [ ] spec-api-public-reservations — POST sin auth
- [ ] spec-api-reservations — GET, PATCH
- [ ] spec-api-availability
- [ ] spec-event-reservation-created
- [ ] spec-event-reservation-confirmed

### QR Ordering (híbrido)

- [ ] spec-api-qr-orders — POST sin auth
- [ ] spec-event-qr-order-submitted

### Feedback (básico)

- [ ] spec-entity-feedback
- [ ] spec-api-feedback
- [ ] spec-event-feedback-requested
- [ ] spec-event-feedback-received

### App Flows (Fase 3)

- [ ] spec-app-guest-reservation
- [ ] spec-app-guest-qr-menu
- [ ] spec-app-guest-qr-order

---

## Fase 4: Dinero y Fiscalidad

### Cash

- [ ] spec-entity-cash-box
- [ ] spec-entity-cash-session
- [ ] spec-state-machine-cash-session
- [ ] spec-api-cash-boxes
- [ ] spec-api-cash-sessions

### Payments

- [ ] spec-entity-payment
- [ ] spec-state-machine-payment
- [ ] spec-api-payments
- [ ] spec-event-payment-completed

### Billing & ARCA

- [ ] spec-entity-billing-document
- [ ] spec-entity-fiscal-point
- [ ] spec-api-billing-documents

### App Flows (Fase 4)

- [ ] spec-app-cash-open-session
- [ ] spec-app-cash-register-payment
- [ ] spec-app-cash-close-session

---

## Fase 5: Integración y Reputación

### Reputation

- [ ] spec-entity-external-review
- [ ] spec-entity-external-location-mapping
- [ ] spec-api-reputation-reviews
- [ ] spec-event-external-review-received

### Google Business Profile Connector

- [ ] spec-connector-gbp-auth
- [ ] spec-connector-gbp-sync
- [ ] spec-api-connectors

### App Flows (Fase 5)

- [ ] spec-app-connect-add-gbp

---

## Transversales (Aplican a todas las fases)

### Críticas (Fase 1)

- [ ] spec-transversal-multi-tenancy — Aislamiento de datos
- [ ] spec-transversal-authorization — Checks de entitlement
- [ ] spec-transversal-error-handling — Catálogo de errores HTTP

### Altas (Fase 2-3)

- [ ] spec-transversal-idempotency — Idempotency-Key en POSTs
- [ ] spec-transversal-distributed-tracing — Tracing por visit/order
- [ ] spec-transversal-offline-capability — Qué se sincroniza offline

### Medias (Fase 3-4)

- [ ] spec-transversal-health-checks
- [ ] spec-transversal-metrics
- [ ] spec-transversal-logging
- [ ] spec-transversal-encryption
- [ ] spec-transversal-data-retention

---

## Status Tracker

```
Fase 1 — ~48 specs
├── Organization (13 specs)
│   ├── Entity (6): [ ] [ ] [ ] [ ] [ ] [ ]
│   ├── API (6): [ ] [ ] [ ] [ ] [ ] [ ]
│   ├── Event (3): [ ] [ ] [ ]
│   └── RBAC (1): [ ]
├── Identity (12 specs)
│   ├── Entity (4): [ ] [ ] [ ] [ ]
│   ├── API (3): [ ] [ ] [ ]
│   ├── Event (2): [ ] [ ]
│   └── RBAC (1): [ ]
├── Subscription (10 specs)
│   ├── Entity (4): [ ] [ ] [ ] [ ]
│   ├── API (2): [ ] [ ]
│   ├── Event (2): [ ] [ ]
│   ├── Calc (1): [ ]
│   └── RBAC (1): [ ]
├── Catalog (8 specs)
│   ├── Entity (3): [ ] [ ] [ ]
│   ├── API (3): [ ] [ ] [ ]
│   └── RBAC (1): [ ]
├── Audit (2 specs)
│   ├── Entity (1): [ ]
│   └── API (1): [ ]
└── Dashboard (2 specs): [ ] [ ]

Fase 2 — ~60 specs (Shifts, Floor, Ordering, Kitchen, Bill, QR, Dashboard, Apps)
Fase 3 — ~35 specs (Reservations, QR Ordering, Feedback, Apps)
Fase 4 — ~25 specs (Cash, Payments, Billing, Apps)
Fase 5 — ~30 specs (Reputation, Connectors, Apps)
Transversales — ~25 specs
```

**Total MVP: ~193 specs**

---

## Cómo usar este índice

1. **Selecciona una spec** que no esté hecha.
2. **Crea directorio:** `/docs/sdd/spec-[type]-[name]/`
3. **Copia estructura** de ejemplo: `spec-entity-tenant/`
4. **Escribe documentos** (structure.md, rules.md, examples.md, etc)
5. **Actualiza status:** Marca [ ] → [x] en esta INDEX
6. **Link desde guías:** Si la spec afecta foundation o roadmap, actualiza referencias

---

## Lectura recomendada

**Antes de escribir una spec, lee:**

1. [`_guides/README.md`](_guides/README.md) — Cómo leer las specs
2. [`_guides/SPEC_STRUCTURE.md`](_guides/SPEC_STRUCTURE.md) — Estructura de directorios
3. [`_guides/01-priority-specs-todo.md`](_guides/01-priority-specs-todo.md) — Orden de prioridad
4. Ejemplo: `spec-entity-tenant/` — Cómo se ve una spec completada

---

## Próximos pasos

1. Completar `spec-entity-tenant/` con examples.md y relationships.md
2. Crear `spec-api-tenants/` con endpoints
3. Crear `spec-event-tenant-created/`
4. Crear otras specs de Fase 1 Organization
5. Crear specs de Identity
6. Continuar con Subscription, Catalog, Audit

**Timeline:** Fase 1 en ~3-4 semanas, Fase 2 en ~4 semanas.
