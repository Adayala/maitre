# Verificación — SPEC-038

## Criterios

### CAD-038-01 — Category pertenece a una única MenuRevision/Tenant y no se mueve entre revisiones publicadas

- [ ] Category sólo pertenece a una MenuRevision/Tenant;
- [ ] no se mueve entre revisiones publicadas;
- [ ] refs cross-revision o cross-tenant fallan cerrado.

### CAD-038-02 — Nombre normalizado es único dentro de la revisión y sortOrder + id producen orden total estable

- [ ] duplicate normalizado se rechaza;
- [ ] sortOrder + id producen orden total estable;
- [ ] empates y normalización siguen criterio determinista.

### CAD-038-03 — Category agrupa MenuItems, no es propietaria de Product ni almacena precio

- [ ] Category no duplica Product/price/stock;
- [ ] Category sólo agrupa MenuItems;
- [ ] ownership de Product y precio queda fuera de Category.

### CAD-038-04 — Reorder concurrente usa versión/ETag y no deja posiciones ambiguas

- [ ] reorder stale falla;
- [ ] reorder concurrente usa control de versión/ETag;
- [ ] no quedan posiciones ambiguas.

### CAD-038-05 — Category publicada es inmutable; ocultar/archivar en nueva revisión conserva OrderItems históricos

- [ ] publicación vuelve Category inmutable;
- [ ] ocultar/archivar conserva snapshots históricos;
- [ ] OrderItems históricos no se alteran.

### CAD-038-06 — Unicidad, ordering, publication lifecycle, refs y tenant isolation poseen evidencia contractual

- [ ] unicidad y ordering siguen contrato;
- [ ] publication lifecycle conserva evidencia;
- [ ] tenant isolation posee evidencia contractual.
