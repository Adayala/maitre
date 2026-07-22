# Especificación — SPEC-126 CashReconciliation

Compara expected contra counted por currency/denomination para una CashSession CLOSED. Expected se
calcula desde la ledger revision congelada; el cliente sólo informa conteos y evidencia.

`expected = opening + cash sales + tip in + adjustments in - refunds - deposits - withdrawals -
tip out - adjustments out`; `difference = counted - expected`. Lifecycle
`DRAFT -> SUBMITTED -> APPROVED | REJECTED`; resubmit tras rechazo crea revisión. Aprobador distinto
del preparador cuando aplica segregación. Una aprobada no muta por eventos tardíos.
