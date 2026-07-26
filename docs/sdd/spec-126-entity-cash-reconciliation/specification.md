# Especificación — SPEC-126 CashReconciliation

Compara `expected` contra `counted` para una `CashSession` `CLOSED`. `expected` se calcula desde la
ledger revision congelada; el cliente sólo informa el total contado.

`expected = opening + cash sales + tip in + adjustments in - refunds - deposits - withdrawals -
tip out - adjustments out`; `difference = counted - expected`. Lifecycle
`DRAFT -> SUBMITTED -> APPROVED | REJECTED`; tras rechazo, `recordCounts` reabre una nueva tentativa
`DRAFT` incrementando `attempt`. Una aprobada no muta por eventos tardíos.

CashReconciliation referencia `cashSessionId`, `currency`, `ledgerRevision`, `preparedBy`,
`preparedAt`, `submittedAt?`, `approvedBy?`, `approvedAt?`, `rejectedBy?`, `rejectedAt?`,
`attempt`, `countedMinorUnits`, `expectedMinorUnits`, `differenceMinorUnits` y `rejectionReason?`.
El cliente aporta `counted`; `expected` siempre se calcula desde el ledger congelado observado por
la sesión.

`APPROVED` congela el resultado reconciliado. Si aparecen eventos tardíos legítimos o late
adjustments posteriores, no se muta la reconciliation aprobada. `REJECTED` conserva historial y
habilita una nueva tentativa vía `attempt`, no edición destructiva del intento previo.

Reglas implementadas:

- `countedMinorUnits` debe ser entero no negativo;
- `recordCounts` sólo opera sobre `DRAFT` o reabre desde `REJECTED`;
- `submit` requiere conteos ya registrados;
- `approve` mueve la sesión asociada de `CLOSED` a `RECONCILED`;
- `reject` preserva el intento y permite recomenzar la captura.

No está implementado en I0:

- breakdown por denominación o evidence refs estructurados;
- segregación dura `approver != preparer`;
- cadena rica de revisiones con entidades separadas por resubmit.
