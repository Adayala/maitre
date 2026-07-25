# Especificación — SPEC-115 WorkShifts API

Create/list/detail/edit DRAFT y comandos `publish`, `start`, `complete`, `cancel`. Create/commands
son idempotentes; edits/transiciones usan `If-Match`. Intervals se reciben como UTC + timezone IANA
y se validan contra LaborPolicyVersion.

Publish revalida cobertura, conflictos y Employment de assignments. Complete no cierra TimeEntry
individual silenciosamente; reporta entradas abiertas y exige workflow explícito. Las respuestas
separan planificación de asistencia real.

El surface incluye create/list/detail/update sobre `DRAFT` y comandos explícitos `publish`,
`start`, `complete` y `cancel`. No existe edición arbitraria de una revisión ya publicada o en
progreso: un cambio material posterior genera una nueva revisión del WorkShift o un comando
explícito de ciclo de vida según corresponda.

Las lecturas respetan `tenantId`, `brandId`, `branchId` y filtros temporales. La API recibe y
devuelve `startsAtUtc`, `endsAtUtc` y timezone IANA para evitar ambigüedad de DST. Fuera de alcance,
detail usa `404`; las colecciones filtran antes de paginar.

`publish` valida labor policy, staffing requerido, conflictos aprobados y vigencia de Employment de
las asignaciones asociadas. `complete` nunca implica clock-out automático ni cierre implícito de
TimeEntry/BreakLog: si existen marcas abiertas o anomalías relevantes, la API las reporta y exige
workflow explícito en el dominio de time tracking.

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
- si no existe endpoint de update materializado, la spec no lo exige en I0 aunque preserve el
  concepto de revisión/versionado

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
- timezone IANA presente
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

- create y lifecycle commands deben ser idempotentes por `Idempotency-Key`
- cuando un command no esté materializado aún con replay storage completo, la spec lo marca como
  objetivo normativo aunque la implementación siga parcial
- transiciones de estado deben validar revisión esperada (`If-Match` o equivalente) una vez que ese
  control se materialice en la API de WorkShift
- un retry no debe crear un segundo shift ni una segunda transición lógica

Frontera I0 actual:

- `If-Match` ya está bien establecido en assignments, breaks y ajustes
- para WorkShift commands, la spec congela la exigencia aunque la materialización aún pueda estar
  incompleta

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

- revalida intervalos y policy vigente declarada en el shift
- revalida conflictos de shift activo incompatible dentro de la branch
- revalida que las asignaciones asociadas no queden obviamente fuera de elegibilidad de Employment
- si una validación falla, responde error explícito; no publica “igual pero con warning”

Lo no exigido todavía en I0:

- staffing target formal obligatorio
- cálculo normativo pleno de compliance en `publish`
- degradación automática a `DRAFT_WITH_WARNINGS`

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
- si existen marcas abiertas o anomalías relevantes, debe bloquear o derivar workflow explícito,
  nunca “arreglar en silencio”
- publica el evento normativo de SPEC-120 sólo si la transición realmente ocurrió

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
