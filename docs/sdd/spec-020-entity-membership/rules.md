# Reglas — SPEC-020

## Invariantes

1. Existe como máximo una Membership por User/Tenant.
2. Sólo User y Tenant activos pueden sostener acceso efectivo.
3. Membership no almacena password, claims ni tokens.
4. Roles se asignan por referencia; permisos no se copian.
5. ACTIVE requiere al menos un rol válido.
6. Branch scope nunca cruza tenant.
7. ALL_BRANCHES y SELECTED_BRANCHES son mutuamente exclusivos en persistencia.
8. Headers/claims del cliente no modifican roles o scope.
9. Suspender/revocar elimina acceso en el siguiente cálculo/verificación.
10. Último OWNER no puede revocarse/degradarse sin transferencia o cierre aprobado.
11. Cambios de status/roles/scopes son auditables.
12. Entitlements se calculan separadamente; Membership no activa servicios.

## Concurrencia

Cambios de último OWNER y roles/scopes críticos usan transacción y locking/version check. Last-write-wins queda prohibido.
