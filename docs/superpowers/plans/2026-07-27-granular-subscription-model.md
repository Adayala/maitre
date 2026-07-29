# Modelo de suscripción granular — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reemplazar el `PLAN_REGISTRY` fijo del módulo de suscripciones por un catálogo de servicios en base de datos con precio, tipo de facturación (`SERVICE`/`QUANTITY`) y alcance (tenant/marca/entidad fiscal/sucursal/conector), exponerlo por API, y dar de alta un panel interno tipo "app store" en `subscription-page.tsx` para activar/desactivar servicios y cantidades por tenant.

**Architecture:** Se agrega una tabla nueva `subscription_catalog_items` (plantilla/precio, fuente de verdad reemplazando el markdown) y se extiende `subscription_items` (contratación real) con `catalog_item_code` y `scope_ref_id`. El dominio gana un `CatalogRepositoryPort` y `calculateEntitlements` pasa de leer `plan.limits` a derivar límites desde los `subscription_items` activos del tenant. La API expone el catálogo de solo lectura y los mismos verbos de alta/baja ya existentes, ahora validados contra el catálogo. El frontend agrega una sección de tarjetas por servicio con toggle/stepper sobre los endpoints existentes.

**Tech Stack:** Fastify + Zod (API), Supabase Postgres (SQL crudo versionado, sin ORM), TypeScript workspace packages (`@maitre/subscription`), React + TanStack Query (`apps/web`), Vitest.

## Global Constraints

- Sin backfill: no hay suscripciones productivas reales más allá del tenant demo; el seed se resiembra, no se migra.
- `billing_type` solo admite `SERVICE` | `QUANTITY`. `period` solo admite `MONTHLY` (columna presente, sin lógica para otros valores).
- Panel interno únicamente — sin checkout ni gateway de pago en este plan.
- Seguir el patrón de repos existente: interfaz en `packages/modules/subscription/src/application/ports.ts`, implementación in-memory en `adapters/persistence/memory/src`, implementación Supabase en `adapters/persistence/supabase/src`, wiring en `apps/api/src/composition/container.ts`.
- Todas las migraciones SQL nuevas van en `supabase/migrations/` con timestamp posterior a `20260723010000`.
- Commits frecuentes, uno por tarea, siguiendo el estilo `type(scope): mensaje` ya usado en el repo.

---

### Task 1: Migración SQL — catálogo y extensión de subscription_items

**Files:**
- Create: `supabase/migrations/20260727200000_subscription_catalog.sql`
- Test: verificación manual vía `supabase db reset` (no hay test runner de SQL en el repo; se valida con el seed del Task 6 y los tests de Task 3/5).

**Interfaces:**
- Produces: tabla `subscription_catalog_items(code, name, billing_type, billing_scope, unit_price, currency, period, depends_on, is_active, version)`.
- Produces: columnas nuevas en `subscription_items`: `catalog_item_code text references subscription_catalog_items(code)`, `scope_ref_id uuid`.
- Produces: constraint único `(subscription_id, catalog_item_code, scope_ref_id)` reemplazando el único actual `(subscription_id, service_id)` (permite el mismo servicio en varias sucursales).

- [ ] **Step 1: Escribir la migración**

```sql
-- Subscription catalog (granular billing model): the priced, versioned
-- template for what can be contracted. subscription_items keeps the actual
-- contracted rows; this table is the source of truth for price/type/scope
-- that today only lives in docs/foundation/03-service-catalog.md.

create table subscription_catalog_items (
  code text primary key,
  name text not null,
  billing_type text not null check (billing_type in ('SERVICE', 'QUANTITY')),
  billing_scope text not null check (
    billing_scope in ('TENANT', 'BRAND', 'FISCAL_ENTITY', 'BRANCH', 'POS', 'CONNECTOR')
  ),
  unit_price numeric(12, 2) not null default 0,
  currency text not null default 'ARS',
  period text not null default 'MONTHLY' check (period in ('MONTHLY')),
  depends_on text[] not null default '{}',
  is_active boolean not null default true,
  version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table subscription_items
  add column catalog_item_code text references subscription_catalog_items (code),
  add column scope_ref_id uuid;

alter table subscription_items drop constraint subscription_items_subscription_id_service_id_key;
alter table subscription_items
  add constraint subscription_items_scope_unique
  unique (subscription_id, catalog_item_code, scope_ref_id);

alter table subscription_catalog_items enable row level security;

-- Catalog is a shared read-only reference table, readable by any
-- authenticated tenant context (same pattern as other reference data).
create policy catalog_read_all on subscription_catalog_items
  for select using (true);
```

- [ ] **Step 2: Validar sintaxis localmente**

Run: `cd /home/faguero/dev/maitre && supabase db lint supabase/migrations/20260727200000_subscription_catalog.sql 2>/dev/null || psql --version`

Si no hay Supabase CLI local disponible, saltar a Task 6 (seed) que ejecuta la migración contra la DB de test/desarrollo real y falla ruidosamente si el SQL es inválido.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/20260727200000_subscription_catalog.sql
git commit -m "feat(db): add subscription_catalog_items and scope columns"
```

---

### Task 2: Dominio — tipo CatalogItem y puerto CatalogRepositoryPort

**Files:**
- Create: `packages/modules/subscription/src/domain/catalog-item.ts`
- Modify: `packages/modules/subscription/src/application/ports.ts`
- Modify: `packages/modules/subscription/src/index.ts` (exportar los nuevos símbolos)
- Test: `packages/modules/subscription/src/domain/catalog-item.test.ts`

**Interfaces:**
- Produces: `CatalogBillingType = "SERVICE" | "QUANTITY"`, `CatalogBillingScope = "TENANT" | "BRAND" | "FISCAL_ENTITY" | "BRANCH" | "POS" | "CONNECTOR"`, `CatalogItem { code, name, billingType, billingScope, unitPrice, currency, period: "MONTHLY", dependsOn: string[], isActive, version }`.
- Produces: `requiresScopeRef(item: CatalogItem): boolean` (true si `billingScope !== "TENANT"`).
- Produces: `CatalogRepositoryPort { listActive(): Promise<CatalogItem[]>; findByCode(code: string): Promise<CatalogItem | null> }`.

- [ ] **Step 1: Escribir el test que falla**

```typescript
// packages/modules/subscription/src/domain/catalog-item.test.ts
import { describe, it, expect } from "vitest";
import { requiresScopeRef, type CatalogItem } from "./catalog-item.js";

const baseItem: CatalogItem = {
  code: "SEATS",
  name: "Plazas",
  billingType: "QUANTITY",
  billingScope: "BRANCH",
  unitPrice: 500,
  currency: "ARS",
  period: "MONTHLY",
  dependsOn: ["FLOOR"],
  isActive: true,
  version: 1,
};

describe("requiresScopeRef", () => {
  it("returns true when billing scope is not TENANT", () => {
    expect(requiresScopeRef(baseItem)).toBe(true);
  });

  it("returns false when billing scope is TENANT", () => {
    expect(requiresScopeRef({ ...baseItem, billingScope: "TENANT" })).toBe(false);
  });
});
```

- [ ] **Step 2: Correr el test y verificar que falla**

Run: `cd /home/faguero/dev/maitre/packages/modules/subscription && npx vitest run src/domain/catalog-item.test.ts`
Expected: FAIL — `Cannot find module './catalog-item.js'`

- [ ] **Step 3: Implementar**

```typescript
// packages/modules/subscription/src/domain/catalog-item.ts
// SPEC-0XX — SubscriptionCatalogItem: the priced, versioned template for
// what can be contracted (replaces the fixed PLAN_REGISTRY).

export type CatalogBillingType = "SERVICE" | "QUANTITY";
export type CatalogBillingScope =
  | "TENANT"
  | "BRAND"
  | "FISCAL_ENTITY"
  | "BRANCH"
  | "POS"
  | "CONNECTOR";

export interface CatalogItem {
  code: string;
  name: string;
  billingType: CatalogBillingType;
  billingScope: CatalogBillingScope;
  unitPrice: number;
  currency: string;
  period: "MONTHLY";
  dependsOn: string[];
  isActive: boolean;
  version: number;
}

export function requiresScopeRef(item: CatalogItem): boolean {
  return item.billingScope !== "TENANT";
}
```

- [ ] **Step 4: Correr el test y verificar que pasa**

Run: `cd /home/faguero/dev/maitre/packages/modules/subscription && npx vitest run src/domain/catalog-item.test.ts`
Expected: PASS (2 tests)

- [ ] **Step 5: Agregar el puerto**

```typescript
// packages/modules/subscription/src/application/ports.ts
// agregar al final del archivo, junto a los imports de arriba:
// import type { CatalogItem } from "../domain/catalog-item.js";

