# Plan — SPEC-020

1. Aprobar modelo User/Auth y catálogo Role/Permission mínimo.
2. Definir aggregate, commands y repository port.
3. Crear tablas membership/role assignments/branch scopes.
4. Implementar constraints, RLS y transacciones.
5. Implementar cálculo de contexto efectivo.
6. Implementar suspend/revoke/role/scope changes auditables.
7. Probar cross-tenant, concurrencia y último OWNER.
8. Integrar memberships en `/v1/me/context`.

Invitaciones reales quedan detrás de un slice separado; I0 usa provisioning sintético controlado.
