# Contrato — SPEC-086 KitchenTicket

KitchenTicket es agregado autoritativo de despacho a producción derivado de Order submit y
agrupado por station; el KDS es su proyección reconstruible. Contiene snapshots mínimos,
priorities/reasons y line states; no copia precio/PII. Creación es idempotente por order revision +
station. Comandos usan expected revision y eventos fuera de orden convergen sin retroceder estados
terminales. Tests cubren split, duplicate submit, cancel, transfer, retry y payload mínimo.
