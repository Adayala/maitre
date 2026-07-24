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
