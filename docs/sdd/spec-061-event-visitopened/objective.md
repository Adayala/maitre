# Objetivo — SPEC-061

Publicar la apertura consumada de Visit y sus Occupancies iniciales mediante un hecho
mínimo, versionado y sin PII.

## Criterios de aceptación

### CAD-061-01 — El nombre del evento y su aggregate quedan fijados sin variantes

El único nombre publicable es `floor.visit.opened.v1` y su aggregate es Visit.

### CAD-061-02 — El evento se emite sólo tras confirmar apertura y seating iniciales

Se produce sólo al confirmar atómicamente Visit OPEN y Occupancies iniciales.

### CAD-061-03 — Envelope y payload preservan identidad, causalidad y alcance

envelope y payload poseen identidad, causalidad, alcance, referencias, guestCount, timestamp
y revisión inequívocos.

### CAD-061-04 — El payload excluye PII y snapshots comerciales ajenos

El payload omite Guest, contacto, notas y cualquier snapshot de Order/Check.

### CAD-061-05 — El delivery define deduplicación, orden y recuperación de gaps

delivery es al menos una vez; deduplicación, orden por aggregate/revision y recuperación
de gaps están definidos.

### CAD-061-06 — La aprobación exige evidencia de atomicidad, compatibilidad y routing aislado

La aprobación exige fixtures de commit/rollback, retry, reorder, redacción,
compatibilidad y aislamiento de routing.
