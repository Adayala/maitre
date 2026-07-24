# Especificación — SPEC-053 Payment

PaymentIntent refiere Check revision, amount/currency, tip separado, method y idempotency identity.
Lifecycle `PENDING → AUTHORIZED → CAPTURED | VOID`; PENDING/AUTHORIZED pueden pasar a FAILED según
provider. Un resultado incierto pasa a `PENDING_RECONCILIATION`; sólo una consulta o callback
autoritativo permite resolverlo a CAPTURED, FAILED o VOID.
Refund es entidad/ledger separado `PENDING -> SUCCEEDED | FAILED`, admite parcial y referencia capture.

Múltiples captures parciales están permitidos; suma capturada neta de refunds determina `paid`.
No puede exceder balance + tip autorizado. Provider operation ID es único; timeout ambiguo queda
PENDING_RECONCILIATION y se consulta antes de retry. Efectivo CAPTURED genera exactamente un
CashMovement; tarjetas nunca exponen PAN/CVV.
