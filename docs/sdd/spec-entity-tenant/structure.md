# Tenant Structure

## JSON Schema

```json
{
  "id": "uuid (inmutable)",
  "name": "string (1-100 chars)",
  "email": "string (email válido)",
  "country": "string (ISO 3166-1 alpha-2, ej: AR, US)",
  "timezone": "string (IANA timezone, ej: America/Argentina/Buenos_Aires)",
  "status": "enum: ACTIVE | SUSPENDED | ARCHIVED",
  "plan": "string (ej: STARTER, PROFESSIONAL, ENTERPRISE)",
  "createdAt": "ISO8601 timestamp",
  "updatedAt": "ISO8601 timestamp",
  "createdBy": "uuid (userId who registered)",
  "lastSuspendedAt": "ISO8601 timestamp | null",
  "lastSuspendedBy": "uuid | null",
  "suspensionReason": "string | null (motivo de suspensión si aplica)",
  "archivedAt": "ISO8601 timestamp | null",
  "archivedBy": "uuid | null",
  "metadata": {
    "logo_url": "string | null",
    "website": "string | null",
    "phone": "string | null",
    "notes": "string | null"
  }
}
```

## Campos críticos

| Campo | Tipo | Requerido | Notas |
| --- | --- | --- | --- |
| `id` | UUID | ✅ | Generado por backend, nunca cambiar |
| `name` | string | ✅ | Nombre comercial del cliente |
| `email` | string | ✅ | Email principal de contacto, único en Maitre |
| `country` | string | ✅ | Para localización (horarios, moneda, impuestos) |
| `timezone` | string | ✅ | Para calcular jornadas, reportes, etc |
| `status` | enum | ✅ | ACTIVE, SUSPENDED, ARCHIVED |
| `plan` | string | ✅ | Para referencia, el source of truth es Subscription |
| `createdAt` | timestamp | ✅ | Inmutable |
| `updatedAt` | timestamp | ✅ | Se actualiza con cada cambio |
| `createdBy` | UUID | ✅ | Usuario que registró el tenant (usualmente el owner inicial) |
| `metadata` | object | ❌ | Datos adicionales que no caben en schema |

## Enums

### Status

```
ACTIVE       = Operando normalmente
SUSPENDED    = Suspendido por razones comerciales (pago, incumplimiento)
ARCHIVED     = Cerrado permanentemente (solo lectura)
```

Transiciones válidas:
- ACTIVE → SUSPENDED → ACTIVE (reversible)
- ACTIVE → ARCHIVED (irreversible)
- SUSPENDED → ARCHIVED (irreversible)

### Plan (referencia)

```
STARTER      = Entrada, 1 sucursal, servicios básicos
PROFESSIONAL = Múltiples sucursales, más servicios
ENTERPRISE   = Customización, SLA, support dedicado
```

El source of truth es `Subscription`, no este campo.

## Validaciones

- `email` — Debe ser único en la base de datos
- `email` — Debe pasar validación RFC 5322 básica
- `name` — Mínimo 3 caracteres, máximo 100
- `country` — Debe ser código ISO válido
- `timezone` — Debe ser IANA timezone válido
- `status` — Solo los valores enumerados

## Convenciones

- ID siempre es UUID v4
- Timestamps siempre en ISO 8601 UTC
- Email normalizado (lowercase)
- Name se almacena como fue ingresado (puede tener mayúsculas)
