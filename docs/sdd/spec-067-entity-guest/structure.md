# Structure — SPEC-067

Estructura lógica:

- Guest: `guestId`, tenantId, displayName?, locale?, canonical/merge status, revision,
  retention state y auditoría.
- ContactPoint: identidad, Guest, type, normalized/encrypted value, verification state,
  purpose, basis/consent version, source, visibility, capturedAt y retention.
- GuestAlias/MergeLedger: source/target canonical, field decisions, actor, reason,
  timestamps y estado de reversibilidad.

Preferencias viven en SPEC-069. Reservations/Visits conservan referencias o snapshots
mínimos; `totalVisits` e historial son proyecciones, no campos autoritativos de Guest.
