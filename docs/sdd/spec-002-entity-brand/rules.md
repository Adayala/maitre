# Rules — SPEC-002

## Invariantes

### 1. Slug único por tenant
No pueden existir 2 brands con igual slug dentro del mismo tenant.

### 2. Status transiciones válidas
```
ACTIVE ↔ INACTIVE (reversible)
ACTIVE → ARCHIVED (irreversible)
INACTIVE → ARCHIVED (irreversible)
```

### 3. Brand ARCHIVED es read-only
Si status = ARCHIVED: no se pueden crear branches nuevas, no se pueden cambiar configs.

### 4. Config heritable
Branch hereda config de brand a menos que la sobrescriba.

## Cambios permitidos

### Crear brand
Precondición: tenant_id existe

Acción:
1. Validar nombre (3-100 chars)
2. Generar slug desde nombre
3. Verificar slug único en tenant
4. Crear brand con status ACTIVE
5. Registrar en AuditLog

Postcondición: brand creado, evento BrandCreated emitido

### Cambiar nombre/slug
Solo si status != ARCHIVED
Validar nuevo slug único

### Cambiar config
Solo si status != ARCHIVED
Herencia a branches que no la sobrescribieron

### Cambiar status
Validar transición según máquina de estados

### Archivar brand
Status → ARCHIVED
Branches → READ_ONLY
Preservar datos para auditoría
