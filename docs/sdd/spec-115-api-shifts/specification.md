# Especificación — SPEC-115 WorkShifts API

La API I0 de `WorkShift` expone create, list, detail y comandos explícitos `publish`, `start`,
`complete` y `cancel`. No hay endpoint de update materializado para turnos `DRAFT`.

La API recibe y devuelve `startsAtUtc`, `endsAtUtc` y `timezone`, manteniendo separación entre
planificación del turno y asistencia real.

## Surface I0

Endpoints normativos I0:

- `POST /v1/branches/:branchId/work-shifts`
- `GET /v1/branches/:branchId/work-shifts`
- `GET /v1/work-shifts/:id`
- `POST /v1/work-shifts/:id/publish`
- `POST /v1/work-shifts/:id/start`
- `POST /v1/work-shifts/:id/complete`
- `POST /v1/work-shifts/:id/cancel`

Diferido en I0:

- `PATCH/PUT /v1/work-shifts/:id`
- cloning/revision fork explícito
- forced-complete con payload especializado

Regla aprobada para I0:

- create produce siempre `DRAFT`
- el lifecycle posterior ocurre sólo vía commands explícitos
- no existe edición materializada del shift vía API aunque la entidad preserve `revision`

## Payload de create

`POST /v1/branches/:branchId/work-shifts` acepta:

- `timezone`
- `businessDate`
- `startsAtUtc`
- `endsAtUtc`
- `laborPolicyVersion`
- `servicePeriodId?`

Validaciones mínimas:

- `startsAtUtc < endsAtUtc`
- `timezone` presente
- branch scope válido
- `laborPolicyVersion` presente

Respuesta mínima:

- identidad del `WorkShift`
- scope (`tenantId`, `branchId`)
- temporalidad (`businessDate`, `startsAtUtc`, `endsAtUtc`, `timezone`)
- `laborPolicyVersion`
- `status`
- `revision`
- timestamps de auditoría de aggregate

## List/detail y filtros

`GET /v1/branches/:branchId/work-shifts` soporta I0:

- `status?`
- `order? = startsAtUtc.asc|startsAtUtc.desc|businessDate.asc|businessDate.desc`
- `limit?`
- `offset?`

Regla aprobada para I0:

- las collections filtran antes de paginar
- `status` inválido produce `400`
- branch fuera de scope produce `404`
- detail fuera de scope o inexistente produce `404`

## Idempotencia, revisión y concurrencia

Regla aprobada para I0:

- lifecycle commands (`publish`, `start`, `complete`, `cancel`) requieren `If-Match`
- si falta `If-Match`, la API responde `400`
- si `If-Match` no coincide con `revision`, la API responde `409`
- create no implementa hoy replay por `Idempotency-Key`

## Semántica de lifecycle

Estados:

- `DRAFT`
- `PUBLISHED`
- `IN_PROGRESS`
- `COMPLETED`
- `CANCELLED`

Transiciones válidas I0:

- `DRAFT -> PUBLISHED`
- `DRAFT -> CANCELLED`
- `PUBLISHED -> IN_PROGRESS`
- `PUBLISHED -> CANCELLED`
- `IN_PROGRESS -> COMPLETED`

Regla aprobada para I0:

- `COMPLETED` y `CANCELLED` son terminales
- `complete` sobre un `DRAFT` o `PUBLISHED` no debe degradar silenciosamente
- `cancel` sobre `IN_PROGRESS` no está permitido en I0

## Publish

`publish` representa la confirmación administrativa del turno planificado.

Regla aprobada para I0:

- revalida conflictos de shift activo incompatible dentro de la branch
- si la validación falla, responde `409`

Lo no exigido todavía en I0:

- staffing target formal obligatorio
- cálculo normativo pleno de compliance en `publish`
- revalidación profunda de assignments ya existentes antes de publicar

## Start

`start` representa inicio administrativo del shift.

Regla aprobada para I0:

- no depende de clock-ins individuales
- publica el evento normativo de SPEC-119
- mantiene separación entre planificación y asistencia real

## Complete

`complete` representa cierre administrativo del shift.

Regla aprobada para I0:

- no hace `clock-out` automático
- no cierra `TimeEntry` ni `BreakLog`
- publica el evento normativo de SPEC-120 sólo si la transición realmente ocurrió

No está implementado en I0 un bloqueo explícito de `complete` por marcas abiertas.

## Cancel

`cancel` representa anulación administrativa del shift antes de su ejecución efectiva.

Regla aprobada para I0:

- puede aplicarse sobre `DRAFT` y `PUBLISHED`
- no puede aplicarse sobre `IN_PROGRESS`, `COMPLETED` o `CANCELLED`
- un shift cancelado no acepta nuevas asignaciones operativas

## Taxonomía mínima de errores

La API distingue al menos:

- `400` por input/query/header inválido
- `404` por recurso inexistente o fuera de scope
- `409` por transición inválida, conflicto activo o revisión esperada incumplida

No aprobado en I0:

- degradar conflictos a warnings silenciosos
- completar o cancelar implicando correcciones automáticas de asistencia
