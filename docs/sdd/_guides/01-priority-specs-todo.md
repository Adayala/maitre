# Specs a escribir — MVP (Orden de prioridad)

## Fase 1: Plataforma Fundacional

Estas specs habilitan que el primer tenant se registre y configure su sucursal.

### Prioridad crítica (Semana 1-2)

#### Organization
- [ ] `spec-entity-tenant.md` — Tenant: id, name, email, status, createdAt, timezone, country
- [ ] `spec-entity-brand.md` — Brand: id, tenantId, name, logo, configuración heredable
- [ ] `spec-entity-fiscal-entity.md` — FiscalEntity: CUIT, condición, certificados, puntos de venta
- [ ] `spec-entity-branch.md` — Branch: código, nombre, dirección, servicios activos, config
- [ ] `spec-entity-salon.md` — Salon: branchId, nombre, capacidad física, mesas
- [ ] `spec-entity-table.md` — Table: salonId, número, capacidad, posición x/y, estado derivado
- [ ] `spec-api-tenants.md` — POST /tenants (crear), GET /tenants/:id (obtener), PATCH /tenants/:id
- [ ] `spec-api-branches.md` — POST /branches, GET /branches/:id, PATCH /branches/:id (servicios, config)
- [ ] `spec-api-salons.md` — POST /branches/:id/salons, GET, PATCH, DELETE
- [ ] `spec-api-tables.md` — POST /salons/:id/tables, GET, PATCH, DELETE

#### Identity
- [ ] `spec-entity-user.md` — User: email, name, role, status, branches asignadas
- [ ] `spec-entity-role.md` — Role: OWNER, ADMIN, MANAGER, MAÎTRE, WAITER, COOK, CASHIER (read-only)
- [ ] `spec-entity-membership.md` — Membership: user + tenant + roles + branch restrictions
- [ ] `spec-api-users.md` — POST /users (invitar), GET /users/:id, PATCH /users/:id, DELETE
- [ ] `spec-api-auth.md` — POST /auth/login, POST /auth/refresh, POST /auth/logout

#### Subscription
- [ ] `spec-entity-subscription.md` — Subscription: items, status (TRIALING, ACTIVE, etc), billing cycle
- [ ] `spec-entity-subscription-item.md` — SubscriptionItem: serviceCode, scope, branches, price
- [ ] `spec-entity-entitlement.md` — Entitlement: derecho efectivo (FLOOR.ACCESS, FLOOR.BRANCHES)
- [ ] `spec-calculation-entitlements.md` — Cómo se calculan entitlements desde items
- [ ] `spec-api-subscriptions.md` — POST /subscriptions, GET /subscriptions/:id, PATCH /subscriptions/:id (agregar items)
- [ ] `spec-api-entitlements.md` — GET /subscriptions/:id/entitlements (read-only, derechos efectivos)

#### RBAC & Audit
- [ ] `spec-rbac-organization.md` — OWNER/ADMIN crean tenant, ADMIN crean branch, MANAGER configura
- [ ] `spec-rbac-identity.md` — ADMIN invita users, cambia roles; OWNER revoca
- [ ] `spec-rbac-subscription.md` — Solo OWNER/ADMIN modifican suscripción
- [ ] `spec-entity-audit-log.md` — AuditLog: quién, qué, cuándo, estado anterior/nuevo, motivo
- [ ] `spec-api-audit.md` — GET /audit/logs?resource=...&actor=...&dateRange=...

### Prioridad alta (Semana 2-3)

#### Catalog
- [ ] `spec-entity-menu.md` — Menu: branchId, nombre, versión, status (draft, active, archived)
- [ ] `spec-entity-category.md` — Category: menuId, nombre, descripción, orden
- [ ] `spec-entity-product.md` — Product: categoryId, nombre, descripción, precio, foto, alérgenos, disponibilidad
- [ ] `spec-api-menus.md` — POST /menus, GET /menus/:id, PATCH /menus/:id
- [ ] `spec-api-categories.md` — POST /menus/:id/categories, GET, PATCH, DELETE
- [ ] `spec-api-products.md` — POST /categories/:id/products, GET, PATCH, DELETE, GET /products/availability

#### Events (Fase 1)
- [ ] `spec-event-tenant-created.md` — TenantCreated
- [ ] `spec-event-branch-created.md` — BranchCreated
- [ ] `spec-event-user-invited.md` — UserInvited
- [ ] `spec-event-service-activated.md` — ServiceActivated
- [ ] `spec-event-service-deactivated.md` — ServiceDeactivated

