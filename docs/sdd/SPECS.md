# Specifications Catalog — Maitre MVP

Índice maestro de **193 especificaciones numeradas** (SPEC-001 a SPEC-193) para el MVP de Maitre.

Formato: **SPEC-NNN | Título | Tipo | Dominio | Fase | P0/P1/P2 | Status**

---

## Fase 1: Plataforma Fundacional (~48 specs)

### Organization Domain

#### Entities

- [ ] **SPEC-001** | Tenant Entity | Entity | Organization | Fase 1 | P0 | DRAFT
- [ ] **SPEC-002** | Brand Entity | Entity | Organization | Fase 1 | P0 | PLANNED
- [ ] **SPEC-003** | FiscalEntity Entity | Entity | Organization | Fase 1 | P0 | PLANNED
- [ ] **SPEC-004** | Branch Entity | Entity | Organization | Fase 1 | P0 | PLANNED
- [ ] **SPEC-005** | Salon Entity | Entity | Organization | Fase 1 | P1 | PLANNED
- [ ] **SPEC-006** | Table Entity | Entity | Organization | Fase 1 | P1 | PLANNED

#### APIs

- [ ] **SPEC-007** | Tenants API (POST, GET, PATCH) | API | Organization | Fase 1 | P0 | PLANNED
- [ ] **SPEC-008** | Brands API (CRUD) | API | Organization | Fase 1 | P0 | PLANNED
- [ ] **SPEC-009** | FiscalEntities API (CRUD) | API | Organization | Fase 1 | P0 | PLANNED
- [ ] **SPEC-010** | Branches API (CRUD) | API | Organization | Fase 1 | P0 | PLANNED
- [ ] **SPEC-011** | Salons API (CRUD) | API | Organization | Fase 1 | P1 | PLANNED
- [ ] **SPEC-012** | Tables API (CRUD) | API | Organization | Fase 1 | P1 | PLANNED

#### Events

- [ ] **SPEC-013** | TenantCreated Event | Event | Organization | Fase 1 | P0 | PLANNED
- [ ] **SPEC-014** | BrandCreated Event | Event | Organization | Fase 1 | P0 | PLANNED
- [ ] **SPEC-015** | BranchCreated Event | Event | Organization | Fase 1 | P0 | PLANNED

#### RBAC

- [ ] **SPEC-016** | Organization RBAC | RBAC | Organization | Fase 1 | P0 | PLANNED

---

### Identity Domain

#### Entities

- [ ] **SPEC-017** | User Entity | Entity | Identity | Fase 1 | P0 | PLANNED
- [ ] **SPEC-018** | Role Entity | Entity | Identity | Fase 1 | P0 | PLANNED
- [ ] **SPEC-019** | Permission Entity | Entity | Identity | Fase 1 | P0 | PLANNED
- [ ] **SPEC-020** | Membership Entity | Entity | Identity | Fase 1 | P0 | PLANNED

#### APIs

- [ ] **SPEC-021** | Users API (CRUD, invite) | API | Identity | Fase 1 | P0 | PLANNED
- [ ] **SPEC-022** | Roles API (GET read-only) | API | Identity | Fase 1 | P1 | PLANNED
- [ ] **SPEC-023** | Auth API (login, refresh, logout) | API | Identity | Fase 1 | P0 | PLANNED

#### Events

- [ ] **SPEC-024** | UserInvited Event | Event | Identity | Fase 1 | P0 | PLANNED
- [ ] **SPEC-025** | UserAuthenticated Event | Event | Identity | Fase 1 | P1 | PLANNED

#### RBAC

- [ ] **SPEC-026** | Identity RBAC | RBAC | Identity | Fase 1 | P0 | PLANNED

---

### Subscription Domain

#### Entities

- [ ] **SPEC-027** | Subscription Entity | Entity | Subscription | Fase 1 | P0 | PLANNED
- [ ] **SPEC-028** | SubscriptionItem Entity | Entity | Subscription | Fase 1 | P0 | PLANNED
- [ ] **SPEC-029** | Entitlement Entity | Entity | Subscription | Fase 1 | P0 | PLANNED
- [ ] **SPEC-030** | Quota Entity | Entity | Subscription | Fase 1 | P1 | PLANNED