export interface CatalogRepositoryPort {
  listActive(): Promise<CatalogItem[]>;
  findByCode(code: string): Promise<CatalogItem | null>;
}
```

- [ ] **Step 6: Exportar desde el índice del paquete**

Modificar `packages/modules/subscription/src/index.ts` agregando:

```typescript
export type { CatalogItem, CatalogBillingType, CatalogBillingScope } from "./domain/catalog-item.js";
export { requiresScopeRef } from "./domain/catalog-item.js";
export type { CatalogRepositoryPort } from "./application/ports.js";
```

- [ ] **Step 7: Build del paquete y commit**

Run: `cd /home/faguero/dev/maitre/packages/modules/subscription && npm run build`
Expected: build sin errores.

```bash
git add packages/modules/subscription/src/domain/catalog-item.ts \
        packages/modules/subscription/src/domain/catalog-item.test.ts \
        packages/modules/subscription/src/application/ports.ts \
        packages/modules/subscription/src/index.ts
git commit -m "feat(subscription): add CatalogItem domain type and repository port"
```

---

### Task 3: Repositorios — InMemory y Supabase para el catálogo

**Files:**
- Create: `adapters/persistence/memory/src/catalog-item-repository.ts`
- Create: `adapters/persistence/supabase/src/catalog-item-repository.ts`
- Modify: `adapters/persistence/memory/src/index.ts` (export)
- Modify: `adapters/persistence/supabase/src/index.ts` (export)
- Test: `adapters/persistence/memory/src/catalog-item-repository.test.ts`

**Interfaces:**
- Consumes: `CatalogItem`, `CatalogRepositoryPort` de `@maitre/subscription` (Task 2).
- Produces: `InMemoryCatalogItemRepository`, `SupabaseCatalogItemRepository`, ambas `implements CatalogRepositoryPort`. Constructor de `InMemoryCatalogItemRepository` acepta `seed: CatalogItem[]` opcional para tests.

- [ ] **Step 1: Escribir el test que falla**

```typescript
// adapters/persistence/memory/src/catalog-item-repository.test.ts
import { describe, it, expect } from "vitest";
import type { CatalogItem } from "@maitre/subscription";
import { InMemoryCatalogItemRepository } from "./catalog-item-repository.js";

const item: CatalogItem = {
  code: "SEATS",
  name: "Plazas",
  billingType: "QUANTITY",
  billingScope: "BRANCH",
  unitPrice: 500,
  currency: "ARS",
  period: "MONTHLY",
  dependsOn: ["FLOOR"],
  isActive: true,
  version: 1,
};

describe("InMemoryCatalogItemRepository", () => {
  it("lists only active items", async () => {
    const repo = new InMemoryCatalogItemRepository([item, { ...item, code: "OLD", isActive: false }]);
    const active = await repo.listActive();
    expect(active.map((i) => i.code)).toEqual(["SEATS"]);
  });

  it("finds by code", async () => {
    const repo = new InMemoryCatalogItemRepository([item]);
    expect(await repo.findByCode("SEATS")).toEqual(item);
    expect(await repo.findByCode("MISSING")).toBeNull();
  });
});
```

- [ ] **Step 2: Correr el test y verificar que falla**

Run: `cd /home/faguero/dev/maitre/adapters/persistence/memory && npx vitest run src/catalog-item-repository.test.ts`
Expected: FAIL — módulo no encontrado.

- [ ] **Step 3: Implementar InMemory**

```typescript
// adapters/persistence/memory/src/catalog-item-repository.ts
import type { CatalogItem, CatalogRepositoryPort } from "@maitre/subscription";

export class InMemoryCatalogItemRepository implements CatalogRepositoryPort {
  private readonly byCode = new Map<string, CatalogItem>();

  constructor(seed: CatalogItem[] = []) {
    for (const item of seed) this.byCode.set(item.code, item);
  }

  async listActive(): Promise<CatalogItem[]> {
    return [...this.byCode.values()].filter((i) => i.isActive);
  }

  async findByCode(code: string): Promise<CatalogItem | null> {
    return this.byCode.get(code) ?? null;
  }

  async save(item: CatalogItem): Promise<void> {
    this.byCode.set(item.code, item);
  }
}
```

- [ ] **Step 4: Correr el test y verificar que pasa**

Run: `cd /home/faguero/dev/maitre/adapters/persistence/memory && npx vitest run src/catalog-item-repository.test.ts`
Expected: PASS (2 tests)

- [ ] **Step 5: Implementar Supabase (sin test — mismo patrón sin mocks que el resto de repos Supabase del módulo)**

```typescript
// adapters/persistence/supabase/src/catalog-item-repository.ts
import type { SupabaseClient } from "@supabase/supabase-js";
import type { CatalogItem, CatalogRepositoryPort } from "@maitre/subscription";

const TABLE = "subscription_catalog_items";

interface CatalogItemRow {
  code: string;
  name: string;
  billing_type: string;
  billing_scope: string;
  unit_price: number;
  currency: string;
  period: string;
  depends_on: string[];
  is_active: boolean;
  version: number;
}

function fromRow(row: CatalogItemRow): CatalogItem {
  return {
    code: row.code,
    name: row.name,
    billingType: row.billing_type as CatalogItem["billingType"],
    billingScope: row.billing_scope as CatalogItem["billingScope"],
    unitPrice: row.unit_price,
    currency: row.currency,
    period: row.period as CatalogItem["period"],
    dependsOn: row.depends_on,
    isActive: row.is_active,
    version: row.version,
  };
}

export class SupabaseCatalogItemRepository implements CatalogRepositoryPort {
  constructor(private readonly client: SupabaseClient) {}

  async listActive(): Promise<CatalogItem[]> {
    const { data, error } = await this.client.from(TABLE).select("*").eq("is_active", true);
    if (error) throw error;
    return (data as CatalogItemRow[]).map(fromRow);
  }

  async findByCode(code: string): Promise<CatalogItem | null> {
    const { data, error } = await this.client.from(TABLE).select("*").eq("code", code).maybeSingle();
    if (error) throw error;
    return data ? fromRow(data as CatalogItemRow) : null;
  }
}
```

- [ ] **Step 6: Exportar ambas clases**

Agregar en `adapters/persistence/memory/src/index.ts`: `export { InMemoryCatalogItemRepository } from "./catalog-item-repository.js";`

Agregar en `adapters/persistence/supabase/src/index.ts`: `export { SupabaseCatalogItemRepository } from "./catalog-item-repository.js";`

- [ ] **Step 7: Build y commit**

Run: `cd /home/faguero/dev/maitre && npm run build --workspace=@maitre/persistence-memory --workspace=@maitre/persistence-supabase 2>/dev/null || (cd adapters/persistence/memory && npm run build) && (cd adapters/persistence/supabase && npm run build)`

```bash
git add adapters/persistence/memory/src/catalog-item-repository.ts \
        adapters/persistence/memory/src/catalog-item-repository.test.ts \
        adapters/persistence/memory/src/index.ts \
        adapters/persistence/supabase/src/catalog-item-repository.ts \
        adapters/persistence/supabase/src/index.ts
git commit -m "feat(persistence): add InMemory and Supabase catalog item repositories"
```

---

### Task 4: Dominio — subscription-item.ts y subscription_items extendidos con scope

**Files:**
- Modify: `packages/modules/subscription/src/domain/subscription-item.ts`
- Modify: `adapters/persistence/memory/src/subscription-item-repository.ts`
- Modify: `adapters/persistence/supabase/src/subscription-item-repository.ts`
- Modify: `packages/modules/subscription/src/application/ports.ts` (firma de `findByServiceId` gana `scopeRefId`)
- Test: `packages/modules/subscription/src/domain/subscription-item.test.ts` (nuevo)

**Interfaces:**
- Consumes: `CatalogItem`, `requiresScopeRef` (Task 2).
- Produces: `SubscriptionItem` gana `scopeRefId?: string | null`. `SubscriptionItemRepositoryPort.findByServiceId(subscriptionId, serviceId, scopeRefId?)`.

- [ ] **Step 1: Escribir el test que falla**

```typescript
// packages/modules/subscription/src/domain/subscription-item.test.ts
import { describe, it, expect } from "vitest";
import { activateSubscriptionItem, type SubscriptionItem } from "./subscription-item.js";

describe("activateSubscriptionItem", () => {
  it("preserves scopeRefId across activation", () => {
    const item: SubscriptionItem = {
      id: "item-1",
      subscriptionId: "sub-1",
      serviceId: "SEATS",
      scopeRefId: "branch-palermo",
      status: "INACTIVE",
      quantity: 12,
      unitPrice: 500,
      activatedAt: new Date("2026-01-01"),
    };
    const activated = activateSubscriptionItem(item, new Date("2026-02-01"));
    expect(activated.scopeRefId).toBe("branch-palermo");
    expect(activated.status).toBe("ACTIVE");
  });
});
```

- [ ] **Step 2: Correr el test y verificar que falla**

Run: `cd /home/faguero/dev/maitre/packages/modules/subscription && npx vitest run src/domain/subscription-item.test.ts`
Expected: FAIL — TypeScript no reconoce `scopeRefId` en el literal (o el test pasa igual porque TS estructural lo ignora, pero confirma con un `expect(activated.scopeRefId).toBe(...)` que da `undefined`, no `"branch-palermo"`).

- [ ] **Step 3: Extender el tipo**

```typescript
// packages/modules/subscription/src/domain/subscription-item.ts
// reemplazar la interfaz SubscriptionItem existente por:

