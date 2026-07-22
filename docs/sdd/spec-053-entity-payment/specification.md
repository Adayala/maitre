# Especificación — SPEC-053 Payment

PaymentIntent refiere Check revision, amount/currency, tip separado, method y idempotency identity.
Lifecycle `PENDING -> AUTHORIZED -> CAPTURED | VOID`; PENDING/AUTHORIZED pueden FAILED según provider.
Refund es entidad/ledger separado `PENDING -> SUCCEEDED | FAILED`, admite parcial y referencia capture.

Múltiples captures parciales están permitidos; suma capturada neta de refunds determina `paid`.
No puede exceder balance + tip autorizado. Provider operation ID es único; timeout ambiguo queda
PENDING_RECONCILIATION y se consulta antes de retry. Efectivo CAPTURED genera exactamente un
CashMovement; tarjetas nunca exponen PAN/CVV.
