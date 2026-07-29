# Especificación — SPEC-059 Payments API

Superficie I0 autenticada:

- `POST /v1/checks/{checkId}/payments`;
- `GET /v1/checks/{checkId}/payments`;
- `GET /v1/payments/{paymentId}`;
- `POST /v1/payments/{paymentId}/authorize`;
- `POST /v1/payments/{paymentId}/capture`;
- `POST /v1/payments/{paymentId}/void`;
- `POST /v1/payments/{paymentId}/refunds`;
- `POST /v1/payments/{paymentId}/reconcile`.

Los comandos requieren `Idempotency-Key` e `If-Match` cuando mutan un Payment existente.
Amount/currency/tip/balance se validan contra Check revision. La identidad idempotente
end-to-end incluye la operación del provider.

El ingreso `POST /v1/payment-provider-callbacks/{providerCode}` es exclusivo de adapters:
valida firma sobre el cuerpo original, timestamp/ventana anti-replay y credencial del
provider antes de persistir un receipt deduplicable. La respuesta no revela existencia de
Payment ni scope tenant.

Refund refiere una capture y admite amount parcial acumulado <= captured. Timeout/callback ambiguo queda
PENDING_RECONCILIATION y se consulta antes de retry.

La captura de un Payment `CASH` exige una sesión de caja `OPEN`, de la misma sucursal y
moneda. El body puede indicar `{ "cashSessionId": "uuid" }`; si se omite, la API la
resuelve sólo cuando existe exactamente una sesión compatible. Cero o más de una sesión
compatible producen conflicto y no se captura el pago. Una captura exitosa registra
exactamente un `CashMovement` `CASH_SALE`, por importe más propina, con referencia estable
`FLOOR_PAYMENT:{paymentId}`. El retry es idempotente y también repara una captura previa
que no hubiera alcanzado a persistir su movimiento de caja.

API nunca recibe/devuelve PAN, CVV, provider secrets ni referencias completas.
