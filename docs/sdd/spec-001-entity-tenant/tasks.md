# Tasks — SPEC-001

## Fase 1: Preparación (2h)

- [ ] **TASK-1:** Diseñar tenants table schema
  - Definir fields, types, constraints
  - Indexes para queries frecuentes
  - Foreign keys

- [ ] **TASK-2:** Tenant Go struct + validators
  - Fields con validación
  - Email checksum, timezone validation
  - Slug generation si aplica

## Fase 2: Implementación (8h)

- [ ] **TASK-3:** Repository (CRUD operations)
  - Create, Read by ID, Update, List by criteria

- [ ] **TASK-4:** API endpoints (POST, GET, PATCH)
  - POST /tenants (create, public)
  - GET /tenants/:id (read, auth required)
  - PATCH /tenants/:id (update, auth required)

- [ ] **TASK-5:** Auto-create Subscription & Owner
  - On tenant creation, create TRIALING subscription
  - Create Owner user with same email

- [ ] **TASK-6:** Emit TenantCreated event
  - Publish to event bus
  - Include payload: id, name, email, timestamp

- [ ] **TASK-7:** AuditLog integration
  - Log all changes: creation, updates

## Fase 3: Testing (6h)

- [ ] **TASK-8:** Unit tests (validators, repo)
  - Email validation
  - Timezone validation
  - Database operations

- [ ] **TASK-9:** Integration tests (API, isolation)
  - API endpoints work
  - Multi-tenant isolation verified
  - Event publishing works

- [ ] **TASK-10:** E2E tests (full flow)
  - Registration → subscription created → owner ready

## Fase 4: Review (2h)

- [ ] **TASK-11:** Code review + fixes
  - Peer review
  - Address feedback
  - Final merge

**Total: ~18h (2-3 days)**
