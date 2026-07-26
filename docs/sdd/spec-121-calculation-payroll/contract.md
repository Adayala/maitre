# Contrato de cálculo — SPEC-121 Payroll

En el estado actual del repositorio no existe un contrato materializado de cálculo para
`PayrollProjection`.

El contrato observable implementado hoy cubre sólo:

- request/list/detail de `TimeExportJob`;
- metadata/versionado/activación de `LaborPolicyVersion`;
- persistencia auditada del request de export con step-up y scope branch-scoped.

`TimeExportJob` expone en I0:

- `id`, `tenantId`, `branchId`
- `status = REQUESTED`
- `format`
- `from`, `to`
- `reason`
- `requestedAt`
- `stepUpAt`
- `requestedByUserId`
- `manifest.entryCountEstimate`
- `manifest.timeEntryIds[]`

No forman parte del contrato actual:

- categorías calculadas de payroll (`regularMinutes`, `overtimeMinutes`, `nightMinutes`, etc.);
- snapshot hash/version de cálculo;
- traces de reglas o redondeo;
- reconciliación retroactiva entre projections;
- resultado estructurado `NOT_CONFIGURED` de un motor de cálculo.