export interface SubscriptionItem {
  id: string;
  subscriptionId: string;
  serviceId: string;
  scopeRefId?: string | null;
  status: SubscriptionItemStatus;
  quantity: number;
  unitPrice: number;
  activatedAt: Date;
  deactivatedAt?: Date | null;
}
```

(`activateSubscriptionItem`/`deactivateSubscriptionItem` ya usan spread `{ ...item, ... }`, no requieren cambios.)

- [ ] **Step 4: Correr el test y verificar que pasa**

Run: `cd /home/faguero/dev/maitre/packages/modules/subscription && npx vitest run src/domain/subscription-item.test.ts`
Expected: PASS

- [ ] **Step 5: Extender el puerto**

```typescript
// packages/modules/subscription/src/application/ports.ts
// reemplazar la firma existente dentro de SubscriptionItemRepositoryPort:

export interface SubscriptionItemRepositoryPort {
  listBySubscription(subscriptionId: string): Promise<SubscriptionItem[]>;
  findByServiceId(
    subscriptionId: string,
    serviceId: string,
    scopeRefId?: string | null,
  ): Promise<SubscriptionItem | null>;
  save(item: SubscriptionItem): Promise<void>;
}
```

- [ ] **Step 6: Actualizar InMemorySubscriptionItemRepository**

```typescript
// adapters/persistence/memory/src/subscription-item-repository.ts
  async findByServiceId(
    subscriptionId: string,
    serviceId: string,
    scopeRefId: string | null = null,
  ): Promise<SubscriptionItem | null> {
    for (const i of this.byId.values()) {
      if (
        i.subscriptionId === subscriptionId &&
        i.serviceId === serviceId &&
        (i.scopeRefId ?? null) === scopeRefId
      ) {
        return i;
      }
    }
    return null;
  }
```

- [ ] **Step 7: Actualizar SupabaseSubscriptionItemRepository**

```typescript
// adapters/persistence/supabase/src/subscription-item-repository.ts
// agregar scope_ref_id al SubscriptionItemRow, fromRow y toRow:

interface SubscriptionItemRow {
  id: string;
  subscription_id: string;
  service_id: string;
  scope_ref_id: string | null;
  status: string;
  quantity: number;
  unit_price: number;
  activated_at: string;
  deactivated_at: string | null;
}

function fromRow(row: SubscriptionItemRow): SubscriptionItem {
  return {
    id: row.id,
    subscriptionId: row.subscription_id,
    serviceId: row.service_id,
    scopeRefId: row.scope_ref_id,
    status: row.status as SubscriptionItem["status"],
    quantity: row.quantity,
    unitPrice: row.unit_price,
    activatedAt: new Date(row.activated_at),
    deactivatedAt: row.deactivated_at ? new Date(row.deactivated_at) : null,
  };
}

function toRow(item: SubscriptionItem): SubscriptionItemRow {
  return {
    id: item.id,
    subscription_id: item.subscriptionId,
    service_id: item.serviceId,
    scope_ref_id: item.scopeRefId ?? null,
    status: item.status,
    quantity: item.quantity,
    unit_price: item.unitPrice,
    activated_at: item.activatedAt.toISOString(),
    deactivated_at: item.deactivatedAt ? item.deactivatedAt.toISOString() : null,
  };
}

  async findByServiceId(
    subscriptionId: string,
    serviceId: string,
    scopeRefId: string | null = null,
  ): Promise<SubscriptionItem | null> {
    let query = this.client
      .from(TABLE)
      .select("*")
      .eq("subscription_id", subscriptionId)
      .eq("service_id", serviceId);
    query = scopeRefId ? query.eq("scope_ref_id", scopeRefId) : query.is("scope_ref_id", null);
    const { data, error } = await query.maybeSingle();
    if (error) throw error;
    return data ? fromRow(data as SubscriptionItemRow) : null;
  }
```

- [ ] **Step 8: Build, correr toda la suite del paquete, y commit**

Run: `cd /home/faguero/dev/maitre/packages/modules/subscription && npx vitest run`
Expected: PASS (todos los tests existentes siguen pasando; `findByServiceId` gana un tercer parámetro opcional, no rompe llamadas existentes de 2 argumentos).

```bash
git add packages/modules/subscription/src/domain/subscription-item.ts \
        packages/modules/subscription/src/domain/subscription-item.test.ts \
        packages/modules/subscription/src/application/ports.ts \
        adapters/persistence/memory/src/subscription-item-repository.ts \
        adapters/persistence/supabase/src/subscription-item-repository.ts
git commit -m "feat(subscription): add scopeRefId to SubscriptionItem and its repositories"
```

---

### Task 5: Dominio — calculateEntitlements derivado del catálogo, no del plan fijo

**Files:**
- Modify: `packages/modules/subscription/src/domain/calculate-entitlements.ts`
- Modify: `packages/modules/subscription/src/application/recalculate-entitlements.ts`
- Test: `packages/modules/subscription/src/domain/calculate-entitlements.test.ts` (reescribir casos existentes que dependían de `plan-registry`)

**Interfaces:**
- Consumes: `SubscriptionItem[]` (activos), `CatalogItem[]` (Task 2/3).
- Produces: `calculateEntitlements(activeItems: SubscriptionItem[], catalogByCode: Map<string, CatalogItem>, existingEntitlements: Entitlement[], now: Date): CalculatedEntitlement[]` — nueva firma, reemplaza la basada en `planCode`.

- [ ] **Step 1: Escribir el test que falla**

```typescript
// packages/modules/subscription/src/domain/calculate-entitlements.test.ts
import { describe, it, expect } from "vitest";
import { calculateEntitlements } from "./calculate-entitlements.js";
import type { SubscriptionItem } from "./subscription-item.js";
import type { CatalogItem } from "./catalog-item.js";

const seats: CatalogItem = {
  code: "SEATS",
  name: "Plazas",
  billingType: "QUANTITY",
  billingScope: "BRANCH",
  unitPrice: 500,
  currency: "ARS",
  period: "MONTHLY",
  dependsOn: ["FLOOR"],
  isActive: true,
  version: 1,
};

const seatsItem: SubscriptionItem = {
  id: "item-1",
  subscriptionId: "sub-1",
  serviceId: "SEATS",
  scopeRefId: "branch-palermo",
  status: "ACTIVE",
  quantity: 12,
  unitPrice: 500,
  activatedAt: new Date("2026-01-01"),
};

describe("calculateEntitlements", () => {
  it("derives a resource limit from an active QUANTITY item's quantity", () => {
    const result = calculateEntitlements(
      [seatsItem],
      new Map([["SEATS", seats]]),
      [],
      new Date("2026-02-01"),
    );
    expect(result).toContainEqual({ resource: "SEATS[branch-palermo]", hardLimit: 12 });
  });

  it("ignores INACTIVE items", () => {
    const result = calculateEntitlements(
      [{ ...seatsItem, status: "INACTIVE" }],
      new Map([["SEATS", seats]]),
      [],
      new Date("2026-02-01"),
    );
    expect(result).toEqual([]);
  });
});
```

- [ ] **Step 2: Correr el test y verificar que falla**

Run: `cd /home/faguero/dev/maitre/packages/modules/subscription && npx vitest run src/domain/calculate-entitlements.test.ts`
Expected: FAIL — la firma actual no acepta estos argumentos.

- [ ] **Step 3: Reescribir la función**

```typescript
// packages/modules/subscription/src/domain/calculate-entitlements.ts
import type { Entitlement } from "./entitlement.js";
import type { SubscriptionItem } from "./subscription-item.js";
import type { CatalogItem } from "./catalog-item.js";
import { isOverrideActive } from "./entitlement.js";

export interface CalculatedEntitlement {
  resource: string;
  hardLimit: number;
  softLimit?: number;
}

