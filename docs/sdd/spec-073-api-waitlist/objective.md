# Objetivo — SPEC-073

Definir la operación auditable de waitlist y el seating atómico sin confundir notificación con
reserva de capacidad.

## Criterios de aceptación

### CAD-073-01 — La API de waitlist delimita rutas, comandos y alcance de Branch

add/list/detail y cinco comandos poseen rutas, DTO, permisos y alcance Branch explícitos.

### CAD-073-02 — Add y comandos son idempotentes; list sigue orden autoritativo

add y comandos son idempotentes; list usa orden autoritativo, cursor y filtros acotados.

### CAD-073-03 — Notify crea intención desacoplada sin tomar capacidad

notify crea una NotificationIntent deduplicada sin adquirir capacidad ni depender del
provider.

### CAD-073-04 — Seat coordina Allocation y Visit con un único ganador concurrente

seat revalida y confirma Allocation más Visit atómicamente; carreras dejan un ganador.

### CAD-073-05 — Priority override exige control explícito y nunca usa PII

priority override exige permiso, reason, expiry/límite y nunca usa PII.

### CAD-073-06 — La aprobación exige evidencia de fairness, retry y aislamiento

La aprobación exige fixtures de fairness, rate limit, retry, redacción, auditoría, outbox
y aislamiento.
