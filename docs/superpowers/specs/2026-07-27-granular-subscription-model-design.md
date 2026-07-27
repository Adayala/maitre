# Modelo de suscripción granular — Design Spec

## Contexto

Hoy `packages/modules/subscription` resuelve entitlements contra un `PLAN_REGISTRY` fijo en código (`STARTER`/`PROFESSIONAL`/`ENTERPRISE`, `plan-registry.ts`). No hay forma de contratar servicios o cantidades (plazas, mozos, cajeros, sucursales) de manera independiente por sucursal. `docs/foundation/03-service-catalog.md` y `04-tenancy-subscriptions.md` ya documentan el modelo de negocio deseado: todo servicio o recurso se activa/desactiva y se cuantifica de forma independiente, con alcance (tenant/marca/entidad fiscal/sucursal/punto de venta/conector).

Este spec cubre la migración de ese modelo documental a un catálogo real en base de datos, expuesto por API, y gestionable desde un panel interno tipo "app store" en `apps/web`.

Backend actual relevante:
- `supabase/migrations/20260723010000_subscription_domain.sql`: tablas `subscription_subscriptions`, `subscription_items`, `subscription_entitlements`, `subscription_quotas`.
- `packages/modules/subscription/src/domain/plan-registry.ts`: catálogo fijo en código, a reemplazar.
- `packages/modules/subscription/src/domain/calculate-entitlements.ts`: deriva entitlements desde `plan.limits`, a reemplazar por derivación desde `subscription_items.quantity`.
- `apps/api/src/routes/subscriptions.ts`, `apps/api/src/routes/entitlements.ts`: endpoints existentes de lectura + `addService`/`removeService`/`upgradePlan`.
- `apps/api/src/composition/container.ts` (~línea 293-326 y ~681-690): seed demo con `planCode: "PROFESSIONAL"` fijo, sin ítems granulares.
- `apps/web/src/features/subscription/subscription-page.tsx`: dashboard de solo lectura (plan, status, entitlements, quotas). Sin mutaciones ni catálogo.

## Decisiones (confirmadas con el usuario)

1. **Sin backfill.** No hay datos productivos reales de suscripción más allá del tenant demo. La migración reemplaza el schema y resiembra, sin script de transformación de filas legacy.
2. **Panel interno primero, no self-service.** El "app store" lo usa el equipo maitre para activar/desactivar servicios y cantidades por tenant. No hay checkout ni gateway de pago en este alcance; eso queda para una fase futura fuera de este plan.
3. **`billing_type` reemplaza a "suscripción sí/no".** Todo cargo es mensual recurrente por defecto. El campo que importa es el tipo de facturación:
   - `SERVICE`: cargo fijo por tener el servicio activo.
   - `QUANTITY`: cargo = cantidad contratada × precio unitario (plazas, mozos, cajeros, sucursales, etc.).
   - La columna `period` se agrega igual (valor único `MONTHLY` por ahora) para no bloquear un futuro `ONE_TIME`/`ANNUAL`, pero no se implementa lógica para otros valores en este plan.
4. **PayLanding** se agrega como servicio nuevo con conectores independientes (`PAYLANDING.MERCADOPAGO`, `PAYLANDING.NARANJA_X`, `PAYLANDING.MODO`, `PAYLANDING.TODO_PAGO`), mismo patrón que `REPUTATION.CONNECTORS.*`.

## Diseño

### 1. Modelo de datos

Tabla nueva `subscription_catalog_items` — el catálogo/plantilla (lo que hoy es markdown en `03-service-catalog.md` pasa a vivir en DB):

| Columna | Tipo | Notas |
| --- | --- | --- |
| `code` | text PK | ej. `SEATS`, `PAYLANDING.MERCADOPAGO` |
| `name` | text | nombre comercial |
| `billing_type` | enum `SERVICE`\|`QUANTITY` | |
| `billing_scope` | enum `TENANT`\|`BRAND`\|`FISCAL_ENTITY`\|`BRANCH`\|`POS`\|`CONNECTOR` | |
| `unit_price` | numeric | precio fijo si `SERVICE`, precio por unidad si `QUANTITY` |
| `currency` | text | ej. `ARS` |
| `period` | enum `MONTHLY` | único valor soportado hoy |
| `depends_on` | text[] | códigos de dependencia |
| `is_active` | boolean | si se puede seguir contratando |
| `version` | int | versionado; cambios no afectan contratos vigentes |

