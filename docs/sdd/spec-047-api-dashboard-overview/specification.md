# Especificación — SPEC-047

## Endpoints

### `GET /v1/dashboard/overview`

```json
{
  "data": {
    "setup": {
      "status": "AVAILABLE",
      "asOf": "ISO8601",
      "tenantName": "Demo Tenant",
      "brandCount": 1,
      "branchCount": 1
    },
    "operations": {
      "status": "UNAVAILABLE",
      "asOf": "ISO8601",
      "reason": "Floor/Ordering/Payments domains not implemented yet (Fase 2)",
      "openVisits": null,
      "occupiedTables": null,
      "activeOrders": null,
      "pendingPayments": null
    },
    "lastUpdated": "ISO8601"
  }
}
```

El I0 actual no expone `sections`, `metrics`, `freshness`, `sourceRevision`, `overviewRevision` ni
`ETag`. Devuelve un resumen simple con dos bloques:

- `setup`: estado básico del tenant sembrado (`tenantName`, `brandCount`, `branchCount`);
- `operations`: bloque degradado `UNAVAILABLE` mientras Floor/Ordering/Payments no están integrados
  en esta vista.

Una dependencia faltante no fabrica cero operativo: el bloque `operations` devuelve `null` en sus
contadores y un `reason` explícito.
