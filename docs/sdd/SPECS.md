# Specifications Catalog — Maitre MVP

Índice maestro de especificaciones (SPEC-001 a SPEC-226) para el MVP de Maitre.

Formato: **SPEC-NNN | Título | Tipo | Dominio | Fase | Prioridad | Estado | Readiness**

> Nota: este catálogo fue regenerado leyendo directamente el `README.md` de cada carpeta en `docs/sdd/spec-*`, ya que la numeración y contenido habían divergido de versiones anteriores de este archivo.

> Estado operativo relevado el **27 de julio de 2026**: el runtime local contra Supabase ya quedó validado para organization, floor, reservations, ordering, kitchen y cash. El frente fiscal ya tiene adapters, rutas, migration aplicada (`supabase/migrations/20260727143000_fiscal_domain.sql`) y validación live de create/validate/issue/QR con una `FACTURA_A` técnica. La emisión sigue usando ARCA simulado, por lo que el flujo es técnicamente operativo pero no fiscal/legalmente productivo todavía.

---

## Organization

- [ ] **SPEC-001** | Tenant | Entity | Organization | Fase I0 | P0 | IN_PROGRESS | WALKING_SKELETON_I0
- [ ] **SPEC-002** | Brand Entity | Entity | Organization | Fase 1 (Plataforma Fundacional) | P0 | IN_PROGRESS | WALKING_SKELETON_I0
- [ ] **SPEC-003** | FiscalEntity Entity | Entity | Organization | Fase 1 | P0 | IN_PROGRESS | WALKING_SKELETON_I0
- [ ] **SPEC-004** | Branch | Entity | Organization | Fase I0 | P0 | IN_PROGRESS | WALKING_SKELETON_I0
- [ ] **SPEC-005** | Salon Entity | Entity | Organization | Fase 1 | P1 | IN_PROGRESS | WALKING_SKELETON_I0
- [ ] **SPEC-006** | Table Entity | Entity | Organization | Fase 1 | P1 | IN_PROGRESS | WALKING_SKELETON_I0
- [ ] **SPEC-007** | Tenants API | API | Organization | Fase 1 | P0 | IN_PROGRESS | WALKING_SKELETON_I0
- [ ] **SPEC-008** | Brands API | API | Organization | Fase 1 | P0 | IN_PROGRESS | WALKING_SKELETON_I0
- [ ] **SPEC-009** | FiscalEntities API | API | Organization | Fase 1 | P0 | IN_PROGRESS | WALKING_SKELETON_I0
- [ ] **SPEC-010** | Branches API | API | Organization | Fase 1 | P0 | IN_PROGRESS | WALKING_SKELETON_I0
- [ ] **SPEC-011** | Salons API | API | Organization | Fase 1 | P1 | IN_PROGRESS | WALKING_SKELETON_I0
- [ ] **SPEC-012** | Tables API | API | Organization | Fase 1 | P1 | IN_PROGRESS | WALKING_SKELETON_I0
- [ ] **SPEC-013** | TenantCreated Event | Event | Organization | Fase 1 | P0 | IN_PROGRESS | WALKING_SKELETON_I0
- [ ] **SPEC-014** | BrandCreated Event | Event | Organization | Fase 1 | P0 | IN_PROGRESS | WALKING_SKELETON_I0
- [ ] **SPEC-015** | BranchCreated Event | Event | Organization | Fase 1 | P0 | IN_PROGRESS | WALKING_SKELETON_I0
- [ ] **SPEC-016** | Organization RBAC | RBAC | Organization | Fase 1 | P0 | IN_PROGRESS | WALKING_SKELETON_I0

---

## Identity