// Reemplaza el cálculo basado en PLAN_REGISTRY (plan.limits + overrides fijos
// por servicio) por uno derivado directamente de los subscription_items
// contratados: SERVICE aporta capacidad booleana (no genera límite numérico
// propio, ya se refleja como entitlement ACCESS separado si hace falta más
// adelante), QUANTITY aporta un límite igual a la cantidad contratada, con
// clave "<CODE>[<scopeRefId>]" para no pisar el mismo recurso entre
// sucursales distintas.
export function calculateEntitlements(
  activeItems: SubscriptionItem[],
  catalogByCode: Map<string, CatalogItem>,
  existingEntitlements: Entitlement[],
  now: Date,
): CalculatedEntitlement[] {
  const overrideByResource = new Map(
    existingEntitlements
      .filter((e) => isOverrideActive(e, now))
      .map((e) => [e.resource, e] as const),
  );
  const softLimitByResource = new Map(
    existingEntitlements
      .filter((e) => e.softLimit != null)
      .map((e) => [e.resource, e.softLimit!] as const),
  );

  const result: CalculatedEntitlement[] = [];
  for (const item of activeItems) {
    if (item.status !== "ACTIVE") continue;
    const catalogItem = catalogByCode.get(item.serviceId);
    if (!catalogItem || catalogItem.billingType !== "QUANTITY") continue;

    const resource = item.scopeRefId ? `${item.serviceId}[${item.scopeRefId}]` : item.serviceId;
    const override = overrideByResource.get(resource);
    const hardLimit = override ? override.hardLimit : item.quantity;
    const softLimit = softLimitByResource.get(resource);
    result.push({ resource, hardLimit, ...(softLimit != null ? { softLimit } : {}) });
  }
  return result;
}
```

- [ ] **Step 4: Correr el test y verificar que pasa**

Run: `cd /home/faguero/dev/maitre/packages/modules/subscription && npx vitest run src/domain/calculate-entitlements.test.ts`
Expected: PASS (2 tests)

- [ ] **Step 5: Actualizar el caller `recalculate-entitlements.ts`**

Leer `packages/modules/subscription/src/application/recalculate-entitlements.ts` primero (no incluido acá porque no se leyó su contenido completo en la investigación previa) y adaptar la llamada a `calculateEntitlements` a la nueva firma: en vez de pasar `subscription.planCode` y una lista de `serviceId`s activos, pasar `await deps.subscriptionItems.listBySubscription(subscriptionId)` filtrados por `status === "ACTIVE"` y un `Map` construido desde `await deps.catalog.listActive()`. Esto requiere agregar `catalog: CatalogRepositoryPort` a `RecalculateEntitlementsDeps` y a todos los callers (`add-service.ts`, `remove-service.ts`, `upgrade-plan.ts` si sigue existiendo, `add-quantity-item.ts` de Task 7).

- [ ] **Step 6: Correr toda la suite del paquete**

Run: `cd /home/faguero/dev/maitre/packages/modules/subscription && npx vitest run`
Expected: PASS. Si `upgrade-plan.ts` depende de `resolvePlan`/`plan-registry.ts` de forma central, dejarlo funcionando en modo compatibilidad (resuelve el `planCode` solo para mostrar nombre de plan comercial, ya no para límites) — no se elimina `plan-registry.ts` en este plan, se lo deja de usar para límites pero puede seguir existiendo para el campo informativo `planCode` de la Subscription.

- [ ] **Step 7: Commit**

```bash
git add packages/modules/subscription/src/domain/calculate-entitlements.ts \
        packages/modules/subscription/src/domain/calculate-entitlements.test.ts \
        packages/modules/subscription/src/application/recalculate-entitlements.ts
git commit -m "feat(subscription): derive entitlements from catalog-driven subscription items"
```

---


### Task 6: Casos de uso — addQuantityItem y updateQuantity

**Files:**
- Create: `packages/modules/subscription/src/application/add-quantity-item.ts`
- Create: `packages/modules/subscription/src/application/update-quantity.ts`
- Modify: `packages/modules/subscription/src/index.ts` (exports)
- Test: `packages/modules/subscription/src/application/add-quantity-item.test.ts`

**Interfaces:**
- Consumes: `SubscriptionRepositoryPort`, `SubscriptionItemRepositoryPort`, `CatalogRepositoryPort`, `OutboxPort`, `RecalculateEntitlementsDeps` (existentes/Task 2/3/5).
- Produces: `addQuantityItem(deps, { subscriptionId, catalogItemCode, quantity, scopeRefId? }): Promise<SubscriptionItem>`; `updateQuantity(deps, { subscriptionId, itemId, quantity }): Promise<SubscriptionItem>`; `CatalogItemNotFoundError`, `InvalidQuantityForServiceError`, `MissingScopeRefError`.

- [ ] **Step 1: Escribir el test que falla, con fakes locales (sin importar adapters concretos desde el paquete de dominio)**

```typescript
// packages/modules/subscription/src/application/add-quantity-item.test.ts
import { describe, it, expect } from "vitest";
import { addQuantityItem, MissingScopeRefError, InvalidQuantityForServiceError } from "./add-quantity-item.js";
import type { CatalogItem } from "../domain/catalog-item.js";
import type { SubscriptionItem } from "../domain/subscription-item.js";
import type { Subscription } from "../domain/subscription.js";

function makeFakes() {
  const items = new Map<string, SubscriptionItem>();
  const subscription: Subscription = {
    id: "sub-1",
    tenantId: "tenant-1",
    planCode: "PROFESSIONAL",
    status: "ACTIVE",
  } as Subscription;

  const seats: CatalogItem = {
    code: "SEATS",
    name: "Plazas",
    billingType: "QUANTITY",
    billingScope: "BRANCH",
    unitPrice: 500,
    currency: "ARS",
    period: "MONTHLY",
    dependsOn: [],
    isActive: true,
    version: 1,
  };

  return {
    subscriptions: {
      findById: async (id: string) => (id === subscription.id ? subscription : null),
      findByTenantId: async () => subscription,
      save: async () => {},
    },
    subscriptionItems: {
      listBySubscription: async () => [...items.values()],
      findByServiceId: async (_subId: string, serviceId: string, scopeRefId: string | null = null) =>
        [...items.values()].find(
          (i) => i.serviceId === serviceId && (i.scopeRefId ?? null) === scopeRefId,
        ) ?? null,
      save: async (item: SubscriptionItem) => {
        items.set(item.id, item);
      },
    },
    catalog: {
      listActive: async () => [seats],
      findByCode: async (code: string) => (code === "SEATS" ? seats : null),
    },
    entitlements: { listBySubscription: async () => [], save: async () => {} },
    outbox: { append: async () => {} },
    now: () => new Date("2026-02-01"),
  };
}

describe("addQuantityItem", () => {
  it("creates a QUANTITY item scoped to a branch", async () => {
    const deps = makeFakes();
    const item = await addQuantityItem(deps, {
      subscriptionId: "sub-1",
      catalogItemCode: "SEATS",
      quantity: 12,
      scopeRefId: "branch-palermo",
    });
    expect(item.quantity).toBe(12);
    expect(item.scopeRefId).toBe("branch-palermo");
    expect(item.unitPrice).toBe(500);
  });

  it("rejects a QUANTITY catalog item without scopeRefId when scope is not TENANT", async () => {
    const deps = makeFakes();
    await expect(
      addQuantityItem(deps, { subscriptionId: "sub-1", catalogItemCode: "SEATS", quantity: 12 }),
    ).rejects.toThrow(MissingScopeRefError);
  });

  it("rejects a missing quantity for a QUANTITY catalog item", async () => {
    const deps = makeFakes();
    await expect(
      addQuantityItem(deps, {
        subscriptionId: "sub-1",
        catalogItemCode: "SEATS",
        scopeRefId: "branch-palermo",
      } as never),
    ).rejects.toThrow(InvalidQuantityForServiceError);
  });
});
```

- [ ] **Step 2: Correr el test y verificar que falla**

Run: `cd /home/faguero/dev/maitre/packages/modules/subscription && npx vitest run src/application/add-quantity-item.test.ts`
Expected: FAIL — módulo no encontrado.

- [ ] **Step 3: Implementar addQuantityItem**

```typescript
// packages/modules/subscription/src/application/add-quantity-item.ts
import { randomUUID } from "node:crypto";
import { activateSubscriptionItem, type SubscriptionItem } from "../domain/subscription-item.js";
import { requiresScopeRef } from "../domain/catalog-item.js";
import { isSubscriptionOperable } from "../domain/subscription.js";
import type { SubscriptionRepositoryPort, SubscriptionItemRepositoryPort, CatalogRepositoryPort } from "./ports.js";
import type { OutboxPort } from "./outbox.js";
import { serviceActivatedEvent } from "./events.js";
import { recalculateEntitlements, type RecalculateEntitlementsDeps } from "./recalculate-entitlements.js";
import { SubscriptionNotOperableError } from "./add-service.js";

export class CatalogItemNotFoundError extends Error {
  constructor(code: string) {
    super(`Catalog item "${code}" not found or inactive`);
    this.name = "CatalogItemNotFoundError";
  }
}

export class MissingScopeRefError extends Error {
  constructor(code: string) {
    super(`Catalog item "${code}" requires a scopeRefId`);
    this.name = "MissingScopeRefError";
  }
}