#### APIs

- [ ] **SPEC-031** | Subscriptions API (CRUD) | API | Subscription | Fase 1 | P0 | PLANNED
- [ ] **SPEC-032** | Entitlements API (GET read-only) | API | Subscription | Fase 1 | P0 | PLANNED

#### Events

- [ ] **SPEC-033** | ServiceActivated Event | Event | Subscription | Fase 1 | P0 | PLANNED
- [ ] **SPEC-034** | ServiceDeactivated Event | Event | Subscription | Fase 1 | P1 | PLANNED

#### Calculation

- [ ] **SPEC-035** | Entitlements Calculation | Calculation | Subscription | Fase 1 | P0 | PLANNED

#### RBAC

- [ ] **SPEC-036** | Subscription RBAC | RBAC | Subscription | Fase 1 | P0 | PLANNED

---

### Catalog Domain

#### Entities

- [ ] **SPEC-037** | Menu Entity | Entity | Catalog | Fase 1 | P1 | PLANNED
- [ ] **SPEC-038** | Category Entity | Entity | Catalog | Fase 1 | P1 | PLANNED
- [ ] **SPEC-039** | Product Entity | Entity | Catalog | Fase 1 | P1 | PLANNED

#### APIs

- [ ] **SPEC-040** | Menus API (CRUD) | API | Catalog | Fase 1 | P1 | PLANNED
- [ ] **SPEC-041** | Categories API (CRUD) | API | Catalog | Fase 1 | P1 | PLANNED
- [ ] **SPEC-042** | Products API (CRUD) | API | Catalog | Fase 1 | P1 | PLANNED

#### RBAC

- [ ] **SPEC-043** | Catalog RBAC | RBAC | Catalog | Fase 1 | P1 | PLANNED

---

### Audit Domain

#### Entities

- [ ] **SPEC-044** | AuditLog Entity | Entity | Audit | Fase 1 | P0 | PLANNED

#### APIs

- [ ] **SPEC-045** | Audit API (GET logs) | API | Audit | Fase 1 | P0 | PLANNED

---

### Dashboard

- [ ] **SPEC-046** | Dashboard Setup Status API | API | Dashboard | Fase 1 | P1 | PLANNED
- [ ] **SPEC-047** | Dashboard Overview API | API | Dashboard | Fase 1 | P1 | PLANNED
- [ ] **SPEC-048** | Dash App (Setup & Overview) | App | Dashboard | Fase 1 | P0 | PLANNED

---

## Fase 2: Operación Mínima (~60 specs)

### Shifts Domain

- [ ] **SPEC-049** | ServiceTemplate Entity | Entity | Shifts | Fase 2 | P0 | PLANNED
- [ ] **SPEC-050** | ServiceDay Entity | Entity | Shifts | Fase 2 | P0 | PLANNED
- [ ] **SPEC-051** | Tour (Plaza) Entity | Entity | Shifts | Fase 2 | P0 | PLANNED
- [ ] **SPEC-052** | ServiceTemplates API | API | Shifts | Fase 2 | P0 | PLANNED
- [ ] **SPEC-053** | ServiceDays API (open/close) | API | Shifts | Fase 2 | P0 | PLANNED
- [ ] **SPEC-054** | Tours API (CRUD) | API | Shifts | Fase 2 | P0 | PLANNED
- [ ] **SPEC-055** | ServiceDayOpened Event | Event | Shifts | Fase 2 | P0 | PLANNED
- [ ] **SPEC-056** | Shifts RBAC | RBAC | Shifts | Fase 2 | P0 | PLANNED

### Floor Domain

