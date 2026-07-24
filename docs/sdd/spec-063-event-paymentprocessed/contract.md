# Contrato del evento — SPEC-063

No se publica `payments.payment.processed.v1`. La familia publicable distingue autorización,
captura, fallo, void y resultados de Refund. Cada payload incluye sólo scope, aggregate y
operación, Check/Visit, amount/currency cuando aplica, method category, outcome code
normalizado, timestamp y revisiones. Omite instrumentos, credenciales, PII y respuestas
crudas del provider. Duplicados/callbacks desordenados convergen por eventId, operation y
revisión. Consumidores no emiten Invoice sin validar autoridad fiscal.
