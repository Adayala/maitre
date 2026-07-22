# Especificación — SPEC-133 CashSessionReconciled

`cash.cash-session.reconciled.v1` se emite al aprobar CashReconciliation. Incluye envelope SPEC-217,
register/session/reconciliation IDs, currency, ledger revision, expected, counted, difference,
approvedAt y revision; omite evidencia sensible.

Una aprobación produce un hecho lógico. LateAdjustment posterior no modifica ni reemite este
evento: publica un evento de ajuste enlazado a session/reconciliation original.
