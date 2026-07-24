# Rules — SPEC-128

- `open-session` usa idempotencia y unicidad por register/currency.
- `begin-close` fija cutoff y limita nuevos movimientos según policy.
- `close-session` congela ledger revision y dispara reconciliation draft.
- Cliente no envía expected totals autoritativos.
- Overrides de cierre/suspensión requieren permission, reason y audit.
