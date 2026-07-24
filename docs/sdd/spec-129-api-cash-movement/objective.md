# Objetivo — SPEC-129

Definir la API autoritativa de CashMovements con create/list y compensación append-only bajo
policies de límites y referencias únicas.

## Criterios de aceptación

### CAD-129-01 — La API de CashMovements define create/list y `compensate` con alcance claro

endpoints create/list y comando `compensate` quedan definidos con alcance claro.

### CAD-129-02 — Create exige sesión válida, amount positivo y referencias obligatorias

create exige sesión válida, type allowlisted, amount positivo, currency coherente,
idempotencia y referencias obligatorias.

### CAD-129-03 — Operaciones riesgosas dependen de LimitsPolicy explícita

límites manuales y operaciones riesgosas dependen de LimitsPolicy explícita.

### CAD-129-04 — No existen update/delete; compensation crea movimiento inverso auditado

no existen update/delete; compensation crea movimiento inverso enlazado y auditado.

### CAD-129-05 — Integraciones de Payment no duplican impacto económico

Payment integrations usan identity/source únicos y no duplican impacto económico.

### CAD-129-06 — La aprobación exige evidencia de sesión cerrada, límites y compensación

La aprobación exige fixtures de sesión cerrada, límites, duplicados, compensación,
paginación y aislamiento.
