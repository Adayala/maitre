# Objetivo — SPEC-113

Definir TimeEntry como registro autoritativo de clock-in/out con correcciones append-only,
anomalías revisables y unicidad de entrada abierta por empleo.

## Criterios de aceptación

### CAD-113-01 — TimeEntry define alcance, autoridad de Employment y unicidad de OPEN sin ambigüedad

alcance, autoridad de Employment y unicidad de entrada OPEN quedan definidos sin ambigüedad.

### CAD-113-02 — Timestamps, timezone, source y skew quedan especificados para auditoría

timestamps capturados/recibidos, timezone, source y skew model quedan especificados para
auditoría.

### CAD-113-03 — Lifecycle y anomalías permanecen separados y son inequívocos

lifecycle OPEN/CLOSED y anomalías como workflow separado son inequívocos.

### CAD-113-04 — TimeAdjustment conserva fuente original y trazabilidad before/after

correcciones vía TimeAdjustment preservan fuente original y trazabilidad before/after.

### CAD-113-05 — Trabajo sin shift, DST y concurrencia siguen policy explícita

trabajo sin shift, DST y concurrencia se gobiernan por policy explícita.

### CAD-113-06 — La aprobación exige evidencia de doble marcación, skew y ajustes

La aprobación exige fixtures de doble marcación, DST, clock skew, trabajo sin turno,
ajustes y aislamiento.
