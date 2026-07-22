# Especificación — SPEC-132 CashMovementRecorded

Nombre normativo `cash.cash-movement.recorded.v1`; `CashRegistered` queda legado no publicable. Se
emite por outbox al aceptar cada movement, incluidos compensatorios.

Envelope SPEC-217 + register/session/movement IDs, type, direction, amount minor units, currency,
source type/reference opaca, occurredAt y ledger revision. Omite PII y texto libre. Dedupe por
event ID y source identity evita doble contabilización.
