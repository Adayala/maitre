# Especificación — SPEC-004

## 1. Definición

Branch es una unidad operativa de un Tenant asociada a una Brand. Puede representar un local físico o, si un caso futuro lo justifica, una unidad lógica mediante un tipo explícito.

## 2. Contrato de dominio

```ts
type BranchStatus = 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';

type Address = {
  line1: string;
  line2?: string;
  city: string;
  subdivision?: string;
  postalCode?: string;
  countryCode: string;
};

type Branch = {
  id: string;
  tenantId: string;
  brandId: string;
  fiscalEntityId?: string;
  code: string;
  name: string;
  timezone: string;
  status: BranchStatus;
  address?: Address;
  contactEmail?: string;
  contactPhone?: string;
  createdAt: Date;
  createdBy?: string;
  updatedAt: Date;
  updatedBy?: string;
};
```

## 3. Validaciones

| Campo | Restricción |
| --- | --- |
| `id` | UUID inmutable generado por servidor |
| `tenantId` | inmutable; Tenant existente y no archivado al crear |
| `brandId` | Brand existente, del mismo Tenant y habilitada para nuevas branches |
| `fiscalEntityId` | opcional; FiscalEntity del mismo Tenant |
| `code` | normalizado a mayúsculas, patrón `[A-Z0-9][A-Z0-9_-]{0,31}`, único por Tenant |
| `name` | trim, 1–120 caracteres |
| `timezone` | identificador IANA soportado |
| `countryCode` | ISO 3166-1 alpha-2 soportado |
| `contactEmail` | email opcional normalizado |
| `contactPhone` | E.164 opcional |

La dirección es opcional en I0 para permitir walking skeleton, pero si existe requiere `line1`, `city` y `countryCode`.

## 4. Estados

```text
ACTIVE <-> INACTIVE
ACTIVE -> ARCHIVED
INACTIVE -> ARCHIVED
```

- `ACTIVE`: puede operar si Tenant, autorización y entitlements también lo permiten.
- `INACTIVE`: bloquea nuevos comandos operativos en esa sucursal.
- `ARCHIVED`: terminal y de sólo lectura salvo retención/exportación autorizada.

El estado de Branch no reemplaza el de Tenant, Brand, FiscalEntity ni Subscription. La capacidad efectiva es la intersección de todos los controles aplicables.

## 5. Consistencia tenant-scoped

Las relaciones deben impedir referencias cruzadas. Además de validación de aplicación, la persistencia usa claves compuestas para que `(tenant_id, brand_id)` y `(tenant_id, fiscal_entity_id)` sólo apunten a filas del mismo Tenant.

Cambiar `tenantId` está prohibido. Reasignar Brand requiere un caso de uso explícito, validación same-tenant y auditoría; no se habilita mediante PATCH genérico en I0.

## 6. Capacidades e herencia

Branch no contiene `servicesActive`: las capacidades se calculan desde Subscription/Entitlement con scope de Tenant/Branch cuando corresponda.

Branch tampoco contiene un JSON `config` ni `menuId` en I0. Defaults regionales parten de Tenant; cualquier override futuro debe ser un campo tipado con precedencia documentada. La asociación de menú pertenece al dominio Catalog.

## 7. Eventos y auditoría

Crear Branch registra `BranchCreated` mediante transactional outbox. El evento incluye IDs, code, name, timezone y metadata de auditoría; no incluye secretos ni objetos relacionados completos.

Actor User puede ser nulo para workflows de sistema autorizados, usando el audit context definido en SPEC-001.

## 8. Representación

API usa camelCase y PostgreSQL snake_case. Fechas se almacenan como `timestamptz` y se serializan ISO 8601 UTC. La timezone de Branch se conserva como identificador IANA para cálculos locales, nunca como offset fijo.
