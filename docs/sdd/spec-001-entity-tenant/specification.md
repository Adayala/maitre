# Especificación — SPEC-001

## Tipo de spec

Entity

## Definición formal

Un tenant es una organización (empresa de restaurantes) aislada en el sistema multi-tenant. 
Es la raíz de toda la jerarquía: cada tenant tiene marcas, sucursales, usuarios, menú, datos de huéspedes, etc.

Propiedades:
- Identificador único global (id)
- Nombre del tenant
- Información de contacto
- Configuración global
- Estado (TRIAL, ACTIVE, SUSPENDED, CANCELLED)
- Auditable: createdAt, createdBy, updatedAt, updatedBy

## Schema JSON

```json
{
  "id": "uuid (inmutable, PK)",
  "name": "string (1-100 chars, ej: 'Grupo Gastronomía Argentina')",
  "contact_email": "string (email único global)",
  "contact_phone": "string (E.164 format, ej: +541140000000) | null",
  "status": "enum: TRIAL | ACTIVE | SUSPENDED | CANCELLED",
  "plan_tier": "enum: STARTER | PROFESSIONAL | ENTERPRISE",
  "plan_expiry": "ISO8601 timestamp | null (fecha de vencimiento del plan)",
  "max_branches": "integer (límite de sucursales)",
  "max_users": "integer (límite de usuarios)",
  "max_tables": "integer (límite de mesas en todas sucursales)",
  "features_enabled": {
    "reservations": "boolean",
    "analytics": "boolean",
    "integrations": "boolean",
    "fiscal_printer": "boolean",
    "multi_currency": "boolean"
  },
  "billing_country": "string (ISO 3166-1 alpha-2, ej: AR)",
  "default_currency": "string (ISO 4217, ej: ARS)",
  "default_timezone": "string (IANA tz, ej: America/Argentina/Buenos_Aires)",
  "config": {
    "business_type": "string (ej: restaurant, bar, cafe)",
    "employee_count": "integer | null",
    "revenue_annual": "number | null"
  },
  "created_at": "ISO8601 timestamp",
  "created_by": "uuid (userId del owner inicial)",
  "updated_at": "ISO8601 timestamp",
  "updated_by": "uuid (userId del último cambio)",
  "suspended_at": "ISO8601 timestamp | null",
  "cancelled_at": "ISO8601 timestamp | null"
}
```

## Enums

### Status

```
TRIAL       = Período de prueba (14 días), sin pago
ACTIVE      = Suscripción activa, todas las features según plan
SUSPENDED   = Suspendido por falta de pago, sin acceso a operaciones
CANCELLED   = Cancelado, solo lectura, datos preservados 1 año
```

Transiciones válidas:
- TRIAL → ACTIVE (con pago)
- ACTIVE ↔ SUSPENDED (reversible)
- TRIAL → CANCELLED
- ACTIVE → CANCELLED
- SUSPENDED → CANCELLED

## Validaciones

- `name` — Mínimo 3 caracteres, máximo 100
- `contact_email` — RFC 5322 válido, único globalmente
- `contact_phone` — Formato E.164 si se provee
- `plan_tier` — Debe corresponder a plan activo en Subscription
- `plan_expiry` — Si es ACTIVE, debe estar en futuro
- `max_branches`, `max_users`, `max_tables` — Números positivos, respetar plan_tier
- `billing_country` — Código ISO válido
- `default_timezone` — Debe ser IANA válido

## Reglas e invariantes

### 1. Email único globalmente

**Regla:** No pueden existir dos tenants con el mismo contact_email.

**Implementación:** Índice único en BD.

### 2. Aislamiento de datos por tenant_id

**Regla:** Todo dato de usuario, orden, mesa, etc. debe estar etiquetado con tenant_id.

**Verificación:** Query sin tenant_id en WHERE debe ser explícitamente BLOCKED.

### 3. Límites de recursos por plan

**Regla:** No pueden crear más sucursales/usuarios/mesas que el plan permite.

**Verificación:** En CREATE de Branch/User/Table, validar contra max_branches/max_users/max_tables.

**Ejemplo:**
```
SELECT COUNT(*) FROM branches WHERE tenant_id = ? 
  → Si >= max_branches, rechazar CREATE
```

### 4. Estado SUSPENDED bloquea operaciones

**Regla:** Un tenant SUSPENDED no puede:
- Crear/modificar visitas
- Procesar pagos
- Crear órdenes
- Pero SÍ puede: leer datos históricos, administración

**Implementación:** Middleware valida tenant.status antes de escritura.

### 5. Estado CANCELLED es de solo lectura

**Regla:** Un tenant CANCELLED no puede modificar nada. Solo lectura.

**Implementación:** Todas las operaciones de escritura verifican status != CANCELLED.

### 6. Trial expiry automático

**Regla:** Tras 14 días en TRIAL, sin pago → automáticamente CANCELLED.

**Implementación:** Background job diario revisa TRIAL con created_at < now - 14 días.
