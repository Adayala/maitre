# Especificación — SPEC-121 Payroll Projection

En I0 no existe todavía un motor materializado de `PayrollProjection` que calcule minutos regulares,
extras, nocturnidad o deltas retroactivos desde `TimeEntry`/`BreakLog`.

Lo que sí existe hoy como base operativa para una proyección futura es:

- captura y corrección append-only de `TimeEntry` y `BreakLog`;
- metadata y versionado de `LaborPolicyVersion`;
- export branch-scoped de jornadas vía `TimeExportJob`.

## Surface materializado en I0

La superficie implementada relacionada con payroll/compliance es:

- `POST /v1/branches/:branchId/time-exports`
- `GET /v1/branches/:branchId/time-exports`
- `GET /v1/time-exports/:id`
- `GET /v1/branches/:branchId/labor-policy`
- `POST /v1/branches/:branchId/labor-policy-versions`
- `GET /v1/branches/:branchId/labor-policy-versions`
- `POST /v1/labor-policy-versions/:id/activate`

## Qué hace hoy el sistema

`time-exports` no calcula una payroll projection. En I0:

- crea un job asíncrono `REQUESTED`;
- congela `tenantId`, `branchId`, `from`, `to`, `format`, `reason`, `requestedAt`, `stepUpAt`,
  `requestedByUserId`;
- genera un `manifest` con `entryCountEstimate` y `timeEntryIds`;
- deja auditoría del request.

La metadata de `labor policy` tampoco calcula payroll. En I0:

- expone la versión efectiva o una respuesta parcial/fallback;
- declara capabilities disponibles, por ejemplo `breaks.clockOutOpenBreak.mode`;
- puede devolver cobertura `PARTIAL` y disclaimer explícito.

## Frontera de la spec en I0

No están implementados todavía:

- `PayrollProjectionInput` / `PayrollProjectionResult`;
- snapshot inmutable de cálculo con `inputHash`;
- cálculo determinista de `regularMinutes`, `overtimeMinutes`, `nightMinutes`;
- rounding trace o rule trace;
- `NOT_CONFIGURED` como resultado de cálculo estructurado;
- deltas retroactivos entre projections exportadas.

La spec queda entonces acotada en I0 a preparar la base de datos operativa y de policy para que un
motor futuro pueda calcular y exportar payroll sin reescribir la historia de time tracking.
