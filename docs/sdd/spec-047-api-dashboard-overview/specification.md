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
      "status": "AVAILABLE",
      "asOf": "ISO8601",
      "openVisits": 3,
      "occupiedTables": 4,
      "activeOrders": 2,
      "pendingPayments": 1
    },
    "lastUpdated": "ISO8601"
  }
}
```

El contrato actual no expone todavía `sections`, `metrics`, `freshness`, `sourceRevision`,
`overviewRevision` ni `ETag`. Devuelve un resumen simple con dos bloques:

- `setup`: estado básico del tenant sembrado (`tenantName`, `brandCount`, `branchCount`);
- `operations`: conteos autoritativos de Floor, Ordering y Payments, limitados a las sucursales
  permitidas por el membership.

Si una fuente operacional falla, el bloque `operations` degrada a `UNAVAILABLE`, devuelve `null`
en todos sus contadores y un `reason` estable. No fabrica ceros.
