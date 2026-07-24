# Verificación — SPEC-071

## Criterios

### CAD-071-01 — La API separa superficies internas, públicas y campos PII

- [ ] OpenAPI separa operaciones y campos internos/públicos.

### CAD-071-02 — Create coordina idempotencia y CapacityHold expirable atómico

- [ ] retry devuelve Reservation/Hold previos y rollback no deja parciales.

### CAD-071-03 — Los comandos del lifecycle exigen revisión, precondiciones y reasons

- [ ] matriz de comandos, revisiones, reasons y Problem Details es completa.

### CAD-071-04 — Confirm y liberaciones serializan capacidad; seat crea una única Visit

- [ ] confirmaciones concurrentes no sobreasignan; seat crea una Visit.

### CAD-071-05 — Las lecturas preservan cursor estable, redacción y no enumeración

- [ ] cursor/filtros/redacción y `404` impiden enumeración.

### CAD-071-06 — La aprobación exige evidencia temporal, de capability y aislamiento

- [ ] DST, capability, RBAC, auditoría, outbox y aislamiento fallan cerrado.
