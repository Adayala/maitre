# Especificación — SPEC-012

## Endpoints

### POST /tables (Crear mesa)
```
Request:
{
  "salon_id": "uuid",
  "number": "string (1-10, ej: '1', 'A3')",
  "capacity": "integer (1-20)",
  "shape": "ROUND | RECTANGULAR | SQUARE",
  "zone": "string | null"
}

Response (201):
{
  "data": {
    "id": "uuid",
    "salon_id": "uuid",
    "number": "...",
    "capacity": 4,
    "status": "AVAILABLE" (DERIVED),
    "created_at": "ISO8601"
  }
}
```

### GET /tables?salon_id=uuid (Listar)
Con estado derivado.

Response (200):
```json
{
  "data": [{ id, number, capacity, status }, ...],
  "meta": { "total": 20 }
}
```

### GET /tables/:id (Detalle)
Incluye estado derivado y ocupación actual.

### PATCH /tables/:id (Actualizar)
Campos: number, capacity, zone, shape

Response (200): Mesa actualizada

### GET /tables/:id/status (Estado en tiempo real)
Response (200):
```json
{
  "status": "OCCUPIED",
  "occupancy": {
    "guest_count": 4,
    "visit_id": "uuid",
    "arrival_at": "ISO8601"
  }
}
```

## Authorization

- POST /tables → OWNER, ADMIN (respeta max_tables del plan)
- GET /tables → OWNER, ADMIN, MANAGER, EMPLOYEE
- PATCH /tables/:id → OWNER, ADMIN
- GET /tables/:id/status → All authenticated users

## Notas

- Status es DERIVED, no se almacena en BD
- Cálculo en tiempo real desde visitas, reservas, bloques