- [ ] **SPEC-017** | User Entity | Entity | Identity | Fase SPEC-222 I0/I1 | P0 | IN_PROGRESS | WALKING_SKELETON_I0
- [ ] **SPEC-018** | Role Entity | Entity | Identity | Fase 1 | P0 | IN_PROGRESS | WALKING_SKELETON_I0
- [ ] **SPEC-019** | Permission Entity | Entity | Identity | Fase 1 | P1 | IN_PROGRESS | WALKING_SKELETON_I0
- [ ] **SPEC-020** | Membership Entity | Entity | Identity | Fase SPEC-222 I0/I1 | P0 | IN_PROGRESS | WALKING_SKELETON_I0
- [ ] **SPEC-021** | Users API | API | Identity | Fase 1 | P0 | IN_PROGRESS | WALKING_SKELETON_I0
- [ ] **SPEC-022** | Roles API | API | Identity | Fase 1 | P1 | IN_PROGRESS | WALKING_SKELETON_I0
- [ ] **SPEC-023** | Authentication and Session Boundary | API | Identity | Fase I0 | P0 | IN_PROGRESS | WALKING_SKELETON_I0
- [ ] **SPEC-024** | UserInvited Event | Event | Identity | Fase 1 | P0 | IN_PROGRESS | WALKING_SKELETON_I0
- [ ] **SPEC-025** | UserAuthenticated Event | Event | Identity | Fase 1 | P1 | IN_PROGRESS | WALKING_SKELETON_I0
- [ ] **SPEC-026** | Identity RBAC | RBAC | Identity | Fase 1 | P0 | IN_PROGRESS | WALKING_SKELETON_I0

---

## Subscription

- [ ] **SPEC-027** | Subscription Entity | Entity | Subscription | Fase 1 | P0 | IN_PROGRESS | WALKING_SKELETON_I0
- [ ] **SPEC-028** | SubscriptionItem Entity | Entity | Subscription | Fase 1 | P0 | IN_PROGRESS | WALKING_SKELETON_I0
- [ ] **SPEC-029** | Entitlement Entity | Entity | Subscription | Fase 1 | P0 | IN_PROGRESS | WALKING_SKELETON_I0
- [ ] **SPEC-030** | Quota Entity | Entity | Subscription | Fase 1 | P1 | IN_PROGRESS | WALKING_SKELETON_I0
- [ ] **SPEC-031** | Subscriptions API | API | Subscription | Fase 1 | P0 | IN_PROGRESS | WALKING_SKELETON_I0
- [ ] **SPEC-032** | Entitlements API | API | Subscription | Fase 1 | P0 | IN_PROGRESS | WALKING_SKELETON_I0
- [ ] **SPEC-033** | ServiceActivated Event | Event | Subscription | Fase 1 | P0 | IN_PROGRESS | WALKING_SKELETON_I0
- [ ] **SPEC-034** | ServiceDeactivated Event | Event | Subscription | Fase 1 | P1 | IN_PROGRESS | WALKING_SKELETON_I0
- [ ] **SPEC-035** | Entitlements Calculation | Calculation | Subscription | Fase 1 | P0 | IN_PROGRESS | WALKING_SKELETON_I0
- [ ] **SPEC-036** | Subscription RBAC | RBAC | Subscription | Fase 1 | P0 | IN_PROGRESS | WALKING_SKELETON_I0

---

## Catalog

- [ ] **SPEC-037** | Menu Entity | Entity | Catalog | Fase 1 | P1 | IN_PROGRESS | WALKING_SKELETON_I0
- [ ] **SPEC-038** | Category Entity | Entity | Catalog | Fase 1 | P1 | IN_PROGRESS | WALKING_SKELETON_I0
- [ ] **SPEC-039** | Product Entity | Entity | Catalog | Fase 1 | P1 | IN_PROGRESS | WALKING_SKELETON_I0
- [ ] **SPEC-040** | Menus API | API | Catalog | Fase 1 | P1 | IN_PROGRESS | WALKING_SKELETON_I0
- [ ] **SPEC-041** | Categories API | API | Catalog | Fase 1 | P1 | IN_PROGRESS | WALKING_SKELETON_I0
- [ ] **SPEC-042** | Products API | API | Catalog | Fase 1 | P1 | IN_PROGRESS | WALKING_SKELETON_I0
- [ ] **SPEC-043** | Catalog RBAC | RBAC | Catalog | Fase 1 | P1 | IN_PROGRESS | WALKING_SKELETON_I0

---

## Audit

- [ ] **SPEC-044** | AuditLog Entity | Entity | Audit | Fase 1 | P0 | IN_PROGRESS | WALKING_SKELETON_I0
- [ ] **SPEC-045** | Audit API | API | Audit | Fase 1 | P0 | IN_PROGRESS | WALKING_SKELETON_I0

---

## Dashboard

- [ ] **SPEC-046** | Dashboard Setup Status API | API | Dashboard | Fase 1 | P1 | IN_PROGRESS | WALKING_SKELETON_I0
- [ ] **SPEC-047** | Dashboard Overview API | API | Dashboard | Fase 1 | P1 | IN_PROGRESS | WALKING_SKELETON_I0
- [ ] **SPEC-048** | Dash App (Setup & Overview) | App | Dashboard | Fase 1 | P0 | IN_PROGRESS | WALKING_SKELETON_I0

