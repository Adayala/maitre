# Especificación — SPEC-058 Checks API

Create/get y commands `add-adjustment`, `request-payment`, `void`, `settle`. Totales siempre se
recalculan server-side desde snapshots; importes del cliente se rechazan.

Response incluye revision, currency, gross/discount/tax/service/tip/paid/balance y payments
redactados. Settle exige balance cero y cero operaciones ambiguas. MVP no ofrece split. Invoice se
crea mediante contrato fiscal separado y no cambia Check ante rechazo externo.
