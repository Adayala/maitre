# MVP Specifications Roadmap

## Propósito

Listar todas las especificaciones (APIs, eventos, entidades, máquinas de estado, RBAC) que deben escribirse para completar el MVP.

Cada especificación puede tener múltiples artefactos:
- **Entity spec:** Estructura, campos, invariantes.
- **State machine spec:** Estados válidos, transiciones, precondiciones.
- **API specs:** Endpoints (1 spec por endpoint o recurso).
- **Event specs:** Eventos que publica (1 spec por evento).
- **RBAC spec:** Quién puede hacer qué.
- **Integration spec:** Cómo se integra con terceros.

---

## Fase 1: Plataforma Fundacional

**App:** Maitre Dash (web)
**Objetivo:** Un tenant puede registrarse, comprar servicios, crear sucursal, configurar salón.

### Specs a realizar

#### Organization Domain

- [ ] `spec-entity-tenant.md` — Tenant: campos, ciclo de vida, auditoría
- [ ] `spec-entity-brand.md` — Brand: relación con tenant, herencia de config
- [ ] `spec-entity-fiscal-entity.md` — FiscalEntity: CUIT, condición tributaria, certificados
- [ ] `spec-entity-branch.md` — Branch: sucursal, servicios activos, timezone
- [ ] `spec-entity-salon.md` — Salon: área física, mesas
- [ ] `spec-entity-table.md` — Table: número, capacidad, x/y, estados por jornada
- [ ] `spec-api-tenants.md` — POST /tenants, GET /tenants/:id, PATCH /tenants/:id
- [ ] `spec-api-branches.md` — POST /branches, GET /branches/:id, PATCH /branches/:id
- [ ] `spec-api-salons.md` — POST /branches/:id/salons, GET, PATCH, DELETE
- [ ] `spec-api-tables.md` — POST /salons/:id/tables, GET, PATCH, DELETE
- [ ] `spec-event-tenant-created.md` — TenantCreated evento
- [ ] `spec-event-branch-created.md` — BranchCreated evento
- [ ] `spec-rbac-organization.md` — Quién puede crear/editar tenant, branch, salon (owner, admin)

#### Identity Domain

- [ ] `spec-entity-user.md` — User: email, role, status (invited, active, deactivated)
- [ ] `spec-entity-role.md` — Role: ADMIN, OWNER, MANAGER, WAITER, COOK, CASHIER, GUEST
- [ ] `spec-entity-permission.md` — Permission: recurso + acción (user:create, order:submit, etc)
- [ ] `spec-entity-membership.md` — Membership: user → tenant + roles + branches
- [ ] `spec-api-users.md` — POST /users, GET /users/:id, PATCH /users/:id, DELETE
- [ ] `spec-api-roles.md` — GET /roles (read-only, predefinidos)
- [ ] `spec-api-auth.md` — POST /auth/login, POST /auth/refresh, POST /auth/logout
- [ ] `spec-event-user-invited.md` — UserInvited evento
- [ ] `spec-event-user-authenticated.md` — UserAuthenticated evento
- [ ] `spec-rbac-identity.md` — Quién puede invitar, desactivar, cambiar roles

#### Subscription Domain

- [ ] `spec-entity-subscription.md` — Subscription: items, status, billing cycle, próxima fecha
- [ ] `spec-entity-subscription-item.md` — SubscriptionItem: serviceCode, scope, branches, price
- [ ] `spec-entity-entitlement.md` — Entitlement: derecho efectivo (FLOOR.ACCESS, FLOOR.BRANCHES, etc)
- [ ] `spec-entity-quota.md` — Quota: límite cuantitativo (MAX_BRANCHES, MAX_USERS, etc)
- [ ] `spec-api-subscriptions.md` — POST /subscriptions, GET /subscriptions/:id, PATCH /subscriptions/:id
- [ ] `spec-api-entitlements.md` — GET /subscriptions/:id/entitlements (read-only)
- [ ] `spec-event-service-activated.md` — ServiceActivated evento
- [ ] `spec-event-service-deactivated.md` — ServiceDeactivated evento
- [ ] `spec-rbac-subscription.md` — Solo OWNER/ADMIN pueden cambiar suscripción
- [ ] `spec-calculation-entitlements.md` — Cómo se calculan entitlements desde subscription items

