# Contrato de entidad — SPEC-125 Cash Movement

`CashMovement` es un journal entry inmutable asociado a una `CashSession`. El contrato implementado
incluye:

- `id`, `tenantId`, `branchId`, `cashRegisterId`, `cashSessionId`;
- `currency`, `type`, `direction`, `amountMinorUnits`;
- `occurredAt`, `recordedAt`, `actor`, `ledgerRevision`;
- `sourceType?`, `sourceReference?`, `compensatesMovementId?`, `idempotencyKey?`, `reason?`.

El contrato actual garantiza:

- monto positivo entero en minor units;
- dirección económica fijada por tipo salvo `ADJUSTMENT`;
- currency consistente con la sesión;
- aceptación de movimientos sólo en sesiones que correspondan al tipo (`OPEN`, o `CLOSING` para
  `CLOSING_COUNT`);
- unicidad de `sourceReference` por register cuando esa referencia se informa;
- compensación sólo mediante un nuevo `ADJUSTMENT` inverso, nunca por edición ni borrado;
- `CLOSING_COUNT` informativo, con contribución cero al balance.

No forman parte del contrato I0 la creación automática desde payments, una policy de límites/riesgo
por tipo, ni deduplicación materializada por `idempotencyKey`.
