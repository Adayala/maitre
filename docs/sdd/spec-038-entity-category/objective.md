# Objetivo — SPEC-038

## Propósito

Organizar MenuItems dentro de una revisión de Menu mediante una categoría ordenada e inmutable una
vez publicada, sin otorgar ownership del Product.

## Criterios de aceptación

### CAD-038-01 — Category pertenece a una única MenuRevision/Tenant y no se mueve entre revisiones publicadas

Category pertenece a una única MenuRevision/Tenant y no se mueve entre revisiones publicadas.

### CAD-038-02 — Nombre normalizado es único y sortOrder + id producen orden total estable

Nombre normalizado es único dentro de la revisión y sortOrder + id producen orden total estable.

### CAD-038-03 — Category agrupa MenuItems pero no es propietaria de Product ni almacena precio

Category agrupa MenuItems, no es propietaria de Product ni almacena precio.

### CAD-038-04 — Reorder concurrente usa versión o ETag y no deja posiciones ambiguas

Reorder concurrente usa versión/ETag y no deja posiciones ambiguas.

### CAD-038-05 — Category publicada es inmutable y nuevas revisiones conservan historia

Category publicada es inmutable; ocultar/archivar en nueva revisión conserva OrderItems históricos.

### CAD-038-06 — Unicidad, ordering, publication lifecycle, refs y tenant isolation poseen evidencia contractual

Unicidad, ordering, publication lifecycle, refs y tenant isolation poseen evidencia contractual.
