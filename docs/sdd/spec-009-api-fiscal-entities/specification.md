# Especificación — SPEC-009

## Endpoints

### POST /fiscal-entities (Crear entidad fiscal)
```
Request:
{
  "name": "string (razón social; alias operativo del legalName)",
  "cuit": "string (11 digits, ej: 20123456789)",
  "taxCondition": "RI | MONOTRIBUTISTA | EXENTO",
  "legalAddress": "string | omitted",
  "fiscalAddress": "string | omitted",
  "activityCode": "string | omitted"
}

Response (201):
{
  "data": {
    "id": "uuid",
    "tenantId": "uuid",
    "cuit": "...",
    "name": "...",
    "taxCondition": "...",
    "legalAddress": "... | omitted",
    "fiscalAddress": "... | omitted",
    "activityCode": "... | omitted",
    "status": "ACTIVE",
    "createdAt": "ISO8601",
    "updatedAt": "ISO8601"
  }
}
```

Headers:
- `Idempotency-Key` recomendado/soportado para reintentos seguros de create. Reusar la misma key con el mismo payload debe devolver el mismo resultado lógico.

### GET /fiscal-entities (Listar)
Response (200):
```json
{
  "data": [{ id, name, cuit, taxCondition, status, "...campos según permiso..." }, ...],
  "page": { "total": 2, "limit": 50, "offset": 0 }
}
```

Política de redacción:
- actores con sólo `fiscalEntity:read` reciben vista minimizada;
- actores con `fiscalEntity:create` o `fiscalEntity:write` reciben detalle completo.

### GET /fiscal-entities/:id (Detalle)
Response (200): Entidad fiscal completa visible según permiso

Headers:
- `ETag: "<updatedAtEpochMs>"`

### PATCH /fiscal-entities/:id (Actualizar)
Headers:
- `If-Match` obligatorio con la revisión/ETag vigente
- `X-Step-Up-At` obligatorio cuando el cambio afecta datos fiscales sensibles

Campos permitidos:
- `name`
- `taxCondition`
- `legalAddress`
- `fiscalAddress`
- `activityCode`
- `reason` obligatorio para cambios sensibles (`taxCondition`, direcciones, `activityCode`)

Response (200): Entidad actualizada

## Autorización

- Todos los endpoints requieren permisos fiscales explícitos; la visibilidad o pertenencia nominal no reemplaza autorización.
- `create` y `write` quedan restringidos a perfiles con permiso fiscal explícito del tenant.
- lectura administrativa puede entregarse redactada bajo `fiscalEntity:read`.

## Validaciones

- cuit: 11 dígitos, único en tenant
- taxCondition: catálogo aprobado (`RI`, `MONOTRIBUTISTA`, `EXENTO`)
- name: 3-200 chars
- legalAddress/fiscalAddress/activityCode: opcionales en I0; su validación oficial/AFIP queda diferida a la integración fiscal
- cambios sensibles en `PATCH` exigen `reason` y step-up reciente

## Auditoría y eventos

- `POST` emite `FiscalEntityCreated` con payload mínimo
- `POST` y `PATCH` escriben audit log con snapshots sanitizados
- auditoría y outbox no incluyen CUIT completo, direcciones, `activityCode` crudo, certificados ni secret refs

## Errores

- `404` para recurso inexistente o cross-tenant
- `409` para CUIT duplicado o conflicto de concurrencia semántico
- `412` o `409` de revisión para `If-Match` inválido/obsoleto según contrato operativo adoptado por la API
- `422` queda reservado para validaciones fiscales externas cuando exista integración con AFIP/ARCA
