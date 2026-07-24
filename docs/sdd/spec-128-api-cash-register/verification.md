# Verificación — SPEC-128

## Criterios

### CAD-128-01 — La API de caja define surface y comandos de sesión con claridad

- [ ] list/detail y comandos de sesión están definidos sin ambigüedad.

### CAD-128-02 — `open-session` usa idempotencia y bloquea doble sesión activa

- [ ] idempotencia y unicidad previenen doble apertura por register/currency.

### CAD-128-03 — `begin-close` y `close-session` congelan cutoff y ledger revision

- [ ] cutoff y ledger revision se congelan sin aceptar expected del cliente.

### CAD-128-04 — Pending payments y late settlement siguen policy explícita y auditada

- [ ] pending payments y late settlement siguen policy explícita y auditable.

### CAD-128-05 — Las transiciones sensibles usan revisión, permiso y motivo cuando aplica

- [ ] revisión esperada, permisos y motivos gobiernan transiciones sensibles.

### CAD-128-06 — La aprobación exige evidencia de doble apertura, pending payments y RBAC

- [ ] fixtures cubren multicurrency, retries, pending payments y cross-branch.
