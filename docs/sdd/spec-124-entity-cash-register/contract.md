# Contrato de entidad — SPEC-124 Cash Register

CashRegister configura una caja física o lógica por Branch y no guarda el saldo corriente.
CashSession es el agregado autoritativo de cada apertura, con currency, responsables, opening,
cutoff, ledger revision y lifecycle `OPEN/CLOSING/CLOSED/RECONCILED`. El contrato implementado
incluye:

- `CashRegister`: `id`, `tenantId`, `branchId`, `code`, `displayName`, `allowedCurrencies`,
  `status`, `revision`, `createdAt`, `updatedAt`;
- `CashSession`: `id`, `tenantId`, `branchId`, `cashRegisterId`, `currency`, `businessDate`,
  `timezone`, `openingAmountMinorUnits`, `openedAt`, `openedBy`, `cutoffAt?`, `closedAt?`,
  `closedBy?`, `ledgerRevision`, `status`, `suspended`, `createdAt`, `updatedAt`.

El contrato actual garantiza:

- unicidad de `code` por branch en `CashRegister`;
- una sola sesión live (`OPEN` o `CLOSING`) por `register + currency`;
- apertura sólo sobre registers `ACTIVE` y currencies permitidas;
- `suspended` como flag ortogonal al lifecycle;
- cierre de sesión con reconciliación inicial `DRAFT` calculada por servidor.

No forman parte del contrato I0 un `LateAdjustment` dedicado ni reapertura de sesiones cerradas.
