# Especificación — SPEC-047

## Endpoints

### GET /dashboard/overview
```
Response (200):
{
  data: {
    openVisits: 12,
    occupiedTables: 8,
    activeOrders: 15,
    pendingPayments: 3,
    lastUpdated: ISO8601
  }
}
```
