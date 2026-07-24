# Objetivo — SPEC-074

Exponer disponibilidad explicable y temporalmente inequívoca como consulta, sin prometer ni
consumir capacidad.

## Criterios de aceptación

### CAD-074-01 — Availability expone una única lectura con inputs allowlisted

La única operación es GET y acepta partySize, ventana/calendario, duración y preferencias
no sensibles allowlisted.

### CAD-074-02 — Cada slot declara metadata temporal, revisiones y freshness

Cada slot incluye startAt, timezone, duration, policy/input revisions, `asOf`,
freshness/expiry y reason codes no identificables.

### CAD-074-03 — Igual input y revisión producen resultado determinista

iguales inputs, `asOf` y revisiones producen igual resultado.

### CAD-074-04 — La consulta no consume capacidad ni maquilla estado desactualizado como fresco

La consulta no crea Hold/Allocation ni garantiza confirmación; un estado desactualizado nunca se
presenta como fresco.

### CAD-074-05 — La respuesta evita inferencias explotables sobre capacidad o identidad

alcance público/interno, rate limits y respuesta impiden inferir Reservation, Guest,
bloqueos sensibles o capacidad exacta explotable.

### CAD-074-06 — La aprobación exige evidencia temporal, de privacidad y performance

La aprobación exige fixtures DST, buffers, combinaciones, estados desactualizados/gaps, performance,
privacidad y aislamiento.
