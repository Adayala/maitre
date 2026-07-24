# Especificación — SPEC-009

## Endpoints

### POST /fiscal-entities (Crear entidad fiscal)
```
Request:
{
  "name": "string",
  "cuit": "string (11 digits, ej: 20123456789)",
  "legalAddress": "string",
  "fiscalAddress": "string",
  "regime": "MONOTRIBUTO | RESPONSABLE_INSCRIPTO",
  "activityCode": "string (AFIP)"
}

Response (201):
{
  "data": {
    "id": "uuid",
    "tenantId": "uuid",
    "cuit": "...",
    "name": "...",
    "regime": "...",
    "createdAt": "ISO8601"
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
Campos: name, legalAddress, fiscalAddress, activityCode

Response (200): Entidad actualizada

## Autorización

- Todos los endpoints requieren permisos fiscales explícitos; la visibilidad o pertenencia nominal no reemplaza autorización.

## Validaciones

- cuit: 11 dígitos, único en tenant
- regime: debe ser válido en AFIP
- activityCode: validar contra AFIP
