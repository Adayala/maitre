# Especificación — SPEC-132 CashMovementRecorded

Nombre normativo `cash.cash-movement.recorded.v1`; `CashRegistered` queda legado no publicable. Se
emite por outbox al aceptar cada movement, incluidos compensatorios.

Envelope SPEC-217 + register/session/movement IDs, type, direction, amount minor units, currency,
source type/reference opaca, occurredAt y ledger revision. Omite PII y texto libre. Dedupe por
event ID y source identity evita doble contabilización.

El contrato publicable es `cash.cash-movement.recorded.v1`; `CashRegistered` queda sólo como alias
legado no publicable. El evento se emite por outbox al aceptar un CashMovement autoritativo,
incluidos los compensatorios, y representa exactamente ese hecho económico del journal.

El payload mínimo incluye `tenantId`, `brandId`, `branchId`, `cashRegisterId`, `cashSessionId`,
`cashMovementId`, `type`, `direction`, `amountMinorUnits`, `currency`, `sourceType`,
`sourceReferenceOpaque`, `occurredAt`, `recordedAt?`, `ledgerRevision` y correlación aprobada por
SPEC-217. No expone PII, texto libre, evidencia sensible ni datos innecesarios para consumidores.
