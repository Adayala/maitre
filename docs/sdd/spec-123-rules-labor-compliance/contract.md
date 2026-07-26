# Contrato de reglas — SPEC-123 Labor Compliance

En el estado actual del repositorio no existe un contrato materializado de evaluación de compliance
laboral con findings sobre jornadas o planificación.

El contrato observable implementado hoy cubre sólo:

- versionado, listado y activación de `LaborPolicyVersion`;
- resolución branch-scoped de la policy efectiva;
- respuesta fallback parcial cuando no hay policy persistida;
- declaración explícita de `policyCapabilities` y dimensiones `NOT_CONFIGURED`.

`LaborPolicyVersion` expone en I0:

- identidad, tenant y branch;
- jurisdicción, fuente, referencia, fechas de consulta/vigencia;
- `contentHash`, `reviewerRef`, `approvedAt`, `supersedesPolicyVersionId?`;
- `policyCapabilities`;
- `disclaimer`;
- `createdAt`, `updatedAt`.

No forman parte del contrato actual:

- findings `INFO/WARNING/BLOCKING`;
- evaluator sobre `TimeEntry`, `BreakLog` o shifts;
- overlays tenant materializados;
- reevaluación histórica de compliance;
- decisiones automáticas de bloqueo o sanción laboral.