- [ ] **SPEC-057** | Visit Entity | Entity | Floor | Fase 2 | P0 | PLANNED
- [ ] **SPEC-058** | TableOccupation Entity | Entity | Floor | Fase 2 | P0 | PLANNED
- [ ] **SPEC-059** | Visit State Machine | StateMachine | Floor | Fase 2 | P0 | PLANNED
- [ ] **SPEC-060** | Table State Machine (derived) | StateMachine | Floor | Fase 2 | P0 | PLANNED
- [ ] **SPEC-061** | Visits API (POST, GET, PATCH) | API | Floor | Fase 2 | P0 | PLANNED
- [ ] **SPEC-062** | Tables Status API (GET all) | API | Floor | Fase 2 | P0 | PLANNED
- [ ] **SPEC-063** | VisitOpened Event | Event | Floor | Fase 2 | P0 | PLANNED
- [ ] **SPEC-064** | TableStatusChanged Event | Event | Floor | Fase 2 | P0 | PLANNED
- [ ] **SPEC-065** | Floor App (open visit, take order) | App | Floor | Fase 2 | P0 | PLANNED
- [ ] **SPEC-066** | Floor RBAC | RBAC | Floor | Fase 2 | P0 | PLANNED

### Ordering Domain

- [ ] **SPEC-067** | Order Entity | Entity | Ordering | Fase 2 | P0 | PLANNED
- [ ] **SPEC-068** | OrderItem Entity | Entity | Ordering | Fase 2 | P0 | PLANNED
- [ ] **SPEC-069** | Order State Machine | StateMachine | Ordering | Fase 2 | P0 | PLANNED
- [ ] **SPEC-070** | Orders API (POST, GET, PATCH) | API | Ordering | Fase 2 | P0 | PLANNED
- [ ] **SPEC-071** | Product Availability API | API | Ordering | Fase 2 | P0 | PLANNED
- [ ] **SPEC-072** | OrderSubmitted Event | Event | Ordering | Fase 2 | P0 | PLANNED
- [ ] **SPEC-073** | OrderItemApproved Event | Event | Ordering | Fase 2 | P0 | PLANNED
- [ ] **SPEC-074** | Ordering RBAC | RBAC | Ordering | Fase 2 | P0 | PLANNED

### Kitchen Domain

- [ ] **SPEC-075** | PreparationCenter Entity | Entity | Kitchen | Fase 2 | P0 | PLANNED
- [ ] **SPEC-076** | Station Entity | Entity | Kitchen | Fase 2 | P0 | PLANNED
- [ ] **SPEC-077** | KitchenTicket (Comanda) Entity | Entity | Kitchen | Fase 2 | P0 | PLANNED
- [ ] **SPEC-078** | TicketItem Entity | Entity | Kitchen | Fase 2 | P0 | PLANNED
- [ ] **SPEC-079** | Ticket State Machine | StateMachine | Kitchen | Fase 2 | P0 | PLANNED
- [ ] **SPEC-080** | Kitchen Tickets API (GET filtered) | API | Kitchen | Fase 2 | P0 | PLANNED
- [ ] **SPEC-081** | Kitchen Items API (PATCH status) | API | Kitchen | Fase 2 | P0 | PLANNED
- [ ] **SPEC-082** | KitchenTicketCreated Event | Event | Kitchen | Fase 2 | P0 | PLANNED
- [ ] **SPEC-083** | KitchenItemReady Event | Event | Kitchen | Fase 2 | P0 | PLANNED
- [ ] **SPEC-084** | Kitchen App (receive, mark ready) | App | Kitchen | Fase 2 | P0 | PLANNED
- [ ] **SPEC-085** | Kitchen RBAC | RBAC | Kitchen | Fase 2 | P0 | PLANNED

### Bill & Payment (básico)

- [ ] **SPEC-086** | Bill Entity | Entity | Bill | Fase 2 | P0 | PLANNED
- [ ] **SPEC-087** | Bill State Machine | StateMachine | Bill | Fase 2 | P0 | PLANNED
- [ ] **SPEC-088** | Bills API (POST, GET) | API | Bill | Fase 2 | P0 | PLANNED
- [ ] **SPEC-089** | CheckRequested Event | Event | Bill | Fase 2 | P0 | PLANNED
- [ ] **SPEC-090** | BillGenerated Event | Event | Bill | Fase 2 | P0 | PLANNED