#### Catalog Domain

- [ ] `spec-entity-menu.md` — Menu: versión, status (draft, active, archived), branch
- [ ] `spec-entity-category.md` — Category: nombre, orden, descripción
- [ ] `spec-entity-product.md` — Product: nombre, precio, foto, alérgenos, disponibilidad
- [ ] `spec-api-menus.md` — POST /menus, GET /menus/:id, PATCH /menus/:id
- [ ] `spec-api-categories.md` — POST /menus/:id/categories, GET, PATCH, DELETE
- [ ] `spec-api-products.md` — POST /categories/:id/products, GET, PATCH, DELETE
- [ ] `spec-rbac-catalog.md` — MANAGER/ADMIN pueden crear/editar menú

#### Audit Domain

- [ ] `spec-entity-audit-log.md` — AuditLog: actor, action, resource, oldValue, newValue, timestamp, reason
- [ ] `spec-api-audit.md` — GET /audit/logs?resource=...&actor=...&dateRange=...
- [ ] `spec-event-action-recorded.md` — ActionRecorded evento (cada cambio sensible)

#### Dashboard

- [ ] `spec-api-dashboard-setup.md` — GET /dashboard/setup-status (qué falta configurar)
- [ ] `spec-api-dashboard-overview.md` — GET /dashboard/overview (tenant summary)

---

## Fase 2: Operación Mínima

**Apps:** Maitre Floor (tablet), Maitre Kitchen (tablet)
**Objetivo:** Mozo toma pedido, cocina lo prepara, se genera cuenta.

### Specs a realizar

#### Shifts Domain

- [ ] `spec-entity-service-template.md` — PlantillaServicio: nombre, horario (L-V 12-15, L-V 20-23)
- [ ] `spec-entity-service-day.md` — JornadaServicio: fecha, plantilla, estado (draft, open, closing, closed)
- [ ] `spec-entity-tour.md` — Plaza: jornada + mozo + mesas asignadas
- [ ] `spec-entity-assignment.md` — AsignacionPlaza: mozo → plaza
- [ ] `spec-api-service-templates.md` — POST /service-templates, GET, PATCH, DELETE
- [ ] `spec-api-service-days.md` — POST /branches/:id/service-days, GET, PATCH (open/close)
- [ ] `spec-api-tours.md` — POST /service-days/:id/tours, GET, PATCH, DELETE
- [ ] `spec-event-service-day-opened.md` — ServiceDayOpened evento
- [ ] `spec-rbac-shifts.md` — MANAGER/MAÎTRE pueden abrir/cerrar jornada, asignar plazas

#### Floor Domain

- [ ] `spec-entity-visit.md` — Visita: groupSize, tables, status, timings, openedBy
- [ ] `spec-entity-table-occupation.md` — OcupacionMesa: visit + table + startTime + endTime
- [ ] `spec-state-machine-visit.md` — Estados: WAITING → SEATED → ORDERING → IN_SERVICE → CHECK_REQUESTED → PAYING → CLOSED
- [ ] `spec-state-machine-table.md` — Estados: AVAILABLE, RESERVED, OCCUPIED, PAYING, CLEANING, BLOCKED (derivados de ocupaciones)
- [ ] `spec-api-visits.md` — POST /visits, GET /visits/:id, PATCH /visits/:id (cambiar status)
- [ ] `spec-api-tables-status.md` — GET /branches/:id/tables/status (estado actual de todas las mesas)
- [ ] `spec-event-visit-opened.md` — VisitOpened evento
- [ ] `spec-event-table-status-changed.md` — TableStatusChanged evento
- [ ] `spec-rbac-floor.md` — WAITER puede abrir visita, MAÎTRE ve todas, ADMIN controla

#### Ordering Domain

