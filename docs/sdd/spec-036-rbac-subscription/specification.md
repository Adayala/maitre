# Especificación — SPEC-036 Subscription RBAC

Permisos tenant: `subscription.read`, `entitlement.read`, `quota.read`,
`subscription.change.request`. OWNER/ADMIN/MANAGER reciben assignments según necesidad; roles
operativos consumen decisiones de entitlement sin leer términos comerciales.

Provision/suspend/cancel/reactivate, service catalog publish y quota override son permisos
`platform.*` no asignables por Membership tenant, según `subscription-authority-contract.md`.
Entitlement/Quota derivados no admiten permiso de escritura.

No existe comparación `OWNER > ADMIN > ...` ni rol `EMPLOYEE` genérico. Control-plane aplica step-up,
actor real, tenant objetivo, ticket/reason, environment y audit/segregation.
