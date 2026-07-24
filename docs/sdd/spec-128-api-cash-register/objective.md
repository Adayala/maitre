# Objetivo — SPEC-128

Definir la API autoritativa de CashRegister/CashSession para apertura, cierre y suspensión de caja
con unicidad por register/currency y cierre reconciliable.

## Criterios de aceptación

### CAD-128-01 — La API de caja define surface y comandos de sesión con claridad

surface list y comandos `open-session`, `begin-close`, `close-session`, `suspend`,
`resume` quedan definidos con claridad.

### CAD-128-02 — `open-session` usa idempotencia y bloquea doble sesión activa

`open-session` usa idempotencia y bloquea doble sesión activa por register/currency.

### CAD-128-03 — `begin-close` y `close-session` congelan cutoff y ledger revision

`begin-close` y `close-session` congelan cutoff y ledger revision sin aceptar expected
totals del cliente.

### CAD-128-04 — Pending payments y late settlement siguen policy explícita y auditada

pagos pendientes, late settlement y excepciones siguen policy explícita y auditada.

### CAD-128-05 — Las transiciones sensibles usan revisión, permiso y motivo cuando aplica

todas las transiciones usan revisión esperada, permiso y motivo cuando la policy lo exige.

### CAD-128-06 — La aprobación exige evidencia de doble apertura, pending payments y RBAC

La aprobación exige fixtures de doble apertura, pending payments, multicurrency, retries,
RBAC y aislamiento.
