# Especificación — SPEC-004

## Definición

Sucursal es la unidad operacional: dirección física, horarios, servicios activos, salones, reportes.

## Schema JSON

```json
{
  "id": "uuid",
  "tenantId": "uuid",
  "brandId": "uuid",
  "fiscalEntityId": "uuid | null",
  "code": "string (código único en tenant, ej: PALERMO)",
  "name": "string (nombre comercial)",
  "address": "string",
  "phone": "string | null",
  "email": "string | null",
  "timezone": "string (IANA timezone)",
  "status": "enum: ACTIVE | INACTIVE | ARCHIVED",
  "services_active": ["FLOOR", "KITCHEN", "QR_MENU", ...],
  "config": {
    "language": "es | en",
    "currency": "ARS | USD",
    "menu_id": "uuid | null (hereda de brand si null)"
  },
  "createdAt": "ISO8601",
  "createdBy": "uuid",
  "updatedAt": "ISO8601"
}
```

## Validaciones

- `code` — Único en tenant, alphanumeric
- `name` — 3-100 chars
- `timezone` — IANA válido
- `services_active` — Debe coincidir con entitlements de tenant
- `config.menu_id` — Si se especifica, debe existir y ser de la marca