`subscription_items` (contratación real, ya existe) se extiende con:
- `catalog_item_code` (FK a `subscription_catalog_items.code`)
- `quantity` (nullable — solo aplica si el catálogo es `QUANTITY`)
- `scope_ref_id` (nullable — a qué sucursal/entidad fiscal/POS aplica; null si alcance es tenant)

`subscription_entitlements`/`subscription_quotas` se derivan por sucursal cuando el ítem es `QUANTITY` (ej. `SEATS.MAX[branch_id] = quantity`), reemplazando la derivación actual desde `plan.limits`.

### 2. Dominio (`packages/modules/subscription`)

- Eliminar `plan-registry.ts` como fuente de límites; el catálogo pasa a leerse de `subscription_catalog_items` vía un nuevo puerto (`CatalogRepository` en `application/ports.ts`).
- `calculate-entitlements.ts` deriva desde `subscription_items` (cantidad × alcance) en vez de `plan.limits`.
- Nuevos casos de uso en `application/`: `add-quantity-item.ts` (alta con `quantity` + `scopeRefId`), `update-quantity.ts` (cambio de cantidad), extender `add-service.ts`/`remove-service.ts` para aceptar `scopeRefId` (sucursal/conector).
- Validación: `quantity` solo permitido si `catalogItem.billing_type === "QUANTITY"`; `scopeRefId` obligatorio si `billing_scope` no es `TENANT`.

### 3. API (`apps/api/src/routes/subscriptions.ts`)

- `GET /v1/subscription-catalog` — catálogo completo, público para el panel interno autenticado.
- `POST /v1/subscriptions/:tenantId/items` — body `{ catalogItemCode, scope, scopeRefId?, quantity? }`.
- `PATCH /v1/subscriptions/:tenantId/items/:itemId` — body `{ quantity? , isActive? }`.
- `DELETE /v1/subscriptions/:tenantId/items/:itemId`.

### 4. Frontend (`apps/web/src/features/subscription/subscription-page.tsx`)

Nueva sección "Catálogo de servicios" antes del detalle tabular existente (no se toca el resto del dashboard):
- `useQuery` a `/v1/subscription-catalog`.
- `useMutation` para alta/baja/cambio de cantidad; invalida `["subscription", tenantId]` y `["entitlements", tenantId]` al éxito.
- Agrupado por categoría (mismas secciones del doc: Operación gastronómica, Caja y fiscalidad, Experiencia y crecimiento, Inteligencia).
- Tarjeta por servicio:
  - `SERVICE`: toggle ON/OFF, con selector de sucursal si `billing_scope=BRANCH`.
  - `QUANTITY`: stepper de cantidad + selector de sucursal, precio unitario × cantidad visible.
  - Servicios con conectores (`PAYLANDING`, `REPUTATION`): sub-lista expandible con toggle por conector.
- Precio total estimado por tarjeta y total general en el header.

### 5. Seed (`apps/api/src/composition/container.ts`)

Reemplazar `planCode: "PROFESSIONAL"` fijo por:
- Seed de `subscription_catalog_items` con los códigos definidos en `03-service-catalog.md` (~30 códigos, incluyendo `PAYLANDING.*`).
- Seed de `subscription_items` demo: Core + Branches×2 + Floor + Seats×12/8 + Waiters×8/4 + Cashiers×3/1 + Reservations (solo Palermo) + ARCA, replicando el ejemplo de `03-service-catalog.md`.

### 6. Documentación

- Actualizar `docs/sdd/spec-028-entity-subscription-item` con `catalog_item_code`, `quantity`, `scope_ref_id`.
- Crear `docs/sdd/spec-0XX-entity-subscription-catalog-item` (número correlativo real a asignar por `docs/sdd/INDEX.md` al momento de implementar).
- Actualizar `docs/sdd/spec-031-api-subscriptions` con los 4 endpoints nuevos.

## Fuera de alcance

- Checkout / gateway de pago real para self-service del cliente.
- Migración/backfill de suscripciones productivas preexistentes (no hay ninguna más allá del demo).
- Lógica para `period` distinto de `MONTHLY` (columna se agrega, comportamiento no).
- UI de self-service para el dueño del restaurante (fase futura).
