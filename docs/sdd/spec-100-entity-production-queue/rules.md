# Rules — SPEC-100

- La cola nunca autoriza mutaciones; sólo expone estado derivado y freshness.
- Orden canónico: priority band, promisedAt, receivedAt, ID.
- Reprioritization requiere comando autoritativo con reason/actor/policy.
- Aging y boosts tienen límites y expiración aprobados por policy.
- Duplicados, reorder y rebuild deben converger al mismo orden visible.