export class InvalidQuantityForServiceError extends Error {
  constructor(code: string) {
    super(`Catalog item "${code}" requires a positive quantity`);
    this.name = "InvalidQuantityForServiceError";
  }
}

export interface AddQuantityItemInput {
  subscriptionId: string;
  catalogItemCode: string;
  quantity: number;
  scopeRefId?: string;
  correlationId?: string;
}

export interface AddQuantityItemDeps extends RecalculateEntitlementsDeps {
  subscriptions: SubscriptionRepositoryPort;
  subscriptionItems: SubscriptionItemRepositoryPort;
  catalog: CatalogRepositoryPort;
  outbox: OutboxPort;
}

export async function addQuantityItem(
  deps: AddQuantityItemDeps,
  input: AddQuantityItemInput,
): Promise<SubscriptionItem> {
  const subscription = await deps.subscriptions.findById(input.subscriptionId);
  if (!subscription || !isSubscriptionOperable(subscription)) {
    throw new SubscriptionNotOperableError(input.subscriptionId);
  }

  const catalogItem = await deps.catalog.findByCode(input.catalogItemCode);
  if (!catalogItem || !catalogItem.isActive) {
    throw new CatalogItemNotFoundError(input.catalogItemCode);
  }
  if (requiresScopeRef(catalogItem) && !input.scopeRefId) {
    throw new MissingScopeRefError(input.catalogItemCode);
  }
  if (!Number.isFinite(input.quantity) || input.quantity <= 0) {
    throw new InvalidQuantityForServiceError(input.catalogItemCode);
  }

  const now = (deps.now ?? (() => new Date()))();
  const scopeRefId = input.scopeRefId ?? null;
  const existing = await deps.subscriptionItems.findByServiceId(
    input.subscriptionId,
    input.catalogItemCode,
    scopeRefId,
  );

  const item: SubscriptionItem = existing
    ? activateSubscriptionItem({ ...existing, quantity: input.quantity }, now)
    : {
        id: randomUUID(),
        subscriptionId: input.subscriptionId,
        serviceId: input.catalogItemCode,
        scopeRefId,
        status: "ACTIVE",
        quantity: input.quantity,
        unitPrice: catalogItem.unitPrice,
        activatedAt: now,
      };

  await deps.subscriptionItems.save(item);
  await deps.outbox.append(
    serviceActivatedEvent(item, subscription.tenantId, input.correlationId ?? randomUUID()),
  );
  await recalculateEntitlements(deps, subscription.id, subscription.planCode);

  return item;
}
```

- [ ] **Step 4: Correr el test y verificar que pasa**

Run: `cd /home/faguero/dev/maitre/packages/modules/subscription && npx vitest run src/application/add-quantity-item.test.ts`
Expected: PASS (3 tests). Si `SubscriptionNotOperableError` no está exportado desde `add-service.ts`, exportarlo ahí (ya existe en ese archivo según Task 5's contexto) en vez de duplicarlo.

- [ ] **Step 5: Implementar updateQuantity**

```typescript
// packages/modules/subscription/src/application/update-quantity.ts
import { type SubscriptionItem } from "../domain/subscription-item.js";
import { isSubscriptionOperable } from "../domain/subscription.js";
import type { SubscriptionRepositoryPort, SubscriptionItemRepositoryPort } from "./ports.js";
import { recalculateEntitlements, type RecalculateEntitlementsDeps } from "./recalculate-entitlements.js";
import { SubscriptionNotOperableError } from "./add-service.js";
import { InvalidQuantityForServiceError } from "./add-quantity-item.js";

export class SubscriptionItemNotFoundError extends Error {
  constructor(itemId: string) {
    super(`Subscription item "${itemId}" not found`);
    this.name = "SubscriptionItemNotFoundError";
  }
}

export interface UpdateQuantityInput {
  subscriptionId: string;
  itemId: string;
  quantity: number;
}

export interface UpdateQuantityDeps extends RecalculateEntitlementsDeps {
  subscriptions: SubscriptionRepositoryPort;
  subscriptionItems: SubscriptionItemRepositoryPort;
}

export async function updateQuantity(
  deps: UpdateQuantityDeps,
  input: UpdateQuantityInput,
): Promise<SubscriptionItem> {
  const subscription = await deps.subscriptions.findById(input.subscriptionId);
  if (!subscription || !isSubscriptionOperable(subscription)) {
    throw new SubscriptionNotOperableError(input.subscriptionId);
  }
  if (!Number.isFinite(input.quantity) || input.quantity <= 0) {
    throw new InvalidQuantityForServiceError(input.itemId);
  }

  const existing = (await deps.subscriptionItems.listBySubscription(input.subscriptionId)).find(
    (i) => i.id === input.itemId,
  );
  if (!existing) throw new SubscriptionItemNotFoundError(input.itemId);

  const updated: SubscriptionItem = { ...existing, quantity: input.quantity };
  await deps.subscriptionItems.save(updated);
  await recalculateEntitlements(deps, subscription.id, subscription.planCode);

  return updated;
}
```

- [ ] **Step 6: Exportar desde el índice del paquete**

```typescript
// packages/modules/subscription/src/index.ts — agregar:
export { addQuantityItem, CatalogItemNotFoundError, MissingScopeRefError, InvalidQuantityForServiceError } from "./application/add-quantity-item.js";
export { updateQuantity, SubscriptionItemNotFoundError } from "./application/update-quantity.js";
```

- [ ] **Step 7: Correr toda la suite del paquete y commit**

Run: `cd /home/faguero/dev/maitre/packages/modules/subscription && npx vitest run`
Expected: PASS

```bash
git add packages/modules/subscription/src/application/add-quantity-item.ts \
        packages/modules/subscription/src/application/add-quantity-item.test.ts \
        packages/modules/subscription/src/application/update-quantity.ts \
        packages/modules/subscription/src/index.ts
git commit -m "feat(subscription): add addQuantityItem and updateQuantity use cases"
```

---

### Task 7: API — catálogo y endpoints de ítems granulares

**Files:**
- Modify: `apps/api/src/routes/subscriptions.ts`
- Modify: `apps/api/src/composition/container.ts` (agregar `catalog: CatalogRepositoryPort` al `Container` y ambos wirings, in-memory y Supabase)
- Test: `apps/api/src/test/subscriptions-api.test.ts` (agregar casos nuevos al archivo existente)

**Interfaces:**
- Consumes: `addQuantityItem`, `updateQuantity`, `CatalogRepositoryPort` (Task 3/6), `Container` existente.
- Produces: `GET /v1/subscription-catalog`, `POST /v1/subscriptions/:tenantId/items`, `PATCH /v1/subscriptions/:tenantId/items/:itemId`, `DELETE /v1/subscriptions/:tenantId/items/:itemId`.

- [ ] **Step 1: Wiring del Container**

En `apps/api/src/composition/container.ts`:
- Importar `InMemoryCatalogItemRepository` de `@maitre/persistence-memory` (o el path relativo que use el resto de imports memory) y `SupabaseCatalogItemRepository` de `@maitre/persistence-supabase`.
- Agregar `catalog: CatalogRepositoryPort;` a la interfaz `Container` (junto a `subscriptionItems`, línea ~238 y ~350).
- Wiring Supabase (~línea 434): `catalog: new SupabaseCatalogItemRepository(client),`
- Wiring in-memory (~línea 493): `catalog: new InMemoryCatalogItemRepository(SEED_CATALOG_ITEMS),` — `SEED_CATALOG_ITEMS` se define en Task 8.

- [ ] **Step 2: Escribir el test que falla para GET /v1/subscription-catalog**

Agregar en `apps/api/src/test/subscriptions-api.test.ts` (seguir el patrón de setup ya usado en ese archivo para `buildApp`/tokens):

```typescript
it("GET /v1/subscription-catalog returns active catalog items", async () => {
  const response = await app.inject({
    method: "GET",
    url: "/v1/subscription-catalog",
    headers: { authorization: `Bearer ${accessToken}`, "x-tenant-id": tenantId },
  });
  expect(response.statusCode).toBe(200);
  const body = response.json();
  expect(Array.isArray(body.data)).toBe(true);
  expect(body.data.some((item: { code: string }) => item.code === "SEATS")).toBe(true);
});

it("POST /v1/subscriptions/:tenantId/items adds a QUANTITY item scoped to a branch", async () => {
  const response = await app.inject({
    method: "POST",
    url: `/v1/subscriptions/${tenantId}/items`,
    headers: { authorization: `Bearer ${accessToken}`, "x-tenant-id": tenantId },
    payload: { catalogItemCode: "SEATS", quantity: 12, scopeRefId: branchId },
  });
  expect(response.statusCode).toBe(201);
  expect(response.json().data.quantity).toBe(12);
});
```

- [ ] **Step 3: Correr el test y verificar que falla**

Run: `cd /home/faguero/dev/maitre/apps/api && npx vitest run src/test/subscriptions-api.test.ts`
Expected: FAIL — 404 en rutas inexistentes.

- [ ] **Step 4: Implementar las rutas**

Agregar en `apps/api/src/routes/subscriptions.ts`, después de los imports existentes:

```typescript
import { addQuantityItem, updateQuantity, CatalogItemNotFoundError, MissingScopeRefError, InvalidQuantityForServiceError, SubscriptionItemNotFoundError } from "@maitre/subscription";

