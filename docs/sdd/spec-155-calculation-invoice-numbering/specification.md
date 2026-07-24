# Especificación — SPEC-155 FiscalPointOfSale y Numbering

FiscalPointOfSale pertenece a FiscalEntity y define environment, official code, voucher types,
effective interval, status y último autorizado por tipo. Unicidad por entity/environment/code.

Numbering serializa por pointOfSale + voucherType. Una AuthorizationIntent conserva candidate
number e idempotency identity; timeout bloquea siguiente reserva hasta consultar/reconciliar ARCA.
Nunca reutiliza número ni consume otro a ciegas. Divergencias producen BLOCKED_RECONCILIATION con
runbook; sólo el último autorizado remoto actualiza checkpoint.

La autoridad de numeración combina estado local persistido y reconciliación con el proveedor fiscal.
Reservar un candidate number no equivale a autorización efectiva; la secuencia sólo avanza de manera
consolidada cuando existe resolución oficial o reconciliación determinística del intento.

El cálculo debe distinguir claramente `candidate`, `authorized checkpoint`, `blocked by ambiguous
intent` y `blocked by divergence`. El sistema puede impedir nuevas emisiones para una secuencia hasta
resolver el conflicto, pero no puede “saltar” números manualmente sin evidencia y runbook aprobado.
