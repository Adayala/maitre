# Especificación — SPEC-002

## Definición formal

Brand es una identidad comercial dentro de un tenant. Agrupa sucursales y puede publicar defaults
explícitos para presentación o catálogos, sin absorber capacidades, fiscalidad ni configuración abierta.

La personalización completa no se guarda como `config` abierto dentro de Brand: se modela mediante
el agregado versionado `BrandPresentation` de SPEC-232. Brand mantiene referencias estables a su
logo/defaults actuales por compatibilidad, mientras la resolución efectiva usa el snapshot publicado.

## Schema JSON

```json
{
  "id": "uuid (inmutable)",
  "tenantId": "uuid (tenant que posee la marca)",
  "name": "string (1-100 chars, ej: 'La Parrilla')",
  "slug": "string (normalizado, único en tenant, ej: 'la-parrilla')",
  "description": "string (0-500 chars) | null",
  "status": "enum: ACTIVE | INACTIVE | ARCHIVED",
  "logoUrl": "string (URL a logo) | null",
  "website": "string (URL) | null",
  "defaultMenuId": "uuid | null",
  "createdAt": "ISO8601 timestamp",
  "createdBy": "uuid (userId) | null",
  "updatedAt": "ISO8601 timestamp",
  "updatedBy": "uuid (userId) | null",
  "archivedAt": "ISO8601 timestamp | null",
  "archivedBy": "uuid | null"
}
```

## Enums

### Status

```
ACTIVE       = Operando, sujeto a tenant/autorización/capacidades
INACTIVE     = Pausada, no se crean sucursales nuevas ni mutaciones operativas
ARCHIVED     = Terminal, solo lectura autorizada
```

Transiciones válidas:
- ACTIVE ↔ INACTIVE (reversible)
- ACTIVE → ARCHIVED (irreversible)
- INACTIVE → ARCHIVED (irreversible)

## Validaciones

- `name` — Mínimo 3 caracteres, máximo 100
- `slug` — Normalizado, único en tenant y estable salvo workflow explícito
- `tenantId` — Debe existir en BD
- `defaultMenuId` — Si se especifica, debe existir y pertenecer al tenant
- `logoUrl` — Si se especifica, debe ser URL válida
- `website` — Si se especifica, debe ser URL válida

## Reglas e invariantes

### 1. Slug único por tenant

**Regla:** No pueden existir dos brands en un tenant con el mismo slug.

**Ejemplo:** Tenant 1 puede tener "la-parrilla", pero Tenant 2 también puede (son tenants distintos).

---

### 2. Brand no puede existir sin tenant

**Regla:** Todo brand debe tener un tenantId válido.

**Validación:** Al crear brand, verificar que tenant existe.

---

### 3. Default de menú explícito

**Regla:** Si Brand tiene `defaultMenuId`, las sucursales lo heredan sólo cuando el contrato dependiente lo habilita.

**Cascada:**
```
Brand default → Branch hereda → Branch puede sobrescribir si el contrato lo permite
```

---

### 4. Status transiciones válidas

**Regla:** Solo las transiciones enumeradas son permitidas.

---

### 5. Brand ARCHIVED en read-only

**Regla:** Si status = ARCHIVED:
- No se pueden crear sucursales nuevas
- No se pueden cambiar defaults operativos
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
  "logoUrl": "https://s3.../logo-la-parrilla.png",
  "website": "https://laparrilla.com.ar",
  "defaultMenuId": "menu_parrilla_v2",
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
  "defaultMenuId": null
}
```

---

## Edge cases

### Renombrar brand

Si se cambia `name`, un workflow explícito decide si `slug` debe cambiar:
- verificar que el nuevo slug sea único en tenant;
- si no es único, falla cerrado;
- auditoría registra el cambio.

### Cambiar menú default

```
PATCH /brands/:id
{ "defaultMenuId": "menu_nueva_v3" }
```

Las sucursales que heredan automáticamente reciben el nuevo menú. Las que lo sobrescribieron no se afectan.

### Archivar brand

Cuando se archiva un brand:
1. Status → ARCHIVED
2. La marca deja de aceptar mutaciones operativas nuevas
3. No se pueden crear sucursales nuevas
4. Los datos se conservan para auditoría

---

## Relaciones

- Brand belongs to Tenant (1:N)
- Brand has many Branches (1:N, a través de brandId en Branch)
- Brand has optional default Menu (1:1 a Menu)
- Brand created/updated by User (N:1 a User)