const addItemBodySchema = z.object({
  catalogItemCode: z.string().min(1),
  quantity: z.number().int().positive().optional(),
  scopeRefId: z.string().optional(),
});

const updateItemBodySchema = z.object({
  quantity: z.number().int().positive(),
});
```

Y, dentro de `registerSubscriptionRoutes`, antes del cierre de la función:

```typescript
  app.get("/v1/subscription-catalog", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      await requireTenantContext(container, req);
      const items = await container.catalog.listActive();
      return { data: items };
    } catch (err) {
      return sendProblem(reply, correlationId, err);
    }
  });

  app.post<{ Params: { tenantId: string } }>(
    "/v1/subscriptions/:tenantId/items",
    async (req, reply) => {
      const correlationId = randomUUID();
      try {
        const ctx = await requireTenantContext(container, req);
        requirePermission(ctx, "service:manage");
        if (ctx.tenantId !== req.params.tenantId) {
          return sendProblem(reply, correlationId, notFound("Subscription"));
        }
        const body = addItemBodySchema.parse(req.body);
        const subscription = await container.subscriptions.findByTenantId(req.params.tenantId);
        if (!subscription) return sendProblem(reply, correlationId, notFound("Subscription"));

        const item = await addQuantityItem(
          {
            subscriptions: container.subscriptions,
            subscriptionItems: container.subscriptionItems,
            catalog: container.catalog,
            entitlements: container.entitlements,
            outbox: container.outbox,
          },
          {
            subscriptionId: subscription.id,
            catalogItemCode: body.catalogItemCode,
            quantity: body.quantity ?? 1,
            ...(body.scopeRefId ? { scopeRefId: body.scopeRefId } : {}),
            correlationId,
          },
        );
        reply.code(201);
        return { data: item };
      } catch (err) {
        if (
          err instanceof CatalogItemNotFoundError ||
          err instanceof MissingScopeRefError ||
          err instanceof InvalidQuantityForServiceError ||
          err instanceof z.ZodError
        ) {
          return sendProblem(reply, correlationId, badRequest(err.message));
        }
        return sendProblem(reply, correlationId, err);
      }
    },
  );

  app.patch<{ Params: { tenantId: string; itemId: string } }>(
    "/v1/subscriptions/:tenantId/items/:itemId",
    async (req, reply) => {
      const correlationId = randomUUID();
      try {
        const ctx = await requireTenantContext(container, req);
        requirePermission(ctx, "service:manage");
        if (ctx.tenantId !== req.params.tenantId) {
          return sendProblem(reply, correlationId, notFound("Subscription"));
        }
        const body = updateItemBodySchema.parse(req.body);
        const subscription = await container.subscriptions.findByTenantId(req.params.tenantId);
        if (!subscription) return sendProblem(reply, correlationId, notFound("Subscription"));

        const item = await updateQuantity(
          {
            subscriptions: container.subscriptions,
            subscriptionItems: container.subscriptionItems,
            entitlements: container.entitlements,
          },
          { subscriptionId: subscription.id, itemId: req.params.itemId, quantity: body.quantity },
        );
        return { data: item };
      } catch (err) {
        if (err instanceof SubscriptionItemNotFoundError) {
          return sendProblem(reply, correlationId, notFound("SubscriptionItem"));
        }
        if (err instanceof InvalidQuantityForServiceError || err instanceof z.ZodError) {
          return sendProblem(reply, correlationId, badRequest(err.message));
        }
        return sendProblem(reply, correlationId, err);
      }
    },
  );

  app.delete<{ Params: { tenantId: string; itemId: string } }>(
    "/v1/subscriptions/:tenantId/items/:itemId",
    async (req, reply) => {
      const correlationId = randomUUID();
      try {
        const ctx = await requireTenantContext(container, req);
        requirePermission(ctx, "service:manage");
        if (ctx.tenantId !== req.params.tenantId) {
          return sendProblem(reply, correlationId, notFound("Subscription"));
        }
        const subscription = await container.subscriptions.findByTenantId(req.params.tenantId);
        if (!subscription) return sendProblem(reply, correlationId, notFound("Subscription"));

        const items = await container.subscriptionItems.listBySubscription(subscription.id);
        const target = items.find((i) => i.id === req.params.itemId);
        if (!target) return sendProblem(reply, correlationId, notFound("SubscriptionItem"));

        const item = await removeService(
          {
            subscriptions: container.subscriptions,
            subscriptionItems: container.subscriptionItems,
            entitlements: container.entitlements,
            outbox: container.outbox,
          },
          { subscriptionId: subscription.id, serviceId: target.serviceId, correlationId },
        );
        return { data: item };
      } catch (err) {
        if (err instanceof ServiceNotFoundError) {
          return sendProblem(reply, correlationId, notFound("SubscriptionItem"));
        }
        return sendProblem(reply, correlationId, err);
      }
    },
  );
```

- [ ] **Step 5: Correr el test y verificar que pasa**

Run: `cd /home/faguero/dev/maitre/apps/api && npx vitest run src/test/subscriptions-api.test.ts`
Expected: PASS

- [ ] **Step 6: Correr toda la suite de apps/api para descartar regresiones**

Run: `cd /home/faguero/dev/maitre/apps/api && npx vitest run`
Expected: mismos 22 fallos preexistentes documentados (workforce/fiscal/reservation/availability), cero fallos nuevos.

- [ ] **Step 7: Commit**

```bash
git add apps/api/src/routes/subscriptions.ts apps/api/src/composition/container.ts apps/api/src/test/subscriptions-api.test.ts
git commit -m "feat(api): expose subscription catalog and granular item endpoints"
```

---

### Task 8: Seed — catálogo completo + ítems demo granulares

**Files:**
- Modify: `apps/api/src/composition/container.ts`

**Interfaces:**
- Consumes: `CatalogItem`, `addQuantityItem`, `addService` (Task 2/6, existente).
- Produces: constante `SEED_CATALOG_ITEMS: CatalogItem[]` (usada por Task 7 Step 1) y seed de `subscription_items` demo reemplazando el `planCode` fijo.

- [ ] **Step 1: Definir el catálogo seed**

Agregar cerca de las constantes `DEMO_*` existentes en `container.ts`:

```typescript
const SEED_CATALOG_ITEMS: CatalogItem[] = [
  { code: "CORE", name: "Maitre Core", billingType: "SERVICE", billingScope: "TENANT", unitPrice: 15000, currency: "ARS", period: "MONTHLY", dependsOn: [], isActive: true, version: 1 },
  { code: "BRANCHES", name: "Maitre Branches", billingType: "QUANTITY", billingScope: "TENANT", unitPrice: 8000, currency: "ARS", period: "MONTHLY", dependsOn: ["CORE"], isActive: true, version: 1 },
  { code: "FLOOR", name: "Maitre Floor", billingType: "SERVICE", billingScope: "BRANCH", unitPrice: 6000, currency: "ARS", period: "MONTHLY", dependsOn: ["CORE", "BRANCHES"], isActive: true, version: 1 },
  { code: "SEATS", name: "Plazas", billingType: "QUANTITY", billingScope: "BRANCH", unitPrice: 500, currency: "ARS", period: "MONTHLY", dependsOn: ["FLOOR"], isActive: true, version: 1 },
  { code: "RESERVATIONS", name: "Maitre Reservations", billingType: "SERVICE", billingScope: "BRANCH", unitPrice: 4000, currency: "ARS", period: "MONTHLY", dependsOn: ["CORE", "BRANCHES"], isActive: true, version: 1 },
  { code: "SHIFTS", name: "Maitre Shifts", billingType: "SERVICE", billingScope: "BRANCH", unitPrice: 3000, currency: "ARS", period: "MONTHLY", dependsOn: ["CORE", "BRANCHES"], isActive: true, version: 1 },
  { code: "SHIFT_SLOTS", name: "Turnos", billingType: "QUANTITY", billingScope: "BRANCH", unitPrice: 300, currency: "ARS", period: "MONTHLY", dependsOn: ["SHIFTS"], isActive: true, version: 1 },
  { code: "WAITERS", name: "Mozos", billingType: "QUANTITY", billingScope: "BRANCH", unitPrice: 1200, currency: "ARS", period: "MONTHLY", dependsOn: ["SHIFTS"], isActive: true, version: 1 },
  { code: "CASHIERS", name: "Cajeros", billingType: "QUANTITY", billingScope: "BRANCH", unitPrice: 1500, currency: "ARS", period: "MONTHLY", dependsOn: ["SHIFTS"], isActive: true, version: 1 },
  { code: "CASH", name: "Maitre Cash", billingType: "SERVICE", billingScope: "BRANCH", unitPrice: 3500, currency: "ARS", period: "MONTHLY", dependsOn: ["CORE"], isActive: true, version: 1 },
  { code: "BILLING", name: "Maitre Billing", billingType: "SERVICE", billingScope: "FISCAL_ENTITY", unitPrice: 5000, currency: "ARS", period: "MONTHLY", dependsOn: ["CORE"], isActive: true, version: 1 },
  { code: "ARCA", name: "Maitre ARCA", billingType: "SERVICE", billingScope: "FISCAL_ENTITY", unitPrice: 7000, currency: "ARS", period: "MONTHLY", dependsOn: ["BILLING"], isActive: true, version: 1 },
  { code: "PAYMENTS", name: "Maitre Payments", billingType: "SERVICE", billingScope: "TENANT", unitPrice: 4000, currency: "ARS", period: "MONTHLY", dependsOn: ["CASH"], isActive: true, version: 1 },
  { code: "PAYLANDING", name: "Maitre PayLanding", billingType: "SERVICE", billingScope: "TENANT", unitPrice: 3000, currency: "ARS", period: "MONTHLY", dependsOn: ["PAYMENTS"], isActive: true, version: 1 },
  { code: "PAYLANDING.MERCADOPAGO", name: "PayLanding — Mercado Pago", billingType: "SERVICE", billingScope: "CONNECTOR", unitPrice: 0, currency: "ARS", period: "MONTHLY", dependsOn: ["PAYLANDING"], isActive: true, version: 1 },
  { code: "PAYLANDING.NARANJA_X", name: "PayLanding — Naranja X", billingType: "SERVICE", billingScope: "CONNECTOR", unitPrice: 0, currency: "ARS", period: "MONTHLY", dependsOn: ["PAYLANDING"], isActive: true, version: 1 },
  { code: "PAYLANDING.MODO", name: "PayLanding — MODO", billingType: "SERVICE", billingScope: "CONNECTOR", unitPrice: 0, currency: "ARS", period: "MONTHLY", dependsOn: ["PAYLANDING"], isActive: true, version: 1 },
  { code: "PAYLANDING.TODO_PAGO", name: "PayLanding — Todo Pago", billingType: "SERVICE", billingScope: "CONNECTOR", unitPrice: 0, currency: "ARS", period: "MONTHLY", dependsOn: ["PAYLANDING"], isActive: true, version: 1 },
];
```

(Lista acotada a lo cubierto por el ejemplo de `03-service-catalog.md` y lo pedido en esta migración; el resto de códigos del catálogo documental — `KITCHEN`, `QR_MENU`, `IVA`, `FEEDBACK`, `REPUTATION`, `CRM`, `LOYALTY`, `AI_*` — se agregan con el mismo patrón en un seguimiento menor, no bloquean este plan.)

- [ ] **Step 2: Reemplazar el seed de suscripción fijo**

Ubicar el bloque actual (`container.ts` ~línea 680-690):

```typescript
  const subscription = await repos.subscriptions.findById(DEMO_SUBSCRIPTION_ID);
  if (!subscription) {
    await createSubscription(
      {
        subscriptions: repos.subscriptions,
        subscriptionItems: repos.subscriptionItems,
        entitlements: repos.entitlements,
        now: () => now,
      },
      { id: DEMO_SUBSCRIPTION_ID, tenantId: tenant.id, planCode: "PROFESSIONAL" },
    );
  }
