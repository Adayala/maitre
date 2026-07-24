# Verificación — SPEC-031

## Criterios

### CAD-031-01 — `GET /v1/subscription` devuelve la Subscription vigente del contexto autorizado sin aceptar tenantId arbitrario en path/query

- [ ] GET sólo devuelve Subscription del contexto autorizado;
- [ ] no acepta tenantId arbitrario como autoridad;
- [ ] recursos fuera de alcance no se enumeran.

### CAD-031-02 — `POST /v1/subscriptions` sólo permite provisioning de plataforma autorizado, usa Idempotency-Key y no crea dos subscriptions vigentes

- [ ] provisioning idéntico es idempotente;
- [ ] conflicto no duplica vigente;
- [ ] provisioning no autorizado o de otro tenant falla sin enumeración.

### CAD-031-03 — `PATCH /v1/subscriptions/{id}` exige `If-Match` y sólo aplica transiciones/items compatibles con catálogo, alcance y ciclo de vida

- [ ] PATCH con revisión desactualizada devuelve 412;
- [ ] transition/config inválida devuelve 422;
- [ ] sólo se aceptan items compatibles con catálogo, alcance y ciclo de vida.

### CAD-031-04 — Mutación y outbox/recomputation request se confirman atómicamente; una falla no deja Subscription modificada con Entitlement anterior presentado como vigente

- [ ] mutación/outbox/recomputation mantienen atomicidad;
- [ ] no queda estado parcial visible;
- [ ] recomputation request sigue la mutación confirmada.

### CAD-031-05 — La API no cobra, prorratea, reembolsa ni interpreta plan/billing como autorización

- [ ] no se invoca billing, charge, refund o proration;
- [ ] plan/billing no actúan como autorización;
- [ ] la API conserva separación respecto de cobros.

### CAD-031-06 — 401/403/404/409/412/422, auditoría y aislamiento cubren provisioning, concurrencia, duplicate active, config inválida y aislamiento entre tenants

- [ ] reducción incompatible entra remediation sin borrar uso;
- [ ] errores 401/403/404/409/412/422 siguen Problem Details;
- [ ] auditoría y aislamiento cubren duplicate active, config inválida y aislamiento entre tenants.
