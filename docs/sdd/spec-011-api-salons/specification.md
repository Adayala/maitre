# Especificación — SPEC-011

## Endpoints

### POST /salons (Crear salón)
```
Request:
{
  "branchId": "uuid",
  "name": "string (1-50)",
  "capacity": "integer (máx huéspedes en salón)",
  "description": "string | null"
}

Response (201):
{
  "data": {
    "id": "uuid",
    "branchId": "uuid",
    "name": "...",
    "capacity": 50,
    "createdAt": "ISO8601"
  }
}
```

### GET /salons (Listar)
Filtrar por branchId.

Response (200):
```json
{
  "data": [{ id, name, capacity }, ...],
  "meta": { "total": 3 }
}
```

### GET /salons/:id (Detalle)
Incluye mesas del salón.

### PATCH /salons/:id (Actualizar)
Campos: name, capacity, description

Response (200): Salón actualizado

### DELETE /salons/:id (Desactivar)

Baja lógica: cambia el salón a `INACTIVE` y conserva mesas e historial. Response (204).

## Autorización

- POST /salons → OWNER, ADMIN
- GET /salons → OWNER, ADMIN, MANAGER
- PATCH /salons/:id → OWNER, ADMIN
- DELETE /salons/:id → OWNER, ADMIN

## Superficie de backoffice

La gestión de salones vive dentro de `/branches`: selector de sucursal, listado, alta y edición de
nombre/capacidad. Si no hay sucursal, el formulario explica que debe crearse una primero.
