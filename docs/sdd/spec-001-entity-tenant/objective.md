# Objetivo — SPEC-001

## Propósito

Definir Tenant como agregado organizacional mínimo, independiente del proveedor de identidad y del ciclo comercial, para que toda operación con alcance tenant tenga una raíz de aislamiento inequívoca.

## Resultado esperado

1. Tenant posee identidad, nombre, estado organizacional y defaults regionales.
2. Las referencias con alcance tenant usan un `tenantId` explícito e inmutable.
3. Plan, trial, billing, límites, features y cuotas se resuelven fuera de Tenant.
4. El bootstrap inicial admite un actor de sistema sin crear ciclos con User/Membership.
5. Los contratos JSON usan camelCase y persistencia usa snake_case mediante mapping explícito.
6. El provisioning inicial es autenticado, idempotente y observable de punta a punta.

## Fuera de alcance I0

- ciclo de suscripción, prueba, cobro o cancelación comercial;
- límites de sucursales, usuarios o mesas;
- feature flags y entitlements efectivos;
- métricas comerciales como facturación o cantidad de empleados;
- CRUD público de tenants sin un workflow de provisioning autorizado.

## Criterios de aceptación

### CAD-001-01 — Tenant define la raíz de aislamiento organizacional

Tenant expone `id`, `name`, `status`, `defaultLocale`, `defaultCurrency`, `defaultTimezone` y contactos opcionales. No embebe users, memberships, roles ni recursos hijos.

### CAD-001-02 — Toda relación con alcance tenant usa `tenantId` explícito e inmutable

`tenantId` se asigna al crear el agregado y no puede mutarse. Cualquier recurso descendiente se autoriza además por membership y scope persistidos, no sólo por conocer IDs.

### CAD-001-03 — Tenant no absorbe suscripción, límites ni capacidades

Plan, trial, billing, cuotas, features, límites y entitlements efectivos viven fuera de Tenant. Los defaults regionales no implican habilitación funcional.

### CAD-001-04 — El ciclo de vida organizacional es acotado y terminal al archivar

Los únicos estados válidos son `ACTIVE`, `SUSPENDED` y `ARCHIVED`. `SUSPENDED` bloquea comandos operativos nuevos; `ARCHIVED` es terminal y de sólo lectura.

### CAD-001-05 — Bootstrap y auditoría no generan ciclos con identidad

El provisioning inicial admite actor `SYSTEM` o equivalente autorizado mientras todavía no existe un `User` materializado. La auditoría conserva trazabilidad sin exigir foreign keys circulares.

### CAD-001-06 — Provisioning inicial es autenticado, idempotente y observable

Crear Tenant requiere workflow autorizado, usa idempotency key, no duplica tenant/membership/suscripción ante reintentos y registra `TenantCreated` con outbox transaccional.