#### Dashboard
- [ ] `spec-api-dashboard-setup.md` — GET /dashboard/setup-status (qué falta configurar)
- [ ] `spec-api-dashboard-overview.md` — GET /dashboard (resumen tenant, suscripción, sucursales)

---

## Fase 2: Operación Mínima

Habilita que un mozo tome pedidos y cocina los prepare.

### Prioridad crítica (Semana 3-5)

#### Shifts & Jornadas
- [ ] `spec-entity-service-template.md` — PlantillaServicio: horarios recurrentes (L-V 12-15)
- [ ] `spec-entity-service-day.md` — JornadaServicio: fecha, plantilla, estado (draft, open, closed)
- [ ] `spec-entity-tour.md` — Plaza: jornada + mozo + mesas asignadas
- [ ] `spec-api-service-templates.md` — POST /service-templates, GET, PATCH, DELETE
- [ ] `spec-api-service-days.md` — POST /branches/:id/service-days (abrir), PATCH (cerrar)
- [ ] `spec-api-tours.md` — POST /service-days/:id/tours, GET, PATCH, DELETE
- [ ] `spec-event-service-day-opened.md` — ServiceDayOpened

#### Floor (Salón)
- [ ] `spec-entity-visit.md` — Visita: groupSize, tables, status, timings, openedBy
- [ ] `spec-entity-table-occupation.md` — OcupacionMesa: visita + mesa + intervalos
- [ ] `spec-state-machine-visit.md` — Estados: WAITING → SEATED → ORDERING → IN_SERVICE → CHECK_REQUESTED → PAYING → CLOSED
- [ ] `spec-state-machine-table.md` — Estados derivados: AVAILABLE, RESERVED, OCCUPIED, PAYING, CLEANING, BLOCKED
- [ ] `spec-api-visits.md` — POST /visits (abrir), GET /visits/:id, PATCH /visits/:id (cambiar status)
- [ ] `spec-api-tables-status.md` — GET /branches/:id/tables/status (estado actual de todas)
- [ ] `spec-event-visit-opened.md` — VisitOpened
- [ ] `spec-event-table-status-changed.md` — TableStatusChanged
- [ ] `spec-rbac-floor.md` — WAITER abre visita, MAÎTRE ve todas, ADMIN controla

#### Ordering (Pedidos)
- [ ] `spec-entity-order.md` — Order: visitId, items, origin (WAITER, CUSTOMER_QR), status
- [ ] `spec-entity-order-item.md` — OrderItem: productId, qty, modifiers, price, origin
- [ ] `spec-state-machine-order.md` — Estados: DRAFT → SUBMITTED → ACCEPTED → IN_PREP → READY → DELIVERED (con CANCELLED)
- [ ] `spec-api-orders.md` — POST /orders (crear), GET /orders/:id, PATCH /orders/:id/items/:id
- [ ] `spec-event-order-submitted.md` — OrderSubmitted
- [ ] `spec-event-order-item-approved.md` — OrderItemApproved
- [ ] `spec-rbac-ordering.md` — WAITER crea, MAÎTRE/ADMIN aprueba

#### Kitchen (Cocina)
- [ ] `spec-entity-preparation-center.md` — CentroPreparacion: cocina, barra, parrilla
- [ ] `spec-entity-station.md` — Estacion: cocina hot, cocina cold, barra
- [ ] `spec-entity-kitchen-ticket.md` — Comanda: orden + items + estación + timings
- [ ] `spec-entity-ticket-item.md` — TicketItem: producto, qty, modifiers, status
- [ ] `spec-state-machine-ticket.md` — Estados: PENDING → IN_PROGRESS → PARTIALLY_READY → READY → DELIVERED
- [ ] `spec-api-kitchen-tickets.md` — GET /kitchen/tickets?station=...&status=... (filtrado por estación)
- [ ] `spec-api-kitchen-items.md` — PATCH /kitchen/tickets/:id/items/:id (cambiar a READY/DELIVERED/CANCELLED)
- [ ] `spec-event-kitchen-ticket-created.md` — KitchenTicketCreated
- [ ] `spec-event-kitchen-item-ready.md` — KitchenItemReady
- [ ] `spec-rbac-kitchen.md` — COOK ve su estación, MAÎTRE ve todas

