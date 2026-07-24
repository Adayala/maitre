# Objetivo — SPEC-071

Definir la API de reservas y sus comandos de transición garantizando aislamiento, idempotencia,
control de concurrencia y consumo transaccional de capacidad.

## Criterios de aceptación

### CAD-071-01 — La API separa superficies internas, públicas y campos PII

Superficies interna y pública poseen rutas, DTO, permisos/capabilities y campos PII
diferenciados.

### CAD-071-02 — Create coordina idempotencia y CapacityHold expirable atómico

create es idempotente y crea PENDING más CapacityHold expirable en una transacción.

### CAD-071-03 — Los comandos del ciclo de vida exigen revisión, precondiciones y reasons

confirm/cancel/seat/no-show exigen revisión, precondiciones y reason codes según
ciclo de vida.

### CAD-071-04 — Confirm y liberaciones serializan capacidad; seat crea una única Visit

confirm y liberaciones serializan capacidad; seat vincula exactamente una Visit y nunca
confía en Availability.

### CAD-071-05 — Las lecturas preservan cursor estable, redacción y no enumeración

list/detail aplican cursor, filtros, redacción y no enumeración por alcance.

### CAD-071-06 — La aprobación exige evidencia temporal, de capability y aislamiento

La aprobación exige fixtures de DST, carreras, retry, capability, RBAC, auditoría, outbox
y aislamiento.