### QR Menu

- [ ] **SPEC-091** | QRCode Entity | Entity | QR | Fase 2 | P1 | PLANNED
- [ ] **SPEC-092** | Public Menus API (GET without auth) | API | QR | Fase 2 | P1 | PLANNED

### Dashboard Operativo

- [ ] **SPEC-093** | Dashboard Floor API (live status) | API | Dashboard | Fase 2 | P1 | PLANNED
- [ ] **SPEC-094** | Dashboard Kitchen API (tickets, alerts) | API | Dashboard | Fase 2 | P1 | PLANNED

---

## Fase 3: Adquisición y Autoservicio (~35 specs)

### Reservations

- [ ] **SPEC-095** | Reservation Entity | Entity | Reservations | Fase 3 | P1 | PLANNED
- [ ] **SPEC-096** | ClientGroup Entity | Entity | Reservations | Fase 3 | P1 | PLANNED
- [ ] **SPEC-097** | Reservation State Machine | StateMachine | Reservations | Fase 3 | P1 | PLANNED
- [ ] **SPEC-098** | Public Reservations API (POST without auth) | API | Reservations | Fase 3 | P1 | PLANNED
- [ ] **SPEC-099** | Reservations API (GET, PATCH) | API | Reservations | Fase 3 | P1 | PLANNED
- [ ] **SPEC-100** | Availability API (GET without auth) | API | Reservations | Fase 3 | P1 | PLANNED
- [ ] **SPEC-101** | ReservationCreated Event | Event | Reservations | Fase 3 | P1 | PLANNED
- [ ] **SPEC-102** | ReservationConfirmed Event | Event | Reservations | Fase 3 | P1 | PLANNED
- [ ] **SPEC-103** | Reservations RBAC | RBAC | Reservations | Fase 3 | P1 | PLANNED

### QR Ordering (híbrido)

- [ ] **SPEC-104** | QRSession Entity | Entity | QR | Fase 3 | P1 | PLANNED
- [ ] **SPEC-105** | Public Orders API (POST without auth, from QR) | API | QR | Fase 3 | P1 | PLANNED
- [ ] **SPEC-106** | QROrderSubmitted Event | Event | QR | Fase 3 | P1 | PLANNED
- [ ] **SPEC-107** | QR Ordering RBAC | RBAC | QR | Fase 3 | P1 | PLANNED

### Guest App

- [ ] **SPEC-108** | Guest App — Reservation Flow | App | Guest | Fase 3 | P1 | PLANNED
- [ ] **SPEC-109** | Guest App — QR Menu Flow | App | Guest | Fase 3 | P1 | PLANNED
- [ ] **SPEC-110** | Guest App — QR Order Flow | App | Guest | Fase 3 | P1 | PLANNED
- [ ] **SPEC-111** | Guest App — Bill View Flow | App | Guest | Fase 3 | P1 | PLANNED

### Feedback (básico)

- [ ] **SPEC-112** | Feedback Entity | Entity | Feedback | Fase 3 | P2 | PLANNED
- [ ] **SPEC-113** | Feedback API (POST, GET) | API | Feedback | Fase 3 | P2 | PLANNED
- [ ] **SPEC-114** | FeedbackRequested Event | Event | Feedback | Fase 3 | P2 | PLANNED
- [ ] **SPEC-115** | FeedbackReceived Event | Event | Feedback | Fase 3 | P2 | PLANNED
- [ ] **SPEC-116** | Feedback RBAC | RBAC | Feedback | Fase 3 | P2 | PLANNED

---

## Fase 4: Dinero y Fiscalidad (~25 specs)

### Cash

- [ ] **SPEC-117** | CashBox Entity | Entity | Cash | Fase 4 | P1 | PLANNED
- [ ] **SPEC-118** | CashSession Entity | Entity | Cash | Fase 4 | P1 | PLANNED
- [ ] **SPEC-119** | CashSession State Machine | StateMachine | Cash | Fase 4 | P1 | PLANNED
- [ ] **SPEC-120** | CashBoxes API (CRUD) | API | Cash | Fase 4 | P1 | PLANNED
- [ ] **SPEC-121** | CashSessions API (open, close) | API | Cash | Fase 4 | P1 | PLANNED