---

## Floor

- [ ] **SPEC-049** | Visit Entity | Entity | Floor | Fase 2 | P1 | IN_PROGRESS | WALKING_SKELETON_I0
- [ ] **SPEC-050** | Occupancy Entity | Entity | Floor | Fase 2 | P1 | IN_PROGRESS | WALKING_SKELETON_I0
- [ ] **SPEC-051** | Table Status Entity | Entity | Floor | Fase 2 | P1 | IN_PROGRESS | WALKING_SKELETON_I0
- [ ] **SPEC-054** | Service Entity | Entity | Floor | Fase 2 | P1 | IN_PROGRESS | WALKING_SKELETON_I0
- [ ] **SPEC-055** | Visits API | API | Floor | Fase 2 | P1 | IN_PROGRESS | WALKING_SKELETON_I0
- [ ] **SPEC-056** | Occupancy API | API | Floor | Fase 2 | P1 | IN_PROGRESS | WALKING_SKELETON_I0
- [ ] **SPEC-057** | Table Status API | API | Floor | Fase 2 | P1 | IN_PROGRESS | WALKING_SKELETON_I0
- [ ] **SPEC-058** | Checks API | API | Floor | Fase 2 | P1 | IN_PROGRESS | WALKING_SKELETON_I0
- [ ] **SPEC-059** | Payments API | API | Floor | Fase 2 | P1 | IN_PROGRESS | WALKING_SKELETON_I0
- [ ] **SPEC-060** | ServicePeriods API | API | Floor | Fase 2 | P1 | IN_PROGRESS | WALKING_SKELETON_I0
- [ ] **SPEC-061** | VisitOpened Event | Event | Floor | Fase 2 | P1 | IN_PROGRESS | WALKING_SKELETON_I0
- [ ] **SPEC-062** | VisitClosed Event | Event | Floor | Fase 2 | P1 | IN_PROGRESS | WALKING_SKELETON_I0
- [ ] **SPEC-063** | PaymentProcessed Event | Event | Floor | Fase 2 | P1 | IN_PROGRESS | WALKING_SKELETON_I0
- [ ] **SPEC-064** | CheckGenerated Event | Event | Floor | Fase 2 | P1 | IN_PROGRESS | WALKING_SKELETON_I0
- [ ] **SPEC-065** | Floor RBAC | RBAC | Floor | Fase 2 | P1 | IN_PROGRESS | WALKING_SKELETON_I0

---

## Billing & Payments

- [ ] **SPEC-052** | Check Entity | Entity | Billing & Payments | Fase 2 | P1 | IN_PROGRESS | WALKING_SKELETON_I0
- [ ] **SPEC-053** | Payment Entity | Entity | Billing & Payments | Fase 2 | P1 | IN_PROGRESS | WALKING_SKELETON_I0

---

## Reservations

- [ ] **SPEC-066** | Reservation Entity | Entity | Reservations | Fase 3 | P1 | IN_PROGRESS | WALKING_SKELETON_I0
- [ ] **SPEC-067** | Guest Entity | Entity | Reservations | Fase 3 | P1 | IN_PROGRESS | WALKING_SKELETON_I0
- [ ] **SPEC-068** | Waitlist Entity | Entity | Reservations | Fase 3 | P1 | IN_PROGRESS | WALKING_SKELETON_I0
- [ ] **SPEC-069** | Reservation Preference Entity | Entity | Reservations | Fase 3 | P1 | IN_PROGRESS | WALKING_SKELETON_I0
- [ ] **SPEC-070** | Cancellation Policy Entity | Entity | Reservations | Fase 3 | P1 | IN_PROGRESS | WALKING_SKELETON_I0
- [ ] **SPEC-071** | Reservations API | API | Reservations | Fase 3 | P1 | IN_PROGRESS | WALKING_SKELETON_I0
- [ ] **SPEC-072** | Guests API | API | Reservations | Fase 3 | P1 | IN_PROGRESS | WALKING_SKELETON_I0
- [ ] **SPEC-073** | Waitlist API | API | Reservations | Fase 3 | P1 | IN_PROGRESS | WALKING_SKELETON_I0
- [ ] **SPEC-074** | Availability API | API | Reservations | Fase 3 | P1 | IN_PROGRESS | WALKING_SKELETON_I0
- [ ] **SPEC-075** | Reservation Notifications API | API | Reservations | Fase 3 | P1 | IN_PROGRESS | WALKING_SKELETON_I0
- [ ] **SPEC-076** | ReservationCreated Event | Event | Reservations | Fase 3 | P1 | IN_PROGRESS | WALKING_SKELETON_I0
- [ ] **SPEC-077** | ReservationConfirmed Event | Event | Reservations | Fase 3 | P1 | IN_PROGRESS | WALKING_SKELETON_I0
- [ ] **SPEC-078** | ReservationCancelled Event | Event | Reservations | Fase 3 | P1 | IN_PROGRESS | WALKING_SKELETON_I0
- [ ] **SPEC-079** | Capacity Calculation | Calculation | Reservations | Fase 3 | P1 | IN_PROGRESS | WALKING_SKELETON_I0
- [ ] **SPEC-080** | Reservations RBAC | RBAC | Reservations | Fase 3 | P1 | IN_PROGRESS | WALKING_SKELETON_I0

