# Reglas — SPEC-168

- El nombre canónico es `feedback.external-review.changed.v1`.
- Cubre create, update y tombstone de snapshots externos.
- Payload excluye texto, autor y raw payload del provider.
- Entrega soporta duplicados y reordering con convergencia por versión.
- `freshness` y `fetchedAt` son parte obligatoria del contrato.