### Payments

- [ ] **SPEC-122** | Payment Entity | Entity | Payments | Fase 4 | P1 | PLANNED
- [ ] **SPEC-123** | Payment State Machine | StateMachine | Payments | Fase 4 | P1 | PLANNED
- [ ] **SPEC-124** | Payments API (POST, GET) | API | Payments | Fase 4 | P1 | PLANNED
- [ ] **SPEC-125** | PaymentCompleted Event | Event | Payments | Fase 4 | P1 | PLANNED

### Billing & ARCA

- [ ] **SPEC-126** | BillingDocument Entity | Entity | Billing | Fase 4 | P1 | PLANNED
- [ ] **SPEC-127** | FiscalPoint Entity | Entity | Billing | Fase 4 | P1 | PLANNED
- [ ] **SPEC-128** | BillingDocuments API (CRUD) | API | Billing | Fase 4 | P1 | PLANNED
- [ ] **SPEC-129** | BillingDocumentAuthorized Event | Event | Billing | Fase 4 | P1 | PLANNED

### Cash App

- [ ] **SPEC-130** | Cash App — Open Session Flow | App | Cash | Fase 4 | P1 | PLANNED
- [ ] **SPEC-131** | Cash App — Register Payment Flow | App | Cash | Fase 4 | P1 | PLANNED
- [ ] **SPEC-132** | Cash App — Close Session Flow | App | Cash | Fase 4 | P1 | PLANNED

### RBAC

- [ ] **SPEC-133** | Cash RBAC | RBAC | Cash | Fase 4 | P1 | PLANNED
- [ ] **SPEC-134** | Payments RBAC | RBAC | Payments | Fase 4 | P1 | PLANNED

---

## Fase 5: Integración y Reputación (~30 specs)

### Reputation

- [ ] **SPEC-135** | ExternalReview Entity | Entity | Reputation | Fase 5 | P2 | PLANNED
- [ ] **SPEC-136** | ExternalLocationMapping Entity | Entity | Reputation | Fase 5 | P2 | PLANNED
- [ ] **SPEC-137** | ExternalReviewReceived Event | Event | Reputation | Fase 5 | P2 | PLANNED
- [ ] **SPEC-138** | Reputation Reviews API (GET) | API | Reputation | Fase 5 | P2 | PLANNED

### Google Business Profile Connector

- [ ] **SPEC-139** | GBP Connector — Auth (OAuth2) | Connector | Reputation | Fase 5 | P2 | PLANNED
- [ ] **SPEC-140** | GBP Connector — Sync (pull reviews) | Connector | Reputation | Fase 5 | P2 | PLANNED
- [ ] **SPEC-141** | GBP Connector — Response (publish) | Connector | Reputation | Fase 5 | P2 | PLANNED
- [ ] **SPEC-142** | Connectors API (CRUD, auth) | API | Integrations | Fase 5 | P2 | PLANNED

### Connect App

- [ ] **SPEC-143** | Connect App — Add Connector Flow | App | Integrations | Fase 5 | P2 | PLANNED
- [ ] **SPEC-144** | Connect App — Manage Credentials Flow | App | Integrations | Fase 5 | P2 | PLANNED

### Integrations Hub

- [ ] **SPEC-145** | Webhooks API | API | Integrations | Fase 5 | P2 | PLANNED
- [ ] **SPEC-146** | Event Subscriptions | API | Integrations | Fase 5 | P2 | PLANNED
- [ ] **SPEC-147** | Rate Limiting | Transversal | Integrations | Fase 5 | P2 | PLANNED

### Reputation RBAC & Analytics

- [ ] **SPEC-148** | Reputation RBAC | RBAC | Reputation | Fase 5 | P2 | PLANNED
- [ ] **SPEC-149** | Reputation Analytics Dashboard | Dashboard | Reputation | Fase 5 | P2 | PLANNED

---

## Transversales (Aplican a todas las fases)

### Críticas (Fase 1)

