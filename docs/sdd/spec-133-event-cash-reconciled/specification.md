# Especificación — SPEC-133 CashSessionReconciled

`cash.cash-session.reconciled.v1` se emite al aprobar CashReconciliation. Incluye envelope SPEC-217,
register/session/reconciliation IDs, currency, ledger revision, expected, counted, difference,
approvedAt y revision; omite evidencia sensible.

Una aprobación produce un hecho lógico. LateAdjustment posterior no modifica ni reemite este
evento: publica un evento de ajuste enlazado a session/reconciliation original.

El evento representa exclusivamente la aprobación de una reconciliation. No sustituye submit,
reject ni late adjustments posteriores. Si una reconciliation fue rechazada y luego una nueva
revisión resulta aprobada, sólo esa aprobación final produce su hecho lógico correspondiente.

El payload mínimo incluye `tenantId`, `brandId`, `branchId`, `cashRegisterId`, `cashSessionId`,
`cashReconciliationId`, `currency`, `ledgerRevision`, `expectedMinorUnits`, `countedMinorUnits`,
`differenceMinorUnits`, `approvedAt`, `aggregateRevision` y correlación aprobada por SPEC-217. No
expone evidencia sensible, fotos de conteo, notas libres ni detalles personales del preparador.
