# Contrato — SPEC-086 KitchenTicket

KitchenTicket es proyección/comando de producción derivado de Order submit, agrupado por
station. Contiene snapshots mínimos, priorities/reasons, status y item states; no copia
precio/PII. Creación es idempotente por order revision + station. Reordenamiento de eventos
converge y cancelaciones quedan visibles. Estado de ticket deriva de items. Tests cubren
split por station, duplicate submit, cancel, retry, tenant/branch y payload mínimo.