```

Reemplazarlo por:

```typescript
  const subscription = await repos.subscriptions.findById(DEMO_SUBSCRIPTION_ID);
  if (!subscription) {
    await createSubscription(
      {
        subscriptions: repos.subscriptions,
        subscriptionItems: repos.subscriptionItems,
        entitlements: repos.entitlements,
        now: () => now,
      },
      { id: DEMO_SUBSCRIPTION_ID, tenantId: tenant.id, planCode: "PROFESSIONAL" },
    );

    const quantityDeps = {
      subscriptions: repos.subscriptions,
      subscriptionItems: repos.subscriptionItems,
      catalog: repos.catalog,
      entitlements: repos.entitlements,
      outbox: repos.outbox,
      now: () => now,
    };
    await addService(quantityDeps, { subscriptionId: DEMO_SUBSCRIPTION_ID, serviceId: "CORE", correlationId: randomUUID() });
    await addQuantityItem(quantityDeps, { subscriptionId: DEMO_SUBSCRIPTION_ID, catalogItemCode: "BRANCHES", quantity: 2, correlationId: randomUUID() });
    await addService(quantityDeps, { subscriptionId: DEMO_SUBSCRIPTION_ID, serviceId: "FLOOR", scopeRefId: DEMO_BRANCH_ID, correlationId: randomUUID() });
    await addQuantityItem(quantityDeps, { subscriptionId: DEMO_SUBSCRIPTION_ID, catalogItemCode: "SEATS", quantity: 12, scopeRefId: DEMO_BRANCH_ID, correlationId: randomUUID() });
    await addQuantityItem(quantityDeps, { subscriptionId: DEMO_SUBSCRIPTION_ID, catalogItemCode: "WAITERS", quantity: 8, scopeRefId: DEMO_BRANCH_ID, correlationId: randomUUID() });
    await addQuantityItem(quantityDeps, { subscriptionId: DEMO_SUBSCRIPTION_ID, catalogItemCode: "CASHIERS", quantity: 3, scopeRefId: DEMO_BRANCH_ID, correlationId: randomUUID() });
    await addService(quantityDeps, { subscriptionId: DEMO_SUBSCRIPTION_ID, serviceId: "RESERVATIONS", scopeRefId: DEMO_BRANCH_ID, correlationId: randomUUID() });
  }
```

`addService` y `addQuantityItem` ya deben estar importados o se agregan al import existente de `@maitre/subscription` en la cabecera de `container.ts`. `randomUUID` ya está importado en ese archivo (se usa para otros ids seed).

- [ ] **Step 3: Levantar la API local y verificar el seed manualmente**

Run: `cd /home/faguero/dev/maitre && npm run dev --workspace=apps/api &` (o el script real de arranque local, ej. `npm run dev:api`)
Luego: `curl -s -H "Authorization: Bearer demo-token" -H "x-tenant-id: 00000000-0000-0000-0000-000000000001" http://localhost:PORT/v1/entitlements/00000000-0000-0000-0000-000000000001 | jq`
Expected: `entitlements` incluye `SEATS[00000000-0000-0000-0000-000000000003]` con `hardLimit: 12`, `WAITERS[...]` con `8`, `CASHIERS[...]` con `3`.

- [ ] **Step 4: Commit**

```bash
git add apps/api/src/composition/container.ts
git commit -m "feat(api): seed granular subscription catalog and demo items"
```

---

### Task 9: Frontend — sección "Catálogo de servicios" en subscription-page.tsx

**Files:**
- Modify: `apps/web/src/features/subscription/subscription-page.tsx`
- Test: `apps/web/src/features/subscription/subscription-page.test.tsx` (crear si no existe un test de esta página; seguir el patrón de testing-library ya usado en otras features de `apps/web`)

**Interfaces:**
- Consumes: `GET /v1/subscription-catalog`, `POST/PATCH/DELETE /v1/subscriptions/:tenantId/items` (Task 7).
- Produces: componente `ServiceCatalogSection` dentro del mismo archivo (no se parte en otro módulo — el archivo tiene 325 líneas, dentro del rango que ya maneja el codebase para features de esta escala).

- [ ] **Step 1: Escribir el test que falla**

```typescript
// apps/web/src/features/subscription/subscription-page.test.tsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SubscriptionPage } from "./subscription-page.js";
import * as apiClient from "../../lib/api-client.js";

vi.mock("../../app/auth-context.js", () => ({
  useAuth: () => ({ accessToken: "demo-token" }),
}));
vi.mock("../../app/tenant-context.js", () => ({
  useTenantContext: () => ({ selectedTenantId: "tenant-1" }),
}));

function renderPage() {
  const client = new QueryClient();
  return render(
    <QueryClientProvider client={client}>
      <SubscriptionPage />
    </QueryClientProvider>,
  );
}

describe("SubscriptionPage service catalog", () => {
  beforeEach(() => {
    vi.spyOn(apiClient, "apiRequest").mockImplementation((url: string) => {
      if (url.includes("/v1/subscriptions/")) {
        return Promise.resolve({ data: { planCode: "PROFESSIONAL", status: "ACTIVE", currentPeriodEnd: "2026-03-01" } });
      }
      if (url.includes("/v1/entitlements/")) {
        return Promise.resolve({ data: { entitlements: [], quotas: [] } });
      }
      if (url.includes("/v1/subscription-catalog")) {
        return Promise.resolve({
          data: [
            { code: "SEATS", name: "Plazas", billingType: "QUANTITY", billingScope: "BRANCH", unitPrice: 500, currency: "ARS", period: "MONTHLY", dependsOn: [], isActive: true, version: 1 },
          ],
        });
      }
      return Promise.reject(new Error(`unexpected url ${url}`));
    });
  });

  it("renders the catalog and toggles a QUANTITY item via POST", async () => {
    const postSpy = vi.spyOn(apiClient, "apiRequest");
    renderPage();
    await waitFor(() => expect(screen.getByText("Plazas")).toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: /activar/i }));
    await waitFor(() =>
      expect(postSpy).toHaveBeenCalledWith(
        expect.stringContaining("/items"),
        expect.objectContaining({ method: "POST" }),
      ),
    );
  });
});
```

