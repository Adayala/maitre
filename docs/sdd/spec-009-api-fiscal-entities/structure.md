# Estructura — API

**Spec:** SPEC-009

## Estructura del endpoint

Todos los endpoints requieren:
- header `Authorization` (Bearer token)
- header `X-Tenant-Id`
- header `X-Branch-Id` cuando el recurso tenga alcance por sucursal

## Formato de respuesta

```json
{
  "data": { ... },
  "meta": { "timestamp": "ISO8601" }
}
```

## Códigos de error

- 400: Bad Request (validación)
- 401: Unauthorized
- 403: Forbidden (sin autorización suficiente)
- 404: Not Found
- 409: Conflict (restricción única)
- 429: Rate Limited
- 500: Server Error
