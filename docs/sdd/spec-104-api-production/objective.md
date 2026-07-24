# Objetivo — SPEC-104

Definir la API de Production/KDS como consulta de cola con freshness declarada y coordinación
segura con comandos operativos autoritativos.

## Criterios de aceptación

### CAD-104-01 — La API de Production define cola, cursor, revisión y `asOf`

endpoint de cola, payload y metadata de cursor/revisión/`asOf` quedan definidos.

### CAD-104-02 — La API separa lectura de proyección y mutación autoritativa

la API distingue explícitamente entre lectura de proyección y mutación autoritativa
delegada a SPEC-102.

### CAD-104-03 — Freshness degradada se declara sin inventar estado

freshness degradada se declara sin inventar estado ni permitir mutaciones ciegas.

### CAD-104-04 — Claim, hold/resume y ready/handoff tienen semántica estable

claim concurrente, hold/resume y ready/handoff tienen semántica estable y monotónica.

### CAD-104-05 — La cola desactualizada nunca reemplaza validación autoritativa

el orden de cola y las vistas desactualizadas no reemplazan validación autoritativa de `Command`.

### CAD-104-06 — La aprobación exige evidencia de reorder, múltiples operadores y repriority

La aprobación exige fixtures de reorder, vista desactualizada, multiple operators, repriority,
hold/resume y aislamiento.
