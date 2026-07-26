# Especificación — SPEC-120 WorkShiftCompleted

Nombre normativo `workforce.work-shift.completed.v1`. Se emite al command administrativo que
cambia `WorkShift` a `COMPLETED`, no por `clock-out` individual.

## Trigger exacto

El evento se emite únicamente cuando la transición administrativa a `COMPLETED` queda persistida
exitosamente.

Regla aprobada para I0:

- no se emite por último `clock-out`
- no se emite por reaching de `endsAtUtc`
- no se emite por retries que no cambian estado lógico
- si existen restricciones de negocio que impiden completar, no existe evento

## Envelope y payload mínimo I0

Payload normativo mínimo:

- `workShiftId`
- `branchId`
- `completedAt`
- `laborPolicyVersion`
- `aggregateRevision`
- `outcome`
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
- el payload mínimo no incluye `EmploymentId`, time entries, payroll, importes ni flags agregados
- `outcome` mínimo I0 es `COMPLETED`; variantes como forced-close requieren contrato futuro explícito

## Open entries y override

En I0 el evento sólo describe el hecho ya persistido de que el shift quedó `COMPLETED`.

No está implementado en I0 un bloqueo explícito por open entries dentro del command de complete, ni
un contrato de override auditado para forced-close.

## Dedupe, reorder y retries

- consumidores deduplican por `eventId`
- retry/replay de publicación no crea un segundo cierre lógico
- no se garantiza orden global entre eventos de Workforce; sólo correlación/causalidad por aggregate
  cuando la infraestructura lo preserve

## Privacidad y agregados diferidos

En I0 no se publican agregados de finalización ni conteos operativos en este evento.
