# Especificación — SPEC-009

## Endpoints

### POST /fiscal-entities (Crear entidad fiscal)
```
Request:
{
  "name": "string",
  "cuit": "string (11 digits, ej: 20123456789)",
  "legal_address": "string",
  "fiscal_address": "string",
  "regime": "MONOTRIBUTO | RESPONSABLE_INSCRIPTO",
  "activity_code": "string (AFIP)"
}

Response (201):
{
  "data": {
    "id": "uuid",
    "tenant_id": "uuid",
    "cuit": "...",
    "name": "...",
    "regime": "...",
    "created_at": "ISO8601"
  }
}
```

### GET /fiscal-entities (Listar)
Response (200):
```json
{
  "data": [{ id, name, cuit, regime }, ...],
  "meta": { "total": 2 }
}
```

### GET /fiscal-entities/:id (Detalle)
Response (200): Entidad fiscal completa

### PATCH /fiscal-entities/:id (Actualizar)
Campos: name, legal_address, fiscal_address, activity_code

Response (200): Entidad actualizada

## Authorization

- All endpoints → OWNER only (fiscal es crítico)

## Validaciones

- cuit: 11 dígitos, único en tenant
- regime: debe ser válido en AFIP
- activity_code: validar contra AFIP
