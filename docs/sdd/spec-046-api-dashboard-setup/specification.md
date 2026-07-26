# Especificación — SPEC-046

## Endpoints

### `GET /v1/dashboard/setup-status`

```json
{
  "data": {
    "setup": {
      "tenant": { "status": "COMPLETE", "count": 1, "required": 1 },
      "brands": {
        "status": "INCOMPLETE",
        "count": 0,
        "required": 1,
        "actionLink": "/v1/brands"
      }
    },
    "nextSteps": ["Configurar brands"]
  }
}
```

El I0 actual no expone `items[]`, `reasonCodes`, `routeRef`, `meta.revision`, `asOf` ni
`freshness`. Devuelve un mapa `setup` por código (`tenant`, `brands`, `branches`, `users`,
`menus`, `products`), con `status`, `count`, `required` y opcionalmente `actionLink`, más un
array `nextSteps` derivado.
