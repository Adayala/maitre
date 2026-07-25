# Especificación — SPEC-120 WorkShiftCompleted

Nombre normativo `workforce.work-shift.completed.v1`. Se emite al command administrativo que
cambia WorkShift a COMPLETED, no por clock-out individual.

Envelope SPEC-217 + workShift ID, branch, completedAt, outcome, policy/revision y flags agregados.
Entradas abiertas impiden completar salvo override auditado; el evento nunca contiene fichadas,
Employment IDs o importes. Conteos pequeños se suprimen según privacy threshold.

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

- flags/agregados de completion son opcionales en I0
- el payload mínimo no incluye `EmploymentId`, time entries, payroll ni importes
- `outcome` mínimo I0 es `COMPLETED`; variantes como forced-close requieren contrato futuro explícito

## Open entries y override

La spec separa dos planos:

- regla de negocio que decide si el shift puede completarse
- hecho publicado una vez que el shift efectivamente quedó `COMPLETED`

En I0:

- si open entries bloquean el cierre, no se publica evento
- si en el futuro existe override auditado que permita completar, el hecho publicado sigue siendo
  `workforce.work-shift.completed.v1`, con extensión de payload/versionado explícita si hiciera falta

## Dedupe, reorder y retries

- consumidores deduplican por `eventId`
- retry/replay de publicación no crea un segundo cierre lógico
- no se garantiza orden global entre eventos de Workforce; sólo correlación/causalidad por aggregate
  cuando la infraestructura lo preserve

## Privacidad y agregados diferidos

En I0 no se exige publicar agregados de finalización.

Si en el futuro se agregan:

- deben ser privacy-safe
- deben suprimirse bajo umbral configurado
- no pueden exponer fichadas individuales ni importes
