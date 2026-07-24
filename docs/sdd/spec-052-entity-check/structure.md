# Structure — SPEC-052

Estructura lógica:

- identidad y scope: `checkId`, `tenantId`, `branchId`, `visitId`;
- ciclo: `status`, `openedAt`, `paymentPendingAt?`, `settledAt?`, `voidedAt?`,
  `voidReason?`;
- política: `currency`, `moneyPolicyVersion`, `taxEstimatePolicyVersion`;
- líneas: source type/id/revision, descripción congelada, cantidad, unit amount y total;
- ajustes: type, reason, actor, amount y referencia a la línea cuando corresponda;
- totales derivados: `gross`, `discounts`, `estimatedTax`, `serviceCharges`,
  `tipsAppliedToCheck`, `netDue`, `paid`, `balance`;
- control: `revision`, idempotency keys y auditoría.

Los Payment y Refund son ledger separado. Los totales almacenados, si existen como snapshot,
deben poder recomputarse y reconciliarse con líneas, ajustes y Payments.