#### Bill & Payment (básico)
- [ ] `spec-entity-bill.md` — Cuenta: visitId, items, subtotal, tax, total, status (OPEN, PARTIALLY_PAID, PAID)
- [ ] `spec-state-machine-bill.md` — Estados: OPEN → PARTIALLY_PAID → PAID
- [ ] `spec-api-bills.md` — POST /bills (generar), GET /bills/:id
- [ ] `spec-event-check-requested.md` — CheckRequested
- [ ] `spec-event-bill-generated.md` — BillGenerated

#### QR Menu (estático)
- [ ] `spec-entity-qr-code.md` — QRCode: branchId, tableId, URL a menú
- [ ] `spec-api-public-menus.md` — GET /public/branches/:branchId/menu (sin auth, QR)

#### Dashboard Operativo
- [ ] `spec-api-dashboard-floor.md` — GET /dashboard/floor (visitas, mesas, pedidos en tiempo real)
- [ ] `spec-api-dashboard-kitchen.md` — GET /dashboard/kitchen (tickets, alertas)

### Prioridad alta (Semana 5-6)

#### App Specs (Floor, Kitchen)
- [ ] `spec-app-floor-open-service.md` — Flujo: abrir jornada → asignar plazas
- [ ] `spec-app-floor-open-visit.md` — Flujo: crear visita → asignar mesa → abrir servicio
- [ ] `spec-app-floor-take-order.md` — Flujo: tomar pedido → enviar a cocina
- [ ] `spec-app-floor-request-check.md` — Flujo: pedir cuenta → ver en app → autorizar pago
- [ ] `spec-app-kitchen-receive-ticket.md` — Flujo: recibir comanda → marcar items → enviar listos
- [ ] `spec-app-kitchen-track-status.md` — Flujo: ver alertas de demora, estado de preparación

#### Transversales críticas (aplica a Fases 1-5)
- [ ] `spec-multi-tenancy.md` — Isolación: X-Tenant-Id en headers, tenant_id en cada row
- [ ] `spec-error-codes.md` — Catálogo: 400, 401, 403, 404, 409, 429, 500 y casos
- [ ] `spec-idempotency.md` — Idempotency-Key en POSTs críticos (order, payment)
- [ ] `spec-authorization.md` — Checks de autorización en cada endpoint

---

## Fase 3: Adquisición y Autoservicio

Habilita que clientes reserven y pidan desde celular.

### Prioridad alta (Semana 6-8)

#### Reservations
- [ ] `spec-entity-reservation.md` — Reserva: fecha, hora, guests, status, confirmación
- [ ] `spec-entity-group.md` — GrupoCliente: name, email, phone, guestCount
- [ ] `spec-state-machine-reservation.md` — Estados: DRAFT → HELD → CONFIRMED → ARRIVED → SEATED → COMPLETED (con CANCELLED, NO_SHOW)
- [ ] `spec-api-public-reservations.md` — POST /public/branches/:branchId/reservations (sin auth)
- [ ] `spec-api-reservations.md` — GET /reservations/:id, PATCH /reservations/:id (confirmar, cancelar)
- [ ] `spec-api-availability.md` — GET /public/branches/:branchId/availability?date=...&guests=...
- [ ] `spec-event-reservation-created.md` — ReservationCreated
- [ ] `spec-event-reservation-confirmed.md` — ReservationConfirmed

#### QR Ordering (híbrido)
- [ ] `spec-entity-qr-session.md` — SesionQR: tableId, sessionId, carrito, estado
- [ ] `spec-api-qr-orders.md` — POST /public/orders (sin auth, desde QR)
- [ ] `spec-event-qr-order-submitted.md` — QROrderSubmitted
- [ ] `spec-rbac-qr-ordering.md` — CUSTOMER (anónimo) pide, WAITER aprueba

#### Guest App
- [ ] `spec-app-guest-reservation.md` — Flujo: sucursal → fecha/hora → cantidad → confirmar
- [ ] `spec-app-guest-qr-menu.md` — Flujo: escanear QR → categorías → carrito
- [ ] `spec-app-guest-qr-order.md` — Flujo: pedir desde QR → enviar → esperar

#### Feedback (básico)
- [ ] `spec-entity-feedback.md` — Feedback: visitId, rating, categories, comment
- [ ] `spec-api-feedback.md` — POST /feedback (después de visita), GET /feedback/:id
- [ ] `spec-event-feedback-requested.md` — FeedbackRequested
- [ ] `spec-event-feedback-received.md` — FeedbackReceived

---

## Fase 4: Dinero y Fiscalidad

Habilita cierre de caja y emisión de facturas.

