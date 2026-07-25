# Especificación — SPEC-088 QR Menu API

`GET /public/menu/{token}` resuelve exclusivamente una capability `MENU_READ` y devuelve la
vista pública permitida del menú actual: nombre, slug, timestamp `asOf`, categorías visibles,
precios, disponibilidad y declaraciones de alérgenos. Token inválido, revocado o vencido produce
la misma respuesta anti-enumeración.

El token se almacena como hash, aplica rate limit y no expone IDs internos. ETag identifica menu
snapshot vigente; rotación/revocación invalida cache. Esta API no crea orders, muestra bills ni
acepta pagos.

## Endpoints

### POST /v1/qr-menu-tokens

Emite una capability pública `MENU_READ`.

Request:

```json
{
  "menuId": "uuid",
  "branchId": "uuid | omitted",
  "tableId": "uuid | omitted",
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

### GET /public/menu/{token}

Response (200):

```json
{
  "data": {
    "menu": {
      "name": "string",
      "slug": "string",
      "asOf": "ISO8601"
    },
    "categories": [
      {
        "name": "string",
        "products": [
          {
            "name": "string",
            "priceMinorUnits": 1000,
            "currency": "ARS",
            "allergens": ["GLUTEN"]
          }
        ]
      }
    ]
  }
}
```

Headers:
- `ETag: "<menuUpdatedAtEpochMs>"`
- `Cache-Control: private, max-age=30`

## Redacción

- no expone `menu.id`, `category.id`, `product.id` ni datos del tenant;
- expone sólo catálogo visible para lectura pública.

## Consistencia

- en I0 el payload representa un snapshot actual del menú y sus categorías/productos disponibles;
- `ETag` hoy se deriva del `updatedAt` del menú; locale/versionado editorial más rico queda como
  endurecimiento posterior.