- [ ] `spec-entity-order.md` — Order: visit, items, origin (WAITER, CUSTOMER_QR), status
- [ ] `spec-entity-order-item.md` — OrderItem: product, qty, modifiers, price, origin, approvedBy
- [ ] `spec-state-machine-order.md` — Estados: DRAFT → SUBMITTED → ACCEPTED → IN_PREPARATION → READY → DELIVERED (con CANCELLED)
- [ ] `spec-api-orders.md` — POST /orders, GET /orders/:id, PATCH /orders/:id/items/:itemId
- [ ] `spec-api-products-availability.md` — GET /menus/:id/products?branch=...&date=... (checktarifa actual)
- [ ] `spec-event-order-submitted.md` — OrderSubmitted evento
- [ ] `spec-event-order-item-approved.md` — OrderItemApproved evento
- [ ] `spec-rbac-ordering.md` — WAITER puede crear orders, MAÎTRE/ADMIN pueden aprobar

#### Kitchen Domain

- [ ] `spec-entity-kitchen-ticket.md` — Comanda: order reference, items, station, status, timings
- [ ] `spec-entity-ticket-item.md` — TicketItem: product, qty, modifiers, status (pending, ready, delivered)
- [ ] `spec-entity-preparation-center.md` — CentroPreparacion: cocina, barra, parrilla (nombre, ubicación)
- [ ] `spec-entity-station.md` — Estacion: subdivisión (ej: cocina cold, cocina hot, barra)
- [ ] `spec-state-machine-ticket.md` — Estados: PENDING → IN_PROGRESS → PARTIALLY_READY → READY → DELIVERED (con CANCELLED)
- [ ] `spec-api-kitchen-tickets.md` — GET /kitchen/tickets?station=...&status=... (por estación, filtrado)
- [ ] `spec-api-kitchen-items.md` — PATCH /kitchen/tickets/:id/items/:itemId (cambiar status a READY/CANCELLED)
- [ ] `spec-event-kitchen-ticket-created.md` — KitchenTicketCreated evento
- [ ] `spec-event-kitchen-item-ready.md` — KitchenItemReady evento
- [ ] `spec-rbac-kitchen.md` — COOK ve solo su estación, MAÎTRE ve todas, ADMIN controla

#### Bill & Payment (básico)

- [ ] `spec-entity-bill.md` — Cuenta: visit, items, subtotal, tax, total, status (open, partially_paid, paid)
- [ ] `spec-entity-bill-item.md` — BillItem: product, qty, price, item derivado de order
- [ ] `spec-state-machine-bill.md` — Estados: OPEN → PARTIALLY_PAID → PAID
- [ ] `spec-api-bills.md` — POST /bills (generar desde visit), GET /bills/:id
- [ ] `spec-event-check-requested.md` — CheckRequested evento
- [ ] `spec-event-bill-generated.md` — BillGenerated evento
- [ ] `spec-rbac-billing.md` — WAITER puede pedir cuenta, CASHIER genera

#### QR Menu (estático)

- [ ] `spec-entity-qr-code.md` — QRCode: branchId, tableId, URL a menú público
- [ ] `spec-api-public-menus.md` — GET /public/branches/:branchId/menu (sin auth, QR público)
- [ ] `spec-rbac-public-menu.md` — Sin autenticación, acceso público

#### Dashboard Operativo

- [ ] `spec-api-dashboard-floor.md` — GET /dashboard/floor?branch=...&date=... (visitas activas, mesas, pedidos)
- [ ] `spec-api-dashboard-kitchen.md` — GET /dashboard/kitchen?branch=...&date=... (tickets, alertas)

---

## Fase 3: Adquisición y Autoservicio

**App:** Maitre Guest (celular/web)
**Objetivo:** Cliente reserva, pide desde QR, solicita cuenta.

### Specs a realizar

#### Reservations Domain

