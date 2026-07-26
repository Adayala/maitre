# Especificación — SPEC-123 Labor Compliance Rules

En I0 no existe todavía un evaluator materializado de labor compliance que emita findings
`INFO | WARNING | BLOCKING` sobre jornadas o planificación.

Lo que sí existe hoy es el manejo de `LaborPolicyVersion` y una capa de metadata/capabilities que
permite declarar qué dimensiones están cubiertas y cuáles siguen en `NOT_CONFIGURED`.

## Modelo de `LaborPolicyVersion`

Cada `LaborPolicyVersion` materializada hoy congela:

- `jurisdictionCode`
- `sourceType`
- `sourceRef`
- `consultedAt`
- `effectiveFrom`
- `effectiveUntil?`
- `contentHash`
- `reviewerRef`
- `approvedAt`
- `supersedesPolicyVersionId?`
- `policyCapabilities`
- disclaimer y límites interpretativos

`policyCapabilities` declara explícitamente qué dimensiones cubre la policy:

- descansos (`clockOutOpenBreak.mode`)
- máximos diarios
- máximos semanales
- nocturnidad
- feriados/calendario
- menores cuando aplique
- overlays tenant permitidos o no

Regla aprobada para I0:

- una policy no puede asumirse “completa” por nombre; debe declarar capacidades cubiertas
- si una dimensión no está cubierta, la metadata efectiva queda `NOT_CONFIGURED` para esa dimensión

## Overlays tenant

La dimensión `tenantOverlays` existe hoy sólo como capability declarativa dentro de
`policyCapabilities`. No encontré un modelo materializado de `TenantLaborOverlay` ni una evaluación
combinada policy+overlay.

## Surface materializado en I0

La superficie implementada relacionada con labor compliance es:

- `GET /v1/branches/:branchId/labor-policy`
- `POST /v1/branches/:branchId/labor-policy-versions`
- `GET /v1/branches/:branchId/labor-policy-versions`
- `POST /v1/labor-policy-versions/:id/activate`

`GET /v1/branches/:branchId/labor-policy` hoy:

- devuelve la versión efectiva si existe;
- si no existe una policy persistida, devuelve un fallback parcial;
- declara `coverageStatus: PARTIAL`;
- llena dimensiones no cubiertas con `NOT_CONFIGURED`;
- expone al menos `breaks.clockOutOpenBreak.mode`.

`POST /v1/branches/:branchId/labor-policy-versions` y `POST /v1/labor-policy-versions/:id/activate`
permiten versionar y superseder policies por branch con auditoría.

## Frontera de compliance en I0

No están implementados todavía:

- evaluator sobre `TimeEntry`/`BreakLog`/shifts;
- findings `INFO | WARNING | BLOCKING`;
- `occurrenceDate` y reevaluación histórica de compliance;
- overlays tenant materializados;
- bloqueo automático de flujos por findings de compliance.

## `NOT_CONFIGURED`

En I0, `NOT_CONFIGURED` aparece como estado/capability declarativa dentro de la metadata de policy,
no como resultado de un evaluator completo.

Cuando no hay policy efectiva persistida, la API devuelve una respuesta fallback con:

- `coverageStatus: PARTIAL`
- capacidades no cubiertas en `NOT_CONFIGURED`
- disclaimer explícito de que no puede afirmarse compliance fuera de las capacidades declaradas
