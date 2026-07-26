# Contrato de entidad — SPEC-126 Cash Reconciliation

`CashReconciliation` compara el efectivo esperado contra el total contado de una `CashSession`
cerrada. El contrato implementado incluye:

- `id`, `tenantId`, `branchId`, `cashRegisterId`, `cashSessionId`, `currency`;
- `ledgerRevision`, `attempt`;
- `countedMinorUnits`, `expectedMinorUnits`, `differenceMinorUnits`;
- `status` (`DRAFT`, `SUBMITTED`, `APPROVED`, `REJECTED`);
- `preparedBy`, `preparedAt`, `submittedAt?`, `approvedBy?`, `approvedAt?`, `rejectedBy?`,
  `rejectedAt?`, `rejectionReason?`, `createdAt`, `updatedAt`.

El contrato actual garantiza:

- `expected` calculado por servidor desde opening + ledger congelado;
- captura de conteos sólo como total entero no negativo;
- reintento versionado mediante `attempt` cuando una conciliación rechazada vuelve a `DRAFT`;
- aprobación que reconcilia también la `CashSession` asociada (`CLOSED -> RECONCILED`);
- inmutabilidad práctica de una conciliación aprobada frente a eventos tardíos.

No forman parte del contrato I0 breakdowns por denominación, evidence refs estructurados,
segregación dura entre preparador y aprobador, ni una cadena compleja de revisiones separadas.
