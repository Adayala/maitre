# Rules — SPEC-004

## Invariantes

### 1. Code único por tenant
Unique constraint (tenant_id, code).

### 2. Brand exists
Branch.brand_id must reference valid brand.

### 3. Status transiciones válidas
ACTIVE ↔ INACTIVE → ARCHIVED

### 4. Services match entitlements
Branch services_active must be subset of tenant entitlements.

### 5. Timezone válido
IANA timezone.

## Cambios permitidos

### Crear branch
Precondición: tenant, brand, fiscal_entity (optional) exist
Acción: Crear con status ACTIVE
Postcondición: Branch listo para agregar salones

### Cambiar config
Inherit de brand si no sobrescrito

### Archivar branch
Status → ARCHIVED (read-only)
