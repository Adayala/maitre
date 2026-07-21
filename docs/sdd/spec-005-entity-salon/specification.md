# Especificación — SPEC-005

## Definición

Salón es área física dentro de sucursal. Agrupa mesas, facilita operación.

## Schema JSON

```json
{
  "id": "uuid",
  "branchId": "uuid",
  "name": "string (ej: Salón Principal)",
  "capacity": "integer (capacidad total)",
  "description": "string | null",
  "status": "enum: ACTIVE | INACTIVE",
  "createdAt": "ISO8601"
}
```
