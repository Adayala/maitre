# Especificación — SPEC-058

Superficie I0:

- `POST /v1/visits/{visitId}/check`;
- `GET /v1/visits/{visitId}/check`;
- `GET /v1/checks/{checkId}`;
- `POST /v1/checks/{checkId}/add-line`;
- `POST /v1/checks/{checkId}/add-adjustment`;
- `POST /v1/checks/{checkId}/request-payment`;
- `POST /v1/checks/{checkId}/settle`;
- `POST /v1/checks/{checkId}/void`.

Totales siempre se recalculan server-side desde líneas, ajustes y pagos capturados; campos
monetarios derivados en requests se rechazan como schema inválido. En I0 no se materializa aún
`If-Match`/`Idempotency-Key` para toda la superficie de Check; ese endurecimiento queda diferido.

La respuesta incluye revisión, currency, gross/discount/tax/service/paid/balance y un resumen
redactado de pagos (`count`, `capturedCount`, `refundCount`, `paidMinorUnits`). Settle exige
balance cero. MVP no ofrece split. Invoice se crea mediante contrato fiscal separado y no cambia
Check ante rechazo externo.

## Endpoints

### POST /v1/visits/{visitId}/check

Request:

```json
{
  "currency": "ARS"
}
```

Response (201): Check OPEN con `totals` y `paymentsSummary`.

### GET /v1/visits/{visitId}/check

Response (200): Check actual de la visita con `totals` y `paymentsSummary`.

### GET /v1/checks/{checkId}

Response (200): mismo payload que la lectura por visita.

### POST /v1/checks/{checkId}/add-line

Request:

```json
{
  "description": "Empanadas",
  "amountMinorUnits": 1000
}
```

### POST /v1/checks/{checkId}/add-adjustment

Request:

```json
{
  "description": "Descuento promo",
  "amountMinorUnits": -100,
  "reason": "PROMO"
}
```

### POST /v1/checks/{checkId}/request-payment

Transición `OPEN -> PAYMENT_PENDING`.

### POST /v1/checks/{checkId}/settle

Transición a `SETTLED` sólo con balance cero.

### POST /v1/checks/{checkId}/void

Request:

```json
{
  "reason": "MANAGER_OVERRIDE"
}
```

## Respuesta

```json
{
  "data": {
    "id": "uuid",
    "visitId": "uuid",
    "branchId": "uuid",
    "currency": "ARS",
    "status": "OPEN | PAYMENT_PENDING | SETTLED | VOID",
    "revision": 2,
    "lines": [],
    "adjustments": [],
    "totals": {
      "gross": 1000,
      "discounts": 100,
      "estimatedTax": 0,
      "serviceCharges": 0,
      "netDue": 900,
      "paid": 900,
      "balance": 0
    },
    "paymentsSummary": {
      "count": 1,
      "capturedCount": 1,
      "refundCount": 0,
      "paidMinorUnits": 900
    }
  }
}
```
