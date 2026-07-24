# Especificación — SPEC-126 CashReconciliation

Compara expected contra counted por currency/denomination para una CashSession CLOSED. Expected se
calcula desde la ledger revision congelada; el cliente sólo informa conteos y evidencia.

`expected = opening + cash sales + tip in + adjustments in - refunds - deposits - withdrawals -
tip out - adjustments out`; `difference = counted - expected`. Lifecycle
`DRAFT -> SUBMITTED -> APPROVED | REJECTED`; resubmit tras rechazo crea revisión. Aprobador distinto
del preparador cuando aplica segregación. Una aprobada no muta por eventos tardíos.

CashReconciliation referencia `cashSessionId`, `currency`, `ledgerRevision`, `preparedBy`,
`preparedAt`, `submittedAt?`, `approvedBy?`, `approvedAt?`, `rejectedBy?`, `rejectedAt?`,
`evidenceRefs` y breakdowns por denominación o método de conteo aprobado. El cliente aporta
`counted`; `expected` siempre se calcula desde el ledger congelado observado por la sesión.

`APPROVED` congela el resultado reconciliado. Si aparecen eventos tardíos legítimos o late
adjustments posteriores, no se muta la reconciliation aprobada: se crea una nueva revisión,
reconciliación complementaria o flujo de excepción explícito según policy. `REJECTED` conserva
historial y habilita resubmit versionado, no edición destructiva del intento previo.
