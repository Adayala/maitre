# Especificación — SPEC-090 Digital Bill API

`GET /public/bills/{token}` acepta sólo capability `BILL_READ` y devuelve la proyección SPEC-085:
`checkRevision`, `asOf`, `lastConfirmedAt`, líneas, ajustes, totales, resumen de pagos y status.

El token es hasheado, revocable, expirable, rate-limited y distinto de Menu/Tracking/Payment. No
se confían tenant/check IDs del cliente. Se omiten PII, instrumentos y provider references. La
respuesta declara freshness y usa cache-control restrictivo; no habilita mutaciones.

## Endpoints

### POST /v1/bill-tokens

Emite una capability pública `BILL_READ` para un `Check` accesible dentro del tenant y del scope
de sucursal del actor.

Request:

```json
{
  "checkId": "uuid",
  "ttlSeconds": 300
}
```

Response (201):

```json
{
  "data": {
    "token": "opaque",
    "id": "uuid",
    "expiresAt": "ISO8601 | null"
  }
}
```

### GET /public/bills/{token}

Response (200):

```json
{
  "data": {
    "checkRevision": 3,
    "asOf": "ISO8601",
    "lastConfirmedAt": "ISO8601",
    "freshness": {
      "mode": "LIVE_SNAPSHOT",
      "consistency": "EVENTUAL",
      "degraded": false
    },
    "currency": "ARS",
    "status": "OPEN | PAYMENT_PENDING | SETTLED | VOID",
    "lines": [
      {
        "description": "string",
        "amountMinorUnits": 1000
      }
    ],
    "adjustments": [
      {
        "description": "string",
        "amountMinorUnits": -100
      }
    ],
    "paymentsSummary": {
      "count": 1,
      "paidMinorUnits": 900,
      "balanceMinorUnits": 0
    },
    "totals": {
      "gross": 1000,
      "discounts": 100,
      "estimatedTax": 0,
      "serviceCharges": 0,
      "netDue": 900,
      "paid": 900,
      "balance": 0
    }
  }
}
```

## Redacción

- no expone PII, instrumentos de pago, PAN/CVV, provider references ni notas internas;
- no expone tenantId, checkId ni otros identificadores internos fuera de la capability opaca.

## Consistencia

- en I0 la representación es un `LIVE_SNAPSHOT` del `Check` actual;
- `freshness.consistency = EVENTUAL` declara el contrato futuro sin convertir la API en autoridad
  transaccional de cobro, settle o invoice.