- [ ] `spec-entity-reservation.md` — Reserva: branch, date, time, guests, status, confirmation
- [ ] `spec-entity-group.md` — GrupoCliente: name, email, phone, guestCount
- [ ] `spec-entity-retention.md` — RetencionDisponibilidad: bloqueo temporal mientras se confirma
- [ ] `spec-entity-waitlist.md` — ListaEspera: grupo pendiente de disponibilidad
- [ ] `spec-state-machine-reservation.md` — Estados: DRAFT → HELD → CONFIRMED → ARRIVED → SEATED → COMPLETED (con CANCELLED, NO_SHOW)
- [ ] `spec-api-public-reservations.md` — POST /public/branches/:branchId/reservations (sin auth, público)
- [ ] `spec-api-reservations.md` — GET /reservations/:id, PATCH /reservations/:id (confirmar, cancelar)
- [ ] `spec-api-availability.md` — GET /public/branches/:branchId/availability?date=...&guests=...
- [ ] `spec-event-reservation-created.md` — ReservationCreated evento
- [ ] `spec-event-reservation-confirmed.md` — ReservationConfirmed evento
- [ ] `spec-rbac-reservations.md` — Public can create, WAITER/MAÎTRE can manage

#### Guest Domain

- [ ] `spec-entity-guest.md` — Comensal: identificable o anónimo, visita
- [ ] `spec-entity-guest-session.md` — SesionGuest: QR session, cart, estado
- [ ] `spec-api-guest-profile.md` — GET /guest/profile (básico)

#### QR Ordering (híbrido)

- [ ] `spec-entity-qr-session.md` — SesionQR: tableId, sessionId, carrito, estado
- [ ] `spec-api-qr-orders.md` — POST /public/orders (sin auth, desde QR), GET /qr/session/:id/orders
- [ ] `spec-event-qr-order-submitted.md` — QROrderSubmitted evento
- [ ] `spec-rbac-qr-ordering.md` — CUSTOMER (anónimo) puede pedir, WAITER aprueba opcionalmente

#### Bill & Payment (digital)

- [ ] `spec-api-public-bills.md` — GET /public/visits/:visitId/bill (sin auth pero con acceso a la visita)
- [ ] `spec-api-digital-payment.md` — POST /payments (soporte básico)

#### Guest App Features

- [ ] `spec-app-guest-reservation.md` — Flujo: seleccionar rama → fecha/hora → cantidad → datos → confirmar
- [ ] `spec-app-guest-qr-menu.md` — Flujo: abrir menú QR → categorías → producto → carrito
- [ ] `spec-app-guest-order.md` — Flujo: pedir desde QR → enviar → aprobación (opcional) → esperar
- [ ] `spec-app-guest-bill.md` — Flujo: pedir cuenta → ver en app → confirmar pago

---

## Fase 4: Dinero y Fiscalidad

**App:** Maitre Cash (web, tablet)
**Objetivo:** Cajero cobra, emite factura, cierra caja.

### Specs a realizar

#### Cash Domain

- [ ] `spec-entity-cash-box.md` — Caja: número, serie, sucursal, sesiones
- [ ] `spec-entity-cash-session.md` — SesionCaja: apertura, movimientos, arqueo, cierre
- [ ] `spec-entity-cash-movement.md` — MovimientoCaja: ingreso, egreso, tipo, monto, referencia
- [ ] `spec-state-machine-cash-session.md` — Estados: OPENING → ACTIVE → CLOSING → CLOSED
- [ ] `spec-api-cash-boxes.md` — POST /cash-boxes, GET /cash-boxes/:id
- [ ] `spec-api-cash-sessions.md` — POST /cash-boxes/:id/sessions, GET, PATCH (open/close)
- [ ] `spec-api-cash-movements.md` — POST /sessions/:id/movements, GET
- [ ] `spec-rbac-cash.md` — CASHIER abre/cierra caja, MANAGER archiva

#### Payments Domain

- [ ] `spec-entity-payment.md` — Pago: bill, amount, method (CASH, CARD, TRANSFER), status, receipt
- [ ] `spec-state-machine-payment.md` — Estados: PENDING → PROCESSING → COMPLETED (con FAILED, CANCELLED)
- [ ] `spec-api-payments.md` — POST /payments, GET /payments/:id
- [ ] `spec-event-payment-completed.md` — PaymentCompleted evento
- [ ] `spec-rbac-payments.md` — CASHIER registra, ADMIN audita

