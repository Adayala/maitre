# Objetivo — SPEC-031

## Propósito

Consultar y administrar Subscription/items mediante operaciones idempotentes y concurrentes, sin
procesar pagos ni confiar el tenant objetivo a un cliente común.

## Criterios de aceptación

### CAD-031-01 — `GET /v1/subscription` devuelve la Subscription vigente del contexto autorizado

`GET /v1/subscription` devuelve la Subscription vigente del contexto autorizado sin aceptar tenantId
arbitrario en path/query.

### CAD-031-02 — `POST /v1/subscriptions` sólo permite provisioning autorizado e idempotente

`POST /v1/subscriptions` sólo permite provisioning de plataforma autorizado, usa Idempotency-Key y no
crea dos subscriptions vigentes.

### CAD-031-03 — `PATCH /v1/subscriptions/{id}` exige `If-Match`

`PATCH /v1/subscriptions/{id}` exige `If-Match` y sólo aplica transiciones/items compatibles con
catálogo, alcance y ciclo de vida.

### CAD-031-04 — Mutación y outbox o recomputation request se confirman atómicamente

Mutación y outbox/recomputation request se confirman atómicamente; una falla no deja Subscription
modificada con Entitlement anterior presentado como vigente.

### CAD-031-05 — La API no cobra, prorratea, reembolsa ni interpreta billing como autorización

La API no cobra, prorratea, reembolsa ni interpreta plan/billing como autorización.

### CAD-031-06 — Estados HTTP, auditoría y aislamiento cubren provisioning, concurrencia y aislamiento entre tenants

401/403/404/409/412/422, auditoría y aislamiento cubren provisioning, concurrencia, duplicate active,
config inválida y aislamiento entre tenants.