- [ ] **SPEC-150** | Multi-tenancy & Data Isolation | Transversal | Platform | Fase 1 | P0 | PLANNED
- [ ] **SPEC-151** | Authorization & Entitlements | Transversal | Platform | Fase 1 | P0 | PLANNED
- [ ] **SPEC-152** | Error Codes & Error Handling | Transversal | Platform | Fase 1 | P0 | PLANNED

### Altas (Fase 2-3)

- [ ] **SPEC-153** | Idempotency (Idempotency-Key) | Transversal | Platform | Fase 2 | P0 | PLANNED
- [ ] **SPEC-154** | Distributed Tracing (correlationId) | Transversal | Platform | Fase 2 | P0 | PLANNED
- [ ] **SPEC-155** | Offline Capability (sync, conflict resolution) | Transversal | Platform | Fase 2 | P1 | PLANNED

### Medias (Fase 3-4)

- [ ] **SPEC-156** | Health Checks (/_health endpoint) | Transversal | Platform | Fase 3 | P1 | PLANNED
- [ ] **SPEC-157** | Metrics & Monitoring | Transversal | Platform | Fase 3 | P1 | PLANNED
- [ ] **SPEC-158** | Logging (levels, redaction, storage) | Transversal | Platform | Fase 3 | P1 | PLANNED
- [ ] **SPEC-159** | Encryption (TLS, at-rest) | Transversal | Platform | Fase 3 | P0 | PLANNED
- [ ] **SPEC-160** | Secrets Management & Rotation | Transversal | Platform | Fase 3 | P0 | PLANNED
- [ ] **SPEC-161** | Data Retention & GDPR | Transversal | Platform | Fase 3 | P1 | PLANNED

### Bajas (Fase 4-5)

- [ ] **SPEC-162** | Circuit Breaker (dependency failures) | Transversal | Platform | Fase 4 | P2 | PLANNED
- [ ] **SPEC-163** | Backup & Disaster Recovery | Transversal | Platform | Fase 4 | P2 | PLANNED
- [ ] **SPEC-164** | Rate Limiting by Tenant | Transversal | Platform | Fase 4 | P2 | PLANNED

---

## Resumen de conteos

| Fase | Specs | Tipo | Prioridad | Status |
| --- | --- | --- | --- | --- |
| 1 | 48 | Organization, Identity, Subscription, Catalog, Audit, Dashboard | P0 | PLANNED |
| 2 | 60 | Shifts, Floor, Ordering, Kitchen, Bill, QR, Dashboard | P0 | PLANNED |
| 3 | 35 | Reservations, Guest, QR, Feedback | P1-P2 | PLANNED |
| 4 | 25 | Cash, Payments, Billing, Apps | P1 | PLANNED |
| 5 | 30 | Reputation, Connectors, Apps | P2 | PLANNED |
| Transversales | 15 | Security, Observability, Resilience | P0-P2 | PLANNED |
| **TOTAL MVP** | **193** | | | |

---

## Cómo usar este catálogo

1. **Elegir spec:** SPEC-NNN que te interese
2. **Crear directorio:** `/docs/sdd/spec-[type]-[name]/`
3. **Copiar template:** De `spec-entity-tenant/`
4. **Escribir contenido:**
   - README.md (metadata)
   - objective.md (qué es, criterios de aceptación)
   - specification.md (schema, reglas)
   - plan.md (implementación)
   - tasks.md (pasos concretos)
   - verification.md (cómo se prueba)
   - notes.md (decisiones, riesgos)
5. **Actualizar STATUS:** PLANNED → DRAFT → READY_FOR_IMPLEMENTATION → IN_PROGRESS → DONE
6. **Update this file:** Marcar [x] cuando esté DONE

---

## Próximos pasos

✅ Infraestructura SDD lista (directorios, templates, numeración)
👉 Escribir specs de Fase 1 (~48 specs)
   - Prioridad: SPEC-001 a SPEC-048
   - Timeline: ~3-4 semanas
🔲 Fase 2 en paralelo
🔲 Implementación siguiendo specs