---

## Ordering

- [ ] **SPEC-081** | Order Entity | Entity | Ordering | Fase 2 | UNASSIGNED | IN_PROGRESS | WALKING_SKELETON_I0
- [ ] **SPEC-082** | Order Item Entity | Entity | Ordering | Fase 2 | UNASSIGNED | IN_PROGRESS | WALKING_SKELETON_I0
- [ ] **SPEC-083** | Order Modifier Entity | Entity | Ordering | Fase 2 | UNASSIGNED | IN_PROGRESS | WALKING_SKELETON_I0
- [ ] **SPEC-084** | QR Menu Entity | Entity | Ordering | Fase 2 | UNASSIGNED | IN_PROGRESS | WALKING_SKELETON_I0
- [ ] **SPEC-085** | Digital Bill Entity | Entity | Ordering | Fase 2 | UNASSIGNED | IN_PROGRESS | WALKING_SKELETON_I0
- [ ] **SPEC-087** | Orders API | API | Ordering | Fase 2 | UNASSIGNED | IN_PROGRESS | WALKING_SKELETON_I0
- [ ] **SPEC-088** | QR Menu API | API | Ordering | Fase 2 | UNASSIGNED | IN_PROGRESS | WALKING_SKELETON_I0
- [ ] **SPEC-089** | Order Modifications API | API | Ordering | Fase 2 | UNASSIGNED | IN_PROGRESS | WALKING_SKELETON_I0
- [ ] **SPEC-090** | Digital Bill API | API | Ordering | Fase 2 | UNASSIGNED | IN_PROGRESS | WALKING_SKELETON_I0
- [ ] **SPEC-091** | Order Tracking API | API | Ordering | Fase 2 | UNASSIGNED | IN_PROGRESS | WALKING_SKELETON_I0
- [ ] **SPEC-092** | Menu Recommendations API | API | Ordering | Fase 2 | UNASSIGNED | IN_PROGRESS | WALKING_SKELETON_I0
- [ ] **SPEC-093** | Special Requests API | API | Ordering | Fase 2 | UNASSIGNED | IN_PROGRESS | WALKING_SKELETON_I0
- [ ] **SPEC-094** | OrderSubmitted Event | Event | Ordering | Fase 2 | UNASSIGNED | IN_PROGRESS | WALKING_SKELETON_I0
- [ ] **SPEC-095** | OrderReady Event | Event | Ordering | Fase 2 | UNASSIGNED | IN_PROGRESS | WALKING_SKELETON_I0
- [ ] **SPEC-096** | OrderDelivered Event | Event | Ordering | Fase 2 | UNASSIGNED | IN_PROGRESS | WALKING_SKELETON_I0
- [ ] **SPEC-097** | Ordering RBAC | RBAC | Ordering | Fase 2 | UNASSIGNED | IN_PROGRESS | WALKING_SKELETON_I0

---

## Kitchen

