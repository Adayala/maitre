# Especificación — SPEC-064 Check Lifecycle Events

`billing.check.opened.v1` representa creación de Check; `billing.check.adjusted.v1`, la
incorporación confirmada de un ajuste append-only; `billing.check.settled.v1`, balance cero
y estado SETTLED. `CheckGenerated` queda como nombre legado no publicable.

Los tres incluyen envelope SPEC-217, tenant/Branch, `checkId`, `visitId`, currency,
aggregateRevision y timestamp, con partition `checkId`. Opened y Settled incluyen el
snapshot permitido de `gross`, `discounts`, `estimatedTax`, `serviceCharges`,
`tipsAppliedToCheck`, `paid` y `balance`. Adjusted incluye `adjustmentId`, type catalogado,
amount, reasonCode y los totales resultantes; omite texto libre.

Settled sólo se produce en la transición confirmada a SETTLED. Ninguno implica Invoice ni
autorización fiscal. Duplicados se deduplican por eventId; revisiones stale no retroceden y
gaps fuerzan refetch autorizado.
