# Objetivo — SPEC-001

## Propósito

Definir Tenant como agregado organizacional mínimo, independiente del proveedor de identidad y del ciclo comercial, para que toda operación tenant-scoped tenga una raíz de aislamiento inequívoca.

## Resultado esperado

1. Tenant posee identidad, nombre, estado organizacional y defaults regionales.
2. Las referencias tenant-scoped usan un `tenantId` explícito e inmutable.
3. Plan, trial, billing, límites, features y cuotas se resuelven fuera de Tenant.
4. El bootstrap inicial admite un actor de sistema sin crear ciclos con User/Membership.
5. Los contratos JSON usan camelCase y persistencia usa snake_case mediante mapping explícito.

## Fuera de alcance I0

- ciclo de suscripción, prueba, cobro o cancelación comercial;
- límites de sucursales, usuarios o mesas;
- feature flags y entitlements efectivos;
- métricas comerciales como facturación o cantidad de empleados;
- CRUD público de tenants sin un workflow de provisioning autorizado.