- [ ] **SPEC-086** | Kitchen Ticket Entity | Entity | Kitchen | Fase 2 | UNASSIGNED | IN_PROGRESS | WALKING_SKELETON_I0
- [ ] **SPEC-098** | Command Entity | Entity | Kitchen | Fase 2 | UNASSIGNED | IN_PROGRESS | WALKING_SKELETON_I0
- [ ] **SPEC-099** | Station Entity | Entity | Kitchen | Fase 2 | UNASSIGNED | IN_PROGRESS | WALKING_SKELETON_I0
- [ ] **SPEC-100** | Production Queue Entity | Entity | Kitchen | Fase 2 | UNASSIGNED | IN_PROGRESS | WALKING_SKELETON_I0
- [ ] **SPEC-101** | Kitchen Alert Entity | Entity | Kitchen | Fase 2 | UNASSIGNED | IN_PROGRESS | WALKING_SKELETON_I0

---

## Billing & Tax

- [ ] **SPEC-145** | Integración fiscal ARCA | API | Billing & Tax | Fase 4 | P0 | DRAFT | BLOCKED

---

## Platform / Engineering

- [ ] **SPEC-207** | Engineering Quality & SDD Gates | Transversal | Platform / Engineering | Fase Todas, antes del primer código productivo | P0 | DRAFT | BLOCKED
- [ ] **SPEC-209** | Monorepo Architecture | Transversal | Platform / Engineering | Fase Antes del scaffolding | P0 | DRAFT | BLOCKED
- [ ] **SPEC-211** | Implementation Toolchain | Transversal | Platform / Engineering | Fase Antes del scaffolding | P0 | DRAFT | BLOCKED
- [ ] **SPEC-226** | I0 Platform Validation Spikes | Transversal | Platform / Engineering | Fase Antes de I0 READY_FOR_IMPLEMENTATION | P0 | DRAFT | BLOCKED

---

## Platform / FinOps

- [ ] **SPEC-208** | Zero-Cost MVP Platform | Transversal | Platform / FinOps | Fase MVP | P0 | DRAFT | BLOCKED

---

## Platform / Identity / Data

- [ ] **SPEC-210** | Data & Identity Platform | Transversal | Platform / Identity / Data | Fase Antes del walking skeleton con persistencia | P0 | DRAFT | BLOCKED

---

## Product / Frontend

- [ ] **SPEC-212** | Design System & Accessibility | Transversal | Product / Frontend | Fase Antes del scaffolding de UI | P0 | DRAFT | BLOCKED

---

## Platform / Product

- [ ] **SPEC-213** | MVP Walking Skeleton | Transversal | Platform / Product | Fase Primer incremento implementable | P0 | DRAFT | BLOCKED

---

## Platform / Operations

- [ ] **SPEC-214** | Environments, Configuration & Secrets | Transversal | Platform / Operations | Fase Antes del primer despliegue compartido | P0 | DRAFT | BLOCKED
- [ ] **SPEC-216** | Observability & Reliability | Transversal | Platform / Operations | Fase Antes del ambiente demo estable | P0 | DRAFT | BLOCKED
- [ ] **SPEC-218** | Offline Operation & Synchronization | Transversal | Platform / Operations | Fase Antes del piloto operativo | P0 | DRAFT | BLOCKED
- [ ] **SPEC-221** | CI/CD & Release Management | Transversal | Platform / Operations | Fase Antes de automatizar el primer deployment | P0 | DRAFT | BLOCKED
- [ ] **SPEC-223** | Realtime State Distribution | Transversal | Platform / Operations | Fase Antes de SPEC-222 I3 | P0 | DRAFT | BLOCKED

---

## Platform / Contracts

- [ ] **SPEC-215** | HTTP API Standards | Transversal | Platform / Contracts | Fase Antes del primer endpoint funcional | P0 | DRAFT | BLOCKED

---

## Platform / Integration

- [ ] **SPEC-217** | Events & Async Processing | Transversal | Platform / Integration | Fase Antes del primer efecto asíncrono | P0 | DRAFT | BLOCKED

---

## Security / Privacy / Platform

- [ ] **SPEC-219** | Application Security, Privacy & Tenant Isolation | Transversal | Security / Privacy / Platform | Fase Desde el walking skeleton; gate obligatorio antes del piloto | P0 | DRAFT | BLOCKED

---

## Data / Operations / Privacy

- [ ] **SPEC-220** | Data Lifecycle, Backup & Disaster Recovery | Transversal | Data / Operations / Privacy | Fase Antes de almacenar datos no regenerables | P0 | DRAFT | BLOCKED

---

## Product / Engineering

