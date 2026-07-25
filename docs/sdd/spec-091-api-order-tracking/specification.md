# Especificación — SPEC-091

Devuelve un tracking de `Order` con estado agregado, estado por item, timestamps confirmados,
`aggregateRevision`, `projectionCursor`, `asOf` y metadata de freshness. En I0 la representación es
un live snapshot del agregado autoritativo actual; no existe todavía una proyección reconstruida
desde event stream ni un cursor materializado independiente.

Acceso público exige capability `ORDER_TRACK_READ`, hasheada y separada de otras capabilities;
omite precios, Guest, notas e instrucciones internas. Acceso interno exige permiso y alcance por sucursal.
La API declara consistencia eventual y nunca sirve como precondición de un comando.

La superficie incluye al menos un detail público por token y un detail interno por `orderId`; ambos
devuelven el mismo modelo lógico con distinta redacción según audiencia. El payload contiene
`orderId` o alias público permitido, estado derivado de `Order`, estado por item/allocation,
timestamps confirmados por servidor, `aggregateRevision`, `projectionCursor`, `asOf`, `lastConfirmedAt`,
`freshness` y reason codes operativos permitidos.

## Endpoints

### POST /v1/orders/:id/tracking-token

Emite una capability pública `ORDER_TRACK_READ` para una orden accesible dentro del tenant y del
scope de sucursal del actor.

Request:

```json
{
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

### GET /v1/orders/:id/tracking

Detalle interno autenticado. Exige `order:read`, contexto de tenant y alcance por sucursal sobre la
orden.

Response (200):

```json
{
  "data": {
    "orderId": "uuid",
    "status": "SUBMITTED | IN_PREP | READY | PARTIALLY_DELIVERED | DELIVERED | CANCELLED",
    "aggregateRevision": 3,
    "projectionCursor": "order-id:3",
    "asOf": "ISO8601",
    "lastConfirmedAt": "ISO8601",
    "freshness": {
      "mode": "LIVE_SNAPSHOT",
      "consistency": "EVENTUAL",
      "degraded": false
    },
    "items": [
      {
        "id": "uuid",
        "name": "string",
        "quantity": 1,
        "status": "QUEUED | IN_PREP | READY | DELIVERED | CANCELLED",
        "confirmedAt": "ISO8601",
        "reasonCode": "optional"
      }
    ]
  }
}
```

### GET /public/tracking/:token

Detalle público redacted resuelto desde capability válida.

Response (200):

```json
{
  "data": {
    "status": "SUBMITTED | IN_PREP | READY | PARTIALLY_DELIVERED | DELIVERED | CANCELLED",
    "aggregateRevision": 3,
    "projectionCursor": "order-id:3",
    "asOf": "ISO8601",
    "lastConfirmedAt": "ISO8601",
    "freshness": {
      "mode": "LIVE_SNAPSHOT",
      "consistency": "EVENTUAL",
      "degraded": false
    },
    "items": [
      {
        "id": "uuid",
        "status": "QUEUED | IN_PREP | READY | DELIVERED | CANCELLED",
        "confirmedAt": "ISO8601",
        "reasonCode": "optional"
      }
    ]
  }
}
```

## Redacción

- público: no expone `orderId`, nombres, precios, notas, PII ni instrucciones internas;
- interno: expone nombres y cantidades operativas, pero no convierte el tracking en autoridad de comando.

## Consistencia

- en I0, `projectionCursor` representa revisión derivada del agregado (`<orderId>:<revision>`);
- `freshness.mode = LIVE_SNAPSHOT` declara que la respuesta proviene del agregado actual, no de una
  proyección reconstruida;
- `freshness.consistency = EVENTUAL` conserva el contrato futuro y evita usar el endpoint como
  precondición transaccional.