- [ ] **Step 2: Correr el test y verificar que falla**

Run: `cd /home/faguero/dev/maitre/apps/web && npx vitest run src/features/subscription/subscription-page.test.tsx`
Expected: FAIL — no existe la sección de catálogo ni el texto "Plazas".

- [ ] **Step 3: Agregar el fetch del catálogo y las mutaciones**

En `subscription-page.tsx`, agregar tras las interfaces existentes:

```typescript
interface CatalogItemResponse {
  code: string;
  name: string;
  billingType: "SERVICE" | "QUANTITY";
  billingScope: "TENANT" | "BRAND" | "FISCAL_ENTITY" | "BRANCH" | "POS" | "CONNECTOR";
  unitPrice: number;
  currency: string;
  dependsOn: string[];
  isActive: boolean;
}
```

Dentro de `SubscriptionPage`, junto a `subscriptionQuery`/`entitlementsQuery`:

```typescript
  const queryClient = useQueryClient();

  const catalogQuery = useQuery({
    queryKey: ["subscription-catalog"],
    queryFn: () =>
      apiRequest<{ data: CatalogItemResponse[] }>("/v1/subscription-catalog", {
        accessToken: accessToken!,
        tenantId: selectedTenantId!,
      }),
    enabled: Boolean(accessToken && selectedTenantId),
  });
  const catalog = catalogQuery.data?.data ?? [];

  const activeCodes = new Set(entitlements.map((e) => e.resource.split("[")[0]));

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["subscription", selectedTenantId] });
    void queryClient.invalidateQueries({ queryKey: ["entitlements", selectedTenantId] });
  };

  const addItemMutation = useMutation({
    mutationFn: (input: { catalogItemCode: string; quantity?: number; scopeRefId?: string }) =>
      apiRequest(`/v1/subscriptions/${selectedTenantId}/items`, {
        method: "POST",
        accessToken: accessToken!,
        tenantId: selectedTenantId!,
        body: input,
      }),
    onSuccess: invalidate,
  });
```

(`useMutation`, `useQueryClient` se agregan al import existente `import { useQuery } from "@tanstack/react-query";` → `import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";`. Confirmar la forma real de `apiRequest` para `method`/`body` leyendo `apps/web/src/lib/api-client.ts` antes de este paso si difiere de la firma asumida acá.)

- [ ] **Step 4: Renderizar la sección de catálogo**

Insertar antes de `<article className="overview-card"><h2>Detalle tabular</h2>`:

```tsx
            <article className="overview-card">
              <h2>Catálogo de servicios</h2>
              <section className="profile-module-grid" aria-label="Catálogo de servicios contratables">
                {catalog.map((item) => {
                  const isActive = activeCodes.has(item.code);
                  return (
                    <article key={item.code} className="profile-card">
                      <p className="profile-eyebrow">{item.billingType === "QUANTITY" ? "Por cantidad" : "Servicio"}</p>
                      <h2>{item.name}</h2>
                      <p>
                        {item.billingType === "QUANTITY"
                          ? `$${item.unitPrice} ${item.currency} por unidad / mes`
                          : `$${item.unitPrice} ${item.currency} / mes`}
                      </p>
                      <button
                        type="button"
                        disabled={addItemMutation.isPending}
                        onClick={() =>
                          addItemMutation.mutate({
                            catalogItemCode: item.code,
                            ...(item.billingType === "QUANTITY" ? { quantity: 1 } : {}),
                          })
                        }
                      >
                        {isActive ? "Actualizar" : "Activar"}
                      </button>
                    </article>
                  );
                })}
              </section>
            </article>

- [ ] **Step 5: Correr el test y verificar que pasa**

Run: `cd /home/faguero/dev/maitre/apps/web && npx vitest run src/features/subscription/subscription-page.test.tsx`
Expected: PASS

- [ ] **Step 6: Prueba manual en navegador**

Run: `cd /home/faguero/dev/maitre/apps/web && npm run dev`
Navegar a la página de Suscripción del owner con el tenant demo, confirmar que la sección "Catálogo de servicios" lista `SEATS`/`WAITERS`/`CASHIERS`/etc., que el botón "Activar" dispara el POST (Network tab) y que tras el éxito se refleja en la sección de "Límites por recurso" ya existente (invalidación de `entitlements`).

- [ ] **Step 7: Commit**

```bash
git add apps/web/src/features/subscription/subscription-page.tsx apps/web/src/features/subscription/subscription-page.test.tsx
git commit -m "feat(web): add service catalog app-store section to subscription page"
```

---

### Task 10: Documentación — specs SDD actualizados

**Files:**
- Modify: `docs/sdd/spec-028-entity-subscription-item` (agregar `catalog_item_code`, `quantity`, `scope_ref_id` a la definición de campos)
- Create: `docs/sdd/spec-0XX-entity-subscription-catalog-item` (número real a tomar de `docs/sdd/INDEX.md` al momento de implementar — el siguiente correlativo libre)
- Modify: `docs/sdd/spec-031-api-subscriptions` (documentar los 4 endpoints nuevos del Task 7)
- Modify: `docs/sdd/INDEX.md` (agregar la entrada del spec nuevo)

**Interfaces:**
- No aplica (documentación, sin código).

- [ ] **Step 1: Leer `docs/sdd/_guides/SPEC_FORMAT.md` y `SPEC_STRUCTURE.md`**

Seguir exactamente esa estructura para el spec nuevo — no inventar un formato distinto al resto de `docs/sdd/spec-0NN-*`.

- [ ] **Step 2: Abrir `docs/sdd/INDEX.md`, identificar el próximo número de spec libre y crear `docs/sdd/spec-0XX-entity-subscription-catalog-item/` con el contenido de la entidad `CatalogItem` definida en Task 2 (code, name, billing_type, billing_scope, unit_price, currency, period, depends_on, is_active, version), replicando el formato de `spec-027-entity-subscription` como referencia de estructura de una entidad ya existente en el mismo dominio.**

- [ ] **Step 3: Actualizar `spec-028-entity-subscription-item` agregando los 3 campos nuevos (`catalog_item_code`, `quantity` ya documentado pero ahora con semántica ligada al catálogo, `scope_ref_id`) y una nota de que el constraint único pasó de `(subscription_id, service_id)` a `(subscription_id, catalog_item_code, scope_ref_id)`.**

- [ ] **Step 4: Actualizar `spec-031-api-subscriptions` documentando `GET /v1/subscription-catalog`, `POST /v1/subscriptions/:tenantId/items`, `PATCH /v1/subscriptions/:tenantId/items/:itemId`, `DELETE /v1/subscriptions/:tenantId/items/:itemId` con sus payloads reales (los mismos schemas Zod del Task 7).**

- [ ] **Step 5: Agregar la entrada al índice**

Editar `docs/sdd/INDEX.md` agregando la fila del spec nuevo en la sección correspondiente al dominio de suscripciones, junto a `spec-027`..`spec-036`.

- [ ] **Step 6: Commit**

```bash
git add docs/sdd/spec-028-entity-subscription-item docs/sdd/spec-0XX-entity-subscription-catalog-item docs/sdd/spec-031-api-subscriptions docs/sdd/INDEX.md
git commit -m "docs(sdd): document subscription catalog item entity and new endpoints"
```

---

## Verificación final

- [ ] **Suite completa del monorepo**

Run: `cd /home/faguero/dev/maitre && npm run build && npm test`
Expected: build limpio en todos los workspaces tocados (`@maitre/subscription`, `@maitre/persistence-memory`, `@maitre/persistence-supabase`, `apps/api`, `apps/web`); mismos 22 fallos preexistentes de `apps/api` documentados antes de este plan, cero fallos nuevos.

- [ ] **Smoke test end-to-end manual**

Con la API local corriendo (Task 8 Step 3) y el frontend (Task 9 Step 6): confirmar que activar "Plazas" con cantidad 12 en Palermo desde el catálogo se refleja en la sección "Límites por recurso" de la misma página como `SEATS[<branch-id>]` con `hardLimit: 12`, y que desactivarlo (`DELETE`) lo quita de la lista de entitlements activos tras el refetch.