#### Billing Domain

- [ ] `spec-entity-billing-document.md` — ComprobanteFiscal: tipo (Invoice, Receipt), número, validación
- [ ] `spec-entity-fiscal-point.md` — PuntoVentaFiscal: numeración registrada en ARCA por entidad fiscal
- [ ] `spec-api-billing-documents.md` — POST /billing-documents, GET /billing-documents/:id
- [ ] `spec-event-billing-document-authorized.md` — BillingDocumentAuthorized evento

#### ARCA Integration (fuera de MVP v1 pero spec)

- [ ] `spec-arca-authorization.md` — Integración con ARCA para autorizar puntos de venta y emitir comprobantes
- [ ] `spec-arca-events.md` — Eventos de sincronización con ARCA

#### Cash App Features

- [ ] `spec-app-cash-open-session.md` — Flujo: abrir caja → saldo inicial → confirmar
- [ ] `spec-app-cash-register-payment.md` — Flujo: seleccionar cuenta → ingresar pago → confirmar → recibo
- [ ] `spec-app-cash-close-session.md` — Flujo: cerrar caja → contar dinero → arqueo → reconciliar

---

## Fase 5: Integración y Reputación

**App:** Maitre Connect (web), Maitre Dash (extensión)
**Objetivo:** Conectar con Google Business Profile, sincronizar reseñas.

### Specs a realizar

#### Feedback Domain

- [ ] `spec-entity-feedback.md` — Feedback: visit, rating, categories, comment, timestamp
- [ ] `spec-entity-feedback-case.md` — FeedbackCase: feedback + acciones (responder, escalar)
- [ ] `spec-api-feedback.md` — POST /feedback (después de visita cerrada), GET /feedback/:id
- [ ] `spec-event-feedback-requested.md` — FeedbackRequested evento
- [ ] `spec-event-feedback-received.md` — FeedbackReceived evento
- [ ] `spec-rbac-feedback.md` — Guest envía feedback, MANAGER/ADMIN ve reportes

#### Reputation Domain

- [ ] `spec-entity-external-review.md` — ExternalReview: provider, rating, comment, sourceUrl, status
- [ ] `spec-entity-external-location-mapping.md` — ExternalLocationMapping: branch → provider + externalLocationId
- [ ] `spec-entity-response-draft.md` — ResponseDraft: review + draft text + status (pending_approval, published)
- [ ] `spec-api-reputation-reviews.md` — GET /reputation/reviews?provider=...&branch=...&dateRange=...
- [ ] `spec-api-reputation-responses.md` — PATCH /reviews/:id/response (aprobar/publicar respuesta)
- [ ] `spec-event-external-review-received.md` — ExternalReviewReceived evento
- [ ] `spec-event-response-drafted.md` — ResponseDrafted evento
- [ ] `spec-rbac-reputation.md` — MANAGER/ADMIN pueden responder

#### Google Business Profile Connector

- [ ] `spec-connector-gbp-auth.md` — OAuth2 con Google, almacenar credenciales cifradas
- [ ] `spec-connector-gbp-sync.md` — Sincronizar reseñas: polling + webhook
- [ ] `spec-connector-gbp-response.md` — Publicar respuesta en GBP
- [ ] `spec-api-connectors.md` — POST /connectors, GET /connectors/:id, PATCH, DELETE
- [ ] `spec-event-connector-synchronized.md` — ConnectorSynchronized evento

#### Integration Hub

- [ ] `spec-webhooks.md` — Definir eventos que se envían a terceros (order, payment, etc)
- [ ] `spec-rate-limiting.md` — Rate limits por tenant y conector

#### Connect App Features

- [ ] `spec-app-connect-add-connector.md` — Flujo: seleccionar proveedor → autenticarse (OAuth) → mapear branches → activar
- [ ] `spec-app-connect-manage-credentials.md` — Flujo: ver conectores activos → actualizar → revocar

