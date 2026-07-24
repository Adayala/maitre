# Reglas — SPEC-075

- Command crea NotificationIntent/outbox; no llama provider en transacción.
- Purpose transaccional y marketing tienen base/opt-out separados.
- Template/channel/locale/consent version quedan congelados.
- Rate limit/dedupe no modifica Reservation ante fallo.
- Tenant/sucursal/actor derivan del contexto o capability acotada; Reservation fuera de alcance es `404`.
- Confirmation/reminder/cancellation usan permisos y catálogos separados.
- `409` expresa dedupe/conflicto, `422` consent/template/channel y `429` rate policy.
- Callback de delivery se autentica/deduplica fuera de esta API y sólo actualiza proyección.
- Logs/auditoría usan IDs y categorías, nunca destination ni payload del provider.
