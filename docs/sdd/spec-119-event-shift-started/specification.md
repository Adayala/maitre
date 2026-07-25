# Especificación — SPEC-119

Nombre normativo `workforce.work-shift.started.v1`. Se emite sólo por command que cambia `WorkShift`
de PUBLISHED a IN_PROGRESS; no representa primer clock-in ni hora planificada.

Envelope SPEC-217 + `workShiftId`, sucursal, intervalo planificado, `startedAt`, policy/revisión y tipo de actor.
No incluye fichadas, Employee IDs ni remuneración. Agregados de dotación sólo se publican si
alcanzan el umbral de privacidad configurado.

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

- `brandId` puede derivarse aguas abajo si el contrato de envelope base no lo provee todavía
- agregados operativos/privacy-threshold son opcionales en I0; no son requisito del payload mínimo
- el contrato no exige PII ni identificadores de empleos/asignaciones

## Dedupe, reorder y retries

- un mismo hecho lógico conserva identidad por `eventId` dentro de outbox/publicación
- consumidores deduplican por `eventId`
- el orden relativo con otros eventos de Workforce no se garantiza globalmente; sólo se preserva
  causalidad por aggregate/correlation cuando la infraestructura lo permita
- replay o retry de publicación no crean un segundo inicio lógico

## Privacidad y agregados diferidos

En I0 no se exige publicar conteos de dotación en este evento.

Si en una versión futura se agregan:

- deben ser privacy-safe
- deben suprimirse bajo umbral configurado
- no pueden permitir reidentificación razonable en branches pequeñas