---

## Fase 6: Inteligencia

**Maitre Dash (extensión)**
**Objetivo:** Mostrar predicciones, ejecutar acciones automáticas supervisadas.

### Specs a realizar (desacopladas del MVP)

#### Analytics Domain

- [ ] `spec-analytics-events.md` — Qué eventos se guardan para análisis
- [ ] `spec-analytics-aggregations.md` — Agregaciones: visitas por hora, ingresos por producto, etc
- [ ] `spec-api-analytics.md` — GET /analytics/...

#### AI Domain

- [ ] `spec-ai-rewind.md` — Reconstruir qué pasó, causas, aprendizaje
- [ ] `spec-ai-live.md` — Estado actual de capacidad, riesgos, cuellos de botella
- [ ] `spec-ai-ahead.md` — Predicciones 15/30/60 minutos
- [ ] `spec-ai-autopilot.md` — Acciones automáticas supervisadas

---

## Especificaciones transversales (Fases 1-6)

### Observabilidad y Auditoria

- [ ] `spec-distributed-tracing.md` — Tracing por visit, order, payment (correlationId)
- [ ] `spec-metrics.md` — Métricas por tenant, sucursal, servicio
- [ ] `spec-logging.md` — Log levels, sensitive data masking, storage
- [ ] `spec-health-checks.md` — Endpoint de salud de cada servicio

### Security

- [ ] `spec-encryption.md` — Datos en tránsito (TLS) y en reposo (secrets)
- [ ] `spec-secrets-management.md` — Rotación, revocación de credenciales
- [ ] `spec-access-control.md` — Authorization checks en cada endpoint
- [ ] `spec-attack-prevention.md` — CSRF, SQL injection, XSS, rate limiting

### Data Integrity

- [ ] `spec-idempotency.md` — Keys en POSTs críticos (order, payment), deduplicación
- [ ] `spec-consistency.md` — Eventual consistency, conflict resolution
- [ ] `spec-backup-recovery.md` — RTO/RPO, estrategia de backup
- [ ] `spec-data-retention.md` — Qué se guarda, cuánto tiempo, cómo se borra

### Multi-tenancy

- [ ] `spec-tenant-isolation.md` — Datos de tenant A no accesibles desde tenant B
- [ ] `spec-tenant-context.md` — Propagación de X-Tenant-Id en llamadas internas
- [ ] `spec-tenant-per-row.md` — Cada row en DB tiene tenant_id explícito

### Error Handling

- [ ] `spec-error-codes.md` — Catálogo de errores (400, 401, 403, 404, 409, 429, 500)
- [ ] `spec-error-messages.md` — Qué información se devuelve, qué no expone detalles internos
- [ ] `spec-retry-strategy.md` — Backoff exponencial, máx reintentos por tipo de error
- [ ] `spec-circuit-breaker.md` — Manejo de fallos de dependencias externas

### Offline Capability

- [ ] `spec-offline-sync.md` — Qué datos se sincronizan, cuándo, resolución de conflictos
- [ ] `spec-offline-identifiers.md` — Cómo se asignan IDs offline
- [ ] `spec-offline-policies.md` — Qué operaciones son permitidas offline

---

## Formato de cada spec

Cada archivo de especificación debe tener:

```markdown
# [Nombre de entidad/API/Evento]

## Propósito

[1-2 líneas de qué es esto y por qué existe]

## Estructura / Definición

[JSON schema, UML, o descripción detallada]

## Reglas / Invariantes

- [Regla 1]
- [Regla 2]

## Ejemplos

[Ejemplo concreto en JSON o pseudo-código]

## Consumidores / Publicadores

[Quién usa esto, quién lo produce]

## Entitlements

[Qué derecho se requiere para usarlo]

## Status

[PLANNED, DRAFT, READY FOR IMPLEMENTATION, IN PROGRESS, DONE]
```

---

## Conteo de specs