### Prioridad media (Semana 8-10)

#### Cash
- [ ] `spec-entity-cash-box.md` — Caja: número, serie, sucursal
- [ ] `spec-entity-cash-session.md` — SesionCaja: apertura, movimientos, cierre
- [ ] `spec-state-machine-cash-session.md` — Estados: OPENING → ACTIVE → CLOSING → CLOSED
- [ ] `spec-api-cash-boxes.md` — POST /cash-boxes, GET /cash-boxes/:id
- [ ] `spec-api-cash-sessions.md` — POST /cash-boxes/:id/sessions, PATCH (abrir/cerrar)

#### Payments
- [ ] `spec-entity-payment.md` — Pago: billId, monto, método (CASH, CARD, TRANSFER), status
- [ ] `spec-state-machine-payment.md` — Estados: PENDING → PROCESSING → COMPLETED (con FAILED)
- [ ] `spec-api-payments.md` — POST /payments, GET /payments/:id
- [ ] `spec-event-payment-completed.md` — PaymentCompleted

#### Billing & ARCA (fuera de MVP v1 pero spec)
- [ ] `spec-entity-billing-document.md` — ComprobanteFiscal: tipo, número, estado
- [ ] `spec-entity-fiscal-point.md` — PuntoVentaFiscal: numeración registrada
- [ ] `spec-api-billing-documents.md` — POST /billing-documents, GET /billing-documents/:id

#### Cash App
- [ ] `spec-app-cash-open-session.md` — Flujo: abrir caja → saldo inicial
- [ ] `spec-app-cash-register-payment.md` — Flujo: seleccionar cuenta → ingresar pago → recibo
- [ ] `spec-app-cash-close-session.md` — Flujo: cerrar caja → arqueo

---

## Fase 5: Integración y Reputación

Habilita conectar con Google Business Profile.

### Prioridad baja (Semana 10-12)

#### Reputation
- [ ] `spec-entity-external-review.md` — ExternalReview: provider, rating, comment
- [ ] `spec-entity-external-location-mapping.md` — ExternalLocationMapping: branch → provider
- [ ] `spec-api-reputation-reviews.md` — GET /reputation/reviews?provider=...&branch=...
- [ ] `spec-event-external-review-received.md` — ExternalReviewReceived

#### Google Business Profile Connector
- [ ] `spec-connector-gbp-auth.md` — OAuth2 con Google
- [ ] `spec-connector-gbp-sync.md` — Sincronización de reseñas
- [ ] `spec-api-connectors.md` — POST /connectors, GET /connectors/:id

#### Connect App
- [ ] `spec-app-connect-add-gbp.md` — Flujo: autenticarse con Google → mapear branches → activar

---

## Transversales (Aplican a todo)

### Críticas (Fase 1)
- [ ] `spec-multi-tenancy.md` — Isolación de datos, X-Tenant-Id
- [ ] `spec-authorization.md` — Checks de entitlement en cada endpoint
- [ ] `spec-error-codes.md` — Catálogo de errores HTTP

### Altas (Fase 2-3)
- [ ] `spec-idempotency.md` — Idempotency-Key en POSTs sensibles
- [ ] `spec-distributed-tracing.md` — Tracing por visit/order, correlationId
- [ ] `spec-offline-capability.md` — Qué se sincroniza offline (Floor, Kitchen, Guest)

### Medias (Fase 3-4)
- [ ] `spec-health-checks.md` — Endpoints de salud
- [ ] `spec-metrics.md` — Qué métricas se publican
- [ ] `spec-logging.md` — Niveles, redacción, almacenamiento
- [ ] `spec-encryption.md` — TLS en tránsito, cifrado en reposo
- [ ] `spec-data-retention.md` — Qué se guarda, cuánto tiempo

### Bajas (Fase 5+)
- [ ] `spec-circuit-breaker.md` — Manejo de fallos de dependencias
- [ ] `spec-backup-recovery.md` — RTO/RPO

---

## Cómo usar este TODO

```
1. Selecciona una spec del TOP de "Prioridad crítica (Semana X)"
2. Lee el formato en README.md de /docs/sdd
3. Crea archivo: /docs/sdd/spec-[type]-[name].md
4. Escribe siguiendo el formato
5. Marca [ ] → [x] en este archivo
6. Actualiza 00-mvp-specifications-roadmap.md (Status: READY FOR IMPLEMENTATION)
```

**Goal:** Completar Fase 1 en ~2 semanas, Fase 2 en ~3 semanas.

