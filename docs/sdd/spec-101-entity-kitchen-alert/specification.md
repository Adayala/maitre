# Especificación — SPEC-101 KitchenAlert

Cada regla versionada define clock, evidence window, threshold, severity y fingerprint
`tenant + branch + rule + subject + window`. La primera detección crea una activation OPEN;
repeticiones en la misma ventana agregan evidencia. Una condición posterior a RESOLVED crea nueva
activation; no reabre ni muta historia.

Lifecycle: `OPEN -> ACKNOWLEDGED -> RESOLVED`; `OPEN|ACKNOWLEDGED -> ESCALATED` conserva el estado
operativo más flag/escalation level. Commands usan expected revision e idempotencia. La alerta no
es autoridad de Command y omite PII.

KitchenAlert pertenece a un `tenantId`, `brandId` y `branchId` y puede referenciar `stationId`,
`commandId` o subjects operativos equivalentes según la regla. Cada regla publicada define
`ruleVersion`, ventana de evidencia, threshold, severidad, política de reloj y fingerprint
deduplicable `tenant + branch + rule + subject + window`.

La primera detección que cruza el threshold crea una activation nueva en `OPEN`. Repeticiones dentro
de la misma ventana agregan evidencia a esa activation sin crear otra. Una vez `RESOLVED`, una nueva
condición posterior genera otra activation distinta; la historia anterior no se reabre ni se
sobrescribe.

`ACKNOWLEDGED` confirma atención humana u operativa pero no resuelve la causa. `ESCALATED` conserva
el estado operativo principal y añade nivel/metadata de escalación; no reemplaza `OPEN` o
`ACKNOWLEDGED` como dimensión separada. Resolución automática o manual exige `reasonCode` y marca
temporal de servidor.
