# Especificación — SPEC-012

## Endpoints

### POST /tables (Crear mesa)
```
Request:
{
  "salonId": "uuid",
  "number": "string (1-10, ej: '1', 'A3')",
  "capacity": "integer (1-20)",
  "shape": "ROUND | RECTANGULAR | SQUARE",
  "zone": "string | null"
}

Response (201):
{
  "data": {
    "id": "uuid",
    "salonId": "uuid",
    "number": "...",
    "capacity": 4,
    "status": "AVAILABLE" (DERIVED),
    "createdAt": "ISO8601"
  }
}
```

### GET /tables?salonId=uuid (Listar)
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
    "guestCount": 4,
    "visitId": "uuid",
    "arrivalAt": "ISO8601"
  }
}
```

## Authorization

- POST/PATCH `/tables` requiere `table.manage` y revalida cuota server-side.
- GET configuración requiere `table.read` y alcance por sucursal.
- GET status requiere `table.status.read`; roles operativos reciben sólo este permiso si aplica.
- No se autoriza por `EMPLOYEE` genérico ni por estar meramente autenticado.

## Notas

- Status es DERIVED, no se almacena en BD
- Cálculo en tiempo real desde visitas, reservas, bloques
