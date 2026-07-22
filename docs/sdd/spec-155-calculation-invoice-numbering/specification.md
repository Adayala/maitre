# Especificación — SPEC-155 FiscalPointOfSale y Numbering

FiscalPointOfSale pertenece a FiscalEntity y define environment, official code, voucher types,
effective interval, status y último autorizado por tipo. Unicidad por entity/environment/code.

Numbering serializa por pointOfSale + voucherType. Una AuthorizationIntent conserva candidate
number e idempotency identity; timeout bloquea siguiente reserva hasta consultar/reconciliar ARCA.
Nunca reutiliza número ni consume otro a ciegas. Divergencias producen BLOCKED_RECONCILIATION con
runbook; sólo el último autorizado remoto actualiza checkpoint.
