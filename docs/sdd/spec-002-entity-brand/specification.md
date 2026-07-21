# Especificación — SPEC-002

## Tipo de spec

Entity

## Definición formal

Una marca es una identidad comercial dentro de un tenant. Agrupa sucursales, comparte configuración y menú.

Propiedades:
- Pertenece a un tenant (tenant_id)
- Tiene nombre y slug único dentro del tenant
- Puede tener logo, descripción, website
- Tiene configuración heredable (menú, políticas, tono de voz)
- Estado: ACTIVE, INACTIVE, ARCHIVED
- Auditable: createdAt, createdBy, updatedAt, updatedBy

## Schema JSON

```json
{
  "id": "uuid (inmutable)",
  "tenantId": "uuid (tenant que posee la marca)",
  "name": "string (1-100 chars, ej: 'La Parrilla')",
  "slug": "string (normalizado, único en tenant, ej: 'la-parrilla')",
  "description": "string (0-500 chars) | null",
  "status": "enum: ACTIVE | INACTIVE | ARCHIVED",
  "logo_url": "string (URL a logo) | null",
  "website": "string (URL) | null",
  "default_menu_id": "uuid | null (menú heredado por sucursales)",
  "config": {
    "cancellation_policy": "string | null",
    "brand_voice": "string | null (tono para respuestas)",
    "allergen_policy": "string | null",
    "language": "string (ISO 639-1, ej: es, en)",
    "currency": "string (ISO 4217, ej: ARS)"
  },
  "createdAt": "ISO8601 timestamp",
  "createdBy": "uuid (userId)",
  "updatedAt": "ISO8601 timestamp",
  "updatedBy": "uuid (userId)",
  "archivedAt": "ISO8601 timestamp | null",
  "archivedBy": "uuid | null"
}
```

## Enums

### Status

```
ACTIVE       = Operando, sucursales pueden usarla
INACTIVE     = Pausada, no se pueden crear sucursales nuevas
ARCHIVED     = Cerrada, solo lectura, no se crean sucursales
```

Transiciones válidas:
- ACTIVE ↔ INACTIVE (reversible)
- ACTIVE → ARCHIVED (irreversible)
- INACTIVE → ARCHIVED (irreversible)

## Validaciones

- `name` — Mínimo 3 caracteres, máximo 100
- `slug` — Generado automáticamente desde `name`, único en tenant
- `tenantId` — Debe existir en BD
- `default_menu_id` — Si se especifica, debe existir y pertenecer al tenant
- `logo_url` — Si se especifica, debe ser URL válida
- `website` — Si se especifica, debe ser URL válida
- `config.language` — Debe ser código ISO 639-1 válido
- `config.currency` — Debe ser código ISO 4217 válido

## Reglas e invariantes

### 1. Slug único por tenant

**Regla:** No pueden existir dos brands en un tenant con el mismo slug.

**Ejemplo:** Tenant 1 puede tener "la-parrilla", pero Tenant 2 también puede (son tenants distintos).

---

### 2. Brand no puede existir sin tenant

**Regla:** Todo brand debe tener un tenantId válido.

**Validación:** Al crear brand, verificar que tenant existe.

---

### 3. Menú heredable

**Regla:** Si brand tiene `default_menu_id`, las sucursales lo heredan a menos que especifiquen otro.

**Cascada:**
```
Brand config → Branch hereda → Branch puede sobrescribir
```

---

### 4. Status transiciones válidas

**Regla:** Solo las transiciones enumeradas son permitidas.

---

### 5. Brand ARCHIVED en read-only

**Regla:** Si status = ARCHIVED:
- No se pueden crear sucursales nuevas
- No se pueden cambiar configuraciones
- Sí se pueden leer todos los datos

---

## Ejemplos

### Ejemplo 1: Brand nuevo

```json
{
  "id": "brand_uuid_001",
  "tenantId": "tenant_123",
  "name": "La Parrilla",
  "slug": "la-parrilla",
  "description": "Parrilla tradicional con carnes premium",
  "status": "ACTIVE",
  "logo_url": "https://s3.../logo-la-parrilla.png",
  "website": "https://laparrilla.com.ar",
  "default_menu_id": "menu_parrilla_v2",
  "config": {
    "cancellation_policy": "Cancelar hasta 24hs antes",
    "brand_voice": "Profesional y cálido",
    "allergen_policy": "Consultar siempre con chef",
    "language": "es",
    "currency": "ARS"
  },
  "createdAt": "2026-01-10T10:00:00Z",
  "createdBy": "user_owner_123",
  "updatedAt": "2026-01-10T10:00:00Z",
  "updatedBy": "user_owner_123",
  "archivedAt": null,
  "archivedBy": null
}
```

### Ejemplo 2: Brand con status INACTIVE

```json
{
  "id": "brand_uuid_002",
  "tenantId": "tenant_123",
  "name": "Pizzería Bella",
  "slug": "pizzeria-bella",
  "status": "INACTIVE",
  "default_menu_id": null,
  "config": {
    "language": "es",
    "currency": "ARS"
  }
}
```

---

## Edge cases

### Renombrar brand

Si se cambia `name`, se regenera `slug`:
- Verificar que nuevo slug es único en tenant
- Si no es único, error 409 Conflict
- AuditLog registra el cambio

### Cambiar menú default

```
PATCH /brands/:id
{
  "default_menu_id": "menu_nueva_v3"
}
```

Las sucursales que heredan automáticamente reciben el nuevo menú. Las que lo sobrescribieron, no se afectan.

### Archivar brand

Cuando se archiva un brand:
1. Status → ARCHIVED
2. Sucursales existentes quedan en estado READ_ONLY
3. No se pueden crear sucursales nuevas
4. Datos se conservan para auditoría

---

## Relaciones

- Brand belongs to Tenant (1:N)
- Brand has many Branches (1:N, a través de brand_id en Branch)
- Brand has optional default Menu (1:1 a Menu)
- Brand created/updated by User (N:1 a User)
