# Estructura — SPEC-091

```text
Order Tracking API
├── public detail by ORDER_TRACK_READ capability
├── internal detail by orderId + permiso/alcance
├── projection fields: status, item allocations, timestamps
├── freshness: aggregateRevision, projectionCursor, asOf
└── audience-specific redaction
```
