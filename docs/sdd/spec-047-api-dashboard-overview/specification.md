# Especificación — SPEC-047

## Endpoints

### `GET /v1/dashboard/overview`

```json
{
  "data": {
    "sections": [
      {
        "code": "floor.current",
        "status": "AVAILABLE",
        "asOf": "ISO8601",
        "freshness": "FRESH",
        "sourceRevision": "floor-revision",
        "metrics": [
          { "metricCode": "visits.open.count", "value": 12, "unit": "COUNT" },
          { "metricCode": "tables.occupied.count", "value": 8, "unit": "COUNT" }
        ],
        "reasonCodes": []
      },
      {
        "code": "payments.current",
        "status": "UNAVAILABLE",
        "asOf": null,
        "freshness": "UNKNOWN",
        "sourceRevision": null,
        "metrics": [],
        "reasonCodes": ["SOURCE_TIMEOUT"]
      }
    ]
  },
  "meta": {
    "overviewRevision": "hash",
    "generatedAt": "ISO8601"
  }
}
```

Los `metricCode` deben existir en el registro/contrato. Una sección puede omitirse por permiso con
forma/semántica aprobada; nunca se rellena con cero.
