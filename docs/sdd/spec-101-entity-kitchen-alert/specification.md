# Especificación — SPEC-101 KitchenAlert

I0 actual: las reglas no son versionadas ni configurables. Existen dos checks hardcodeados,
evaluados en forma síncrona y on-demand sobre Kitchen Commands:

- `STALE_BEFORE_START`: `RECEIVED|CLAIMED` por más de 15 minutos;
- `STALE_IN_PROGRESS`: `IN_PROGRESS` por más de 30 minutos.

La primera detección crea una alerta `OPEN`. Mientras exista una `OPEN` para el mismo
`commandId + ruleCode`, una nueva evaluación no crea duplicados. Una condición posterior a
`RESOLVED` crea una alerta nueva; no reabre la anterior.

Lifecycle: `OPEN -> ACKNOWLEDGED -> RESOLVED`; `OPEN|ACKNOWLEDGED -> ESCALATED`. En este I0
`ESCALATED` es un status explícito con `escalationLevel`, no una dimensión separada sobre el mismo
estado operativo. Commands no usan `expected revision` ni idempotencia explícita.

KitchenAlert pertenece a un `tenantId`, `brandId` y `branchId` y puede referenciar `stationId`,
`commandId`. No existen `ruleVersion`, evidence window ni fingerprint persistido más rico.

`ACKNOWLEDGED` confirma atención humana u operativa pero no resuelve la causa. `ESCALATED` conserva
escalationLevel incremental. Resolución manual exige `reasonCode` y marca temporal de servidor. La
alerta no es autoridad sobre el Command y no contiene PII.
