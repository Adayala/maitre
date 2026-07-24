# Verificación — SPEC-007

## Criterios

### CAD-007-01 — Un actor sin capability de provisioning no puede crear tenants ni inferir su existencia

- [ ] `POST /tenants` exige capability de provisioning aprobada;
- [ ] un actor sin permiso recibe respuesta deny-by-default;
- [ ] el endpoint no enumera tenants preexistentes ni sugiere existencia por mensajes diferenciales.

### CAD-007-02 — Reintentar provisioning con la misma key/payload produce una única raíz y un único hecho lógico `TenantCreated`; cambiar payload devuelve conflicto

- [ ] misma idempotency key + mismo payload devuelve el mismo resultado lógico;
- [ ] misma idempotency key + payload distinto falla con conflicto;
- [ ] no se duplican Tenant, owner bootstrap ni hecho lógico publicado.

### CAD-007-03 — Tenant y outbox se confirman o revierten atómicamente, sin raíz parcial visible

- [ ] no existe Tenant visible sin persistencia consistente del hecho asociado;
- [ ] rollback evita estados parciales visibles;
- [ ] reintentos posteriores pueden recuperarse sin duplicación.

### CAD-007-04 — GET/PATCH sólo resuelven contexto autorizado y responden `404` ante recursos inexistentes o cross-tenant sin distinguirlos

- [ ] `GET` y `PATCH` sólo operan dentro del alcance autorizado;
- [ ] recurso inexistente y recurso cross-tenant no se distinguen externamente;
- [ ] la autorización no depende de conocer `tenantId` en body o query.

### CAD-007-05 — PATCH no modifica `tenantId` ni ownership, exige `If-Match` y aplica lifecycle explícito sin eliminación física

- [ ] `PATCH` exige control de concurrencia con `If-Match`;
- [ ] no permite cambiar `tenantId`, ownership ni bootstrap identity;
- [ ] lifecycle respeta estados permitidos y no existe eliminación física.

### CAD-007-06 — El contrato OpenAPI, Problem Details, auditoría y pruebas contractuales cubren bootstrap, retry, rollback, RBAC y concurrencia

- [ ] Problem Details cubre errores de provisioning, conflicto e invalidación;
- [ ] auditoría registra actor, correlation ID y decisión relevante;
- [ ] existen pruebas contractuales enlazadas para bootstrap, retry, rollback, RBAC y concurrencia.
