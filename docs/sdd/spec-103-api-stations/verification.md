# Verificación — SPEC-103

## Criterios

### CAD-103-01 — La API de Stations delimita CRUD y comandos con scope por Branch

- [ ] endpoints CRUD/commands respetan scope de Branch.

### CAD-103-02 — Code único, `If-Match` y revisiones previenen conflictos

- [ ] code único y `If-Match` previenen conflictos y sobrescrituras.

### CAD-103-03 — Publish-routing rechaza ambigüedad y destinos incompatibles

- [ ] publish-routing bloquea ambigüedades y destinos no válidos.

### CAD-103-04 — Deactivate exige vacío autoritativo o transferencia atómica

- [ ] deactivate sólo ocurre con vacío autoritativo o transferencia atómica.

### CAD-103-05 — La API conserva historia y before/after auditables

- [ ] historia y before/after permanecen auditables e inmutables.

### CAD-103-06 — La aprobación exige evidencia de unicidad, reroute y deactivate

- [ ] fixtures cubren unicidad, carreras, transferencias y cross-branch.
