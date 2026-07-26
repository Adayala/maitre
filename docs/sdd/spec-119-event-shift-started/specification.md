# Especificación — SPEC-119 WorkShiftStarted

Nombre normativo `workforce.work-shift.started.v1`. Se emite sólo cuando un command cambia
`WorkShift` de `PUBLISHED` a `IN_PROGRESS`; no representa primer `clock-in` ni la hora planificada
por calendario.

## Trigger exacto

El evento se emite únicamente cuando la transición administrativa `PUBLISHED -> IN_PROGRESS`
queda persistida exitosamente.

Regla aprobada para I0:

- no se emite por primer `clock-in`
- no se emite por reaching de `startsAtUtc`
- no se emite por reintentos que no cambian estado lógico
- si la transición falla antes de persistirse, no existe hecho a publicar

## Envelope y payload mínimo I0

Payload normativo mínimo:

- `workShiftId`
- `branchId`
- `startsAtUtc`
- `endsAtUtc`
- `startedAt`
- `laborPolicyVersion`
- `aggregateRevision`
- `actorType`

Envelope esperado:

- `eventId`
- `eventName`
- `eventVersion`
- `occurredAt`
- `producer`
- `tenantId`
- `aggregateType`
- `aggregateId`
- `correlationId`

Regla aprobada para I0:

- `producer = workforce`
- `eventVersion = 1`
- `aggregateType = WorkShift`
- `actorType = INTERNAL`
- el contrato no exige PII, identificadores de employments/asignaciones ni conteos operativos

## Dedupe, reorder y retries

- un mismo hecho lógico conserva identidad por `eventId` dentro de outbox/publicación
- consumidores deduplican por `eventId`
- el orden relativo con otros eventos de Workforce no se garantiza globalmente; sólo se preserva
  causalidad por aggregate/correlation cuando la infraestructura lo permita
- replay o retry de publicación no crean un segundo inicio lógico

## Privacidad y agregados diferidos

En I0 no se publican conteos de dotación ni agregados de staffing en este evento.