- [ ] **SPEC-222** | MVP Scope & Delivery Plan | Transversal | Product / Engineering | Fase Antes de comenzar implementación funcional | P0 | DRAFT | BLOCKED

---

## Engineering / Verification

- [ ] **SPEC-224** | Testing & Test Data Strategy | Transversal | Engineering / Verification | Fase Antes del primer código funcional | P0 | DRAFT | BLOCKED

---

## Product / Architecture / Engineering

- [ ] **SPEC-225** | Specification & ADR Governance | Transversal | Product / Architecture / Engineering | Fase Antes de marcar specs como READY_FOR_IMPLEMENTATION | P0 | DRAFT | BLOCKED

---

## Specs pendientes de especificar (stubs / placeholders)

Estas carpetas existen pero su `README.md` no fue completado (contenido tipo TBD / plantilla de peer review).

- [ ] **SPEC-102** | Commands API | API | Kitchen | Fase 2 | UNASSIGNED | IN_PROGRESS | WALKING_SKELETON_I0
- [ ] **SPEC-103** | Stations API | API | Kitchen | Fase 2 | UNASSIGNED | IN_PROGRESS | WALKING_SKELETON_I0
- [ ] **SPEC-104** | Production API | API | Kitchen | Fase 2 | UNASSIGNED | IN_PROGRESS | WALKING_SKELETON_I0
- [ ] **SPEC-105** | Kitchen Alerts API | API | Kitchen | Fase 2 | UNASSIGNED | IN_PROGRESS | WALKING_SKELETON_I0
- [ ] **SPEC-106** | CommandReceived Event | Event | Kitchen | Fase 2 | UNASSIGNED | IN_PROGRESS | WALKING_SKELETON_I0
- [ ] **SPEC-107** | CommandInProgress Event | Event | Kitchen | Fase 2 | UNASSIGNED | IN_PROGRESS | WALKING_SKELETON_I0
- [ ] **SPEC-108** | CommandCompleted Event | Event | Kitchen | Fase 2 | UNASSIGNED | IN_PROGRESS | WALKING_SKELETON_I0
- [ ] **SPEC-109** | Kitchen RBAC | RBAC | Kitchen | Fase 2 | UNASSIGNED | IN_PROGRESS | WALKING_SKELETON_I0
- [ ] **SPEC-110** | Kitchen State Machine | Workflow | Kitchen | Fase 2 | UNASSIGNED | IN_PROGRESS | WALKING_SKELETON_I0
- [ ] **SPEC-111** | spec-111-entity-shift | STUB
- [ ] **SPEC-112** | spec-112-entity-shift-assignment | STUB
- [ ] **SPEC-113** | spec-113-entity-time-entry | STUB
- [ ] **SPEC-114** | spec-114-entity-break-log | STUB
- [ ] **SPEC-115** | WorkShifts API | API | Workforce | Fase 3 | UNASSIGNED | IN_PROGRESS | PARTIALLY_ASSESSED
- [ ] **SPEC-116** | ShiftAssignments API | API | Workforce | Fase 3 | UNASSIGNED | IN_PROGRESS | PARTIALLY_ASSESSED
- [ ] **SPEC-117** | Time Tracking API | API | Workforce | Fase 3 | UNASSIGNED | IN_PROGRESS | PARTIALLY_ASSESSED
- [ ] **SPEC-118** | Break Management API | API | Workforce | Fase 3 | UNASSIGNED | IN_PROGRESS | PARTIALLY_ASSESSED
- [ ] **SPEC-119** | WorkShift Started Event | Event | Workforce | Fase 3 | UNASSIGNED | IN_PROGRESS | PARTIALLY_ASSESSED
- [ ] **SPEC-120** | WorkShift Completed Event | Event | Workforce | Fase 3 | UNASSIGNED | IN_PROGRESS | PARTIALLY_ASSESSED
- [ ] **SPEC-121** | Payroll Projection Calculation | Calculation | Workforce | Fase 3 | UNASSIGNED | IN_PROGRESS | PARTIALLY_ASSESSED
- [ ] **SPEC-122** | Workforce RBAC | RBAC | Workforce | Fase 3 | UNASSIGNED | IN_PROGRESS | PARTIALLY_ASSESSED
- [ ] **SPEC-123** | Labor Compliance Rules | Rules | Workforce | Fase 3 | UNASSIGNED | IN_PROGRESS | PARTIALLY_ASSESSED
- [ ] **SPEC-124** | CashRegister / CashSession Entity | Entity | Cash | Fase 3 | UNASSIGNED | IN_PROGRESS | WALKING_SKELETON_I0
- [ ] **SPEC-125** | CashMovement Entity | Entity | Cash | Fase 3 | UNASSIGNED | IN_PROGRESS | WALKING_SKELETON_I0
- [ ] **SPEC-126** | CashReconciliation Entity | Entity | Cash | Fase 3 | UNASSIGNED | IN_PROGRESS | WALKING_SKELETON_I0
- [ ] **SPEC-127** | Discount / DiscountApplication Entity | Entity | Cash | Fase 3 | UNASSIGNED | IN_PROGRESS | WALKING_SKELETON_I0
- [ ] **SPEC-128** | Cash Sessions API | API | Cash | Fase 3 | UNASSIGNED | IN_PROGRESS | WALKING_SKELETON_I0
- [ ] **SPEC-129** | Cash Movements API | API | Cash | Fase 3 | UNASSIGNED | IN_PROGRESS | WALKING_SKELETON_I0
- [ ] **SPEC-130** | Reconciliation API | API | Cash | Fase 3 | UNASSIGNED | IN_PROGRESS | WALKING_SKELETON_I0
- [ ] **SPEC-131** | Discounts API | API | Cash | Fase 3 | UNASSIGNED | IN_PROGRESS | WALKING_SKELETON_I0
- [ ] **SPEC-132** | Cash Movement Recorded Event | Event | Cash | Fase 3 | UNASSIGNED | IN_PROGRESS | WALKING_SKELETON_I0
- [ ] **SPEC-133** | Cash Session Reconciled Event | Event | Cash | Fase 3 | UNASSIGNED | IN_PROGRESS | WALKING_SKELETON_I0
- [ ] **SPEC-134** | Daily Settlement Calculation | Calculation | Cash | Fase 3 | UNASSIGNED | IN_PROGRESS | WALKING_SKELETON_I0
- [ ] **SPEC-135** | Cash RBAC | RBAC | Cash | Fase 3 | UNASSIGNED | IN_PROGRESS | WALKING_SKELETON_I0
- [ ] **SPEC-136** | Cash Compliance Rules | Rules | Cash | Fase 3 | UNASSIGNED | IN_PROGRESS | WALKING_SKELETON_I0 (placeholder — ver README)
- [ ] **SPEC-137** | spec-137-entity-invoice | STUB
- [ ] **SPEC-138** | spec-138-entity-invoice-line-item | STUB
- [ ] **SPEC-139** | spec-139-entity-fiscal-printer | STUB
- [ ] **SPEC-140** | spec-140-entity-fiscal-certificate | STUB
- [ ] **SPEC-141** | spec-141-entity-qr-code-fiscal | STUB
- [ ] **SPEC-142** | spec-142-entity-invoice-template | STUB
- [ ] **SPEC-143** | spec-143-entity-tax-rate | STUB
- [ ] **SPEC-144** | spec-144-api-invoices | STUB
- [ ] **SPEC-146** | spec-146-api-fiscal-printers | STUB
- [ ] **SPEC-147** | spec-147-api-qr-code | STUB
- [ ] **SPEC-148** | spec-148-api-invoice-templates | STUB
- [ ] **SPEC-149** | spec-149-api-tax-rates | STUB
- [ ] **SPEC-150** | spec-150-api-invoice-export | STUB
- [ ] **SPEC-151** | spec-151-event-invoice-generated | STUB
- [ ] **SPEC-152** | spec-152-event-invoice-emitted | STUB
- [ ] **SPEC-153** | spec-153-event-arca-confirmed | STUB
- [ ] **SPEC-154** | spec-154-calculation-tax | STUB
- [ ] **SPEC-155** | spec-155-calculation-invoice-numbering | STUB
- [ ] **SPEC-156** | spec-156-rules-fiscal-compliance | STUB
- [ ] **SPEC-157** | spec-157-entity-feedback | STUB
- [ ] **SPEC-158** | spec-158-entity-rating | STUB
- [ ] **SPEC-159** | spec-159-entity-external-review | STUB
- [ ] **SPEC-160** | spec-160-entity-sentiment-analysis | STUB
- [ ] **SPEC-161** | spec-161-entity-reputation-score | STUB
- [ ] **SPEC-162** | spec-162-api-feedback | STUB
- [ ] **SPEC-163** | spec-163-api-ratings | STUB
- [ ] **SPEC-164** | spec-164-api-external-reviews | STUB
- [ ] **SPEC-165** | spec-165-api-sentiment-analysis | STUB
- [ ] **SPEC-166** | spec-166-api-reputation-dashboard | STUB
- [ ] **SPEC-167** | spec-167-event-feedback-submitted | STUB
- [ ] **SPEC-168** | spec-168-event-review-received | STUB
- [ ] **SPEC-169** | spec-169-event-reputation-updated | STUB
- [ ] **SPEC-170** | spec-170-integration-external-platforms | STUB
- [ ] **SPEC-171** | spec-171-rbac-feedback | STUB
- [ ] **SPEC-172** | spec-172-entity-integration | STUB
- [ ] **SPEC-173** | spec-173-entity-oauth-credential | STUB
- [ ] **SPEC-174** | spec-174-entity-webhook-subscription | STUB
- [ ] **SPEC-175** | spec-175-entity-sync-log | STUB
- [ ] **SPEC-176** | spec-176-api-integrations | STUB
- [ ] **SPEC-177** | spec-177-api-oauth | STUB
- [ ] **SPEC-178** | spec-178-api-webhooks | STUB
- [ ] **SPEC-179** | spec-179-api-sync | STUB
- [ ] **SPEC-180** | spec-180-api-connector-status | STUB
- [ ] **SPEC-181** | spec-181-api-integration-test | STUB
- [ ] **SPEC-182** | spec-182-connector-payment-providers | STUB
- [ ] **SPEC-183** | spec-183-connector-accounting-software | STUB
- [ ] **SPEC-184** | spec-184-connector-pos-system | STUB
- [ ] **SPEC-185** | spec-185-event-integration-synced | STUB
- [ ] **SPEC-186** | spec-186-rbac-integrations | STUB
- [ ] **SPEC-187** | spec-187-entity-analytics-event | STUB
- [ ] **SPEC-188** | spec-188-entity-metric-definition | STUB
- [ ] **SPEC-189** | spec-189-entity-analytics-dashboard | STUB
- [ ] **SPEC-190** | spec-190-entity-alert | STUB
- [ ] **SPEC-191** | spec-191-entity-ml-model | STUB
- [ ] **SPEC-192** | spec-192-entity-prediction | STUB
- [ ] **SPEC-193** | spec-193-api-analytics | STUB
- [ ] **SPEC-194** | spec-194-api-metrics | STUB
- [ ] **SPEC-195** | spec-195-api-dashboard-analytics | STUB
- [ ] **SPEC-196** | spec-196-api-alerts | STUB
- [ ] **SPEC-197** | spec-197-api-ml-models | STUB
- [ ] **SPEC-198** | spec-198-api-predictions | STUB
- [ ] **SPEC-199** | spec-199-api-reports | STUB
- [ ] **SPEC-200** | spec-200-api-insights | STUB
- [ ] **SPEC-201** | spec-201-ai-maitre-rewind | STUB
- [ ] **SPEC-202** | spec-202-ai-maitre-live | STUB
- [ ] **SPEC-203** | spec-203-ai-maitre-ahead | STUB
- [ ] **SPEC-204** | spec-204-ai-maitre-autopilot | STUB
- [ ] **SPEC-205** | spec-205-event-metric-updated | STUB
- [ ] **SPEC-206** | spec-206-rbac-analytics | STUB

---

## Resumen de conteos

| Categoría | Cantidad |
| --- | --- |
| Specs con contenido completo | 90 |
| Specs stub/placeholder | 136 |
| **TOTAL** | **226** |

---

## Cómo usar este catálogo

1. **Elegir spec:** SPEC-NNN que te interese
2. **Verificar contenido:** revisar `docs/sdd/spec-NNN-.../README.md` para Estado y Readiness reales
3. **Completar stubs:** si la spec figura como STUB, escribir README.md, objective.md, specification.md, structure.md/contract.md, rules.md, plan.md, tasks.md, verification.md
4. **Actualizar Readiness:** NOT_ASSESSED → READY_FOR_I0_REVIEW → READY_FOR_IMPLEMENTATION, resolviendo blockers (owner/reviewer) cuando Readiness = BLOCKED
5. **Update this file:** regenerar este índice cuando cambien specs (ver script de generación en el historial de conversación)