### Fase 1: ~48 specs
- Tenant, Brand, FiscalEntity, Branch, Salon, Table (6 entities)
- User, Role, Permission, Membership (4 entities)
- Subscription, SubscriptionItem, Entitlement, Quota (4 entities)
- Menu, Category, Product (3 entities)
- AuditLog (1 entity)
- APIs: tenants (3), branches (3), salons (3), tables (3), users (3), roles (1), auth (3), subscriptions (3), entitlements (1), menus (3), categories (3), products (3), audit (1), dashboard (2)
- Events: tenant-created, branch-created, user-invited, user-authenticated, service-activated, service-deactivated (6)
- RBAC: organization, identity, subscription, catalog, audit (5)
- Calculations: entitlements (1)

### Fase 2: ~60 specs
- Service entities (5), Floor entities (3), Ordering entities (4), Kitchen entities (5), Cash entities (3)
- State machines (5)
- APIs: service-templates, service-days, tours, visits, tables-status, orders, products-availability, kitchen-tickets, kitchen-items, bills (30+)
- Events: service-day-opened, visit-opened, table-status-changed, order-submitted, order-item-approved, kitchen-ticket-created, kitchen-item-ready, check-requested, bill-generated (9)
- RBAC: shifts, floor, ordering, kitchen, billing (5)

### Fase 3: ~35 specs
- Reservation entities (4), Guest entities (2), QR entities (2), Bill & Payment updates
- APIs: public-reservations, availability, guest-profile, qr-orders, public-bills, digital-payment
- Events: reservation-created, reservation-confirmed, qr-order-submitted, feedback-requested
- App specs: reservation flow, QR menu flow, order flow, bill flow (4)
- RBAC: reservations, guest, qr-ordering (3)

### Fase 4: ~25 specs
- Cash entities (3), Payments entities (2), Billing entities (2)
- State machines (3)
- APIs: cash-boxes, cash-sessions, cash-movements, payments, billing-documents (15)
- Events: payment-completed, billing-document-authorized
- App specs: open-session, register-payment, close-session (3)

### Fase 5: ~30 specs
- Feedback entities (2), Reputation entities (3)
- APIs: feedback, reputation-reviews, reputation-responses, connectors, webhooks (10)
- Events: feedback-requested, feedback-received, external-review-received, response-drafted (4)
- Connector specs: GBP auth, sync, response (3)
- App specs: add-connector, manage-credentials (2)

### Fase 6: ~20 specs
- Analytics, AI, Autopilot (desacopladas del MVP)

### Transversales: ~25 specs
- Tracing, metrics, logging, health, encryption, secrets, access-control, attack-prevention, idempotency, consistency, backup, retention, tenant-isolation, error-codes, error-messages, retry, circuit-breaker, offline-sync, offline-ids, offline-policies

**Total MVP (Fases 1-5): ~193 specs**
**Total extensiones (Fase 6 + transversales): ~45 specs**

---

## Status tracker

```
Fase 1 — Plataforma Fundacional
[ ] Organización
[ ] Identity
[ ] Subscription
[ ] Catalog
[ ] Audit

Fase 2 — Operación Mínima
[ ] Shifts
[ ] Floor
[ ] Ordering
[ ] Kitchen
[ ] Bill & Payment (básico)
[ ] QR Menu estático
[ ] Dashboard operativo

Fase 3 — Adquisición
[ ] Reservations
[ ] Guest
[ ] QR Ordering híbrido
[ ] Bill & Payment (digital)
[ ] Guest App

Fase 4 — Dinero y Fiscalidad
[ ] Cash
[ ] Payments
[ ] Billing
[ ] Cash App

Fase 5 — Integración
[ ] Feedback
[ ] Reputation
[ ] Google Business Profile
[ ] Integration Hub
[ ] Connect App

Fase 6 — Inteligencia (fuera de MVP)
[ ] Analytics
[ ] AI

Transversales
[ ] Observabilidad
[ ] Security
[ ] Data integrity
[ ] Multi-tenancy
[ ] Error handling
[ ] Offline capability
```

