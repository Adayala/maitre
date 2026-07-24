# Especificación — SPEC-046

## Endpoints

### `GET /v1/dashboard/setup-status`

```json
{
  "data": {
    "items": [
      {
        "code": "organization.branch.minimum",
        "status": "INCOMPLETE",
        "reasonCodes": ["NO_ACTIVE_BRANCH"],
        "action": {
          "actionCode": "branch.create",
          "routeRef": "dash.branch.create"
        }
      }
    ]
  },
  "meta": {
    "revision": "setup-v1:source-hash",
    "asOf": "ISO8601",
    "freshness": "FRESH | STALE | PARTIAL"
  }
}
```

Los items no exponen counts/IDs por defecto. `routeRef` se resuelve desde un registro de rutas
allowlisted y no acepta URLs del backend.
