# Especificación — SPEC-026 Identity RBAC

Permisos: `user.read/update_self`, `membership.read`, `membership.invite`, `membership.role.assign`,
`membership.scope.assign`, `membership.revoke`, `role.read`, `permission.read` y `identity.audit.read`.

OWNER/ADMIN/MANAGER reciben assignments versionados; no existe jerarquía ordinal ni `EMPLOYEE`
genérico. Un actor sólo delega permisos que posee y que la DelegationPolicy marca delegables; ADMIN
no cambia peer/superior ni elimina último OWNER. Self-grant/self-approve se prohíben.

Toda decisión valida Membership ACTIVE, authorization version, tenant y alcance por sucursal. Invitaciones,
roles/alcances y revocaciones son idempotentes/versionadas y auditadas. Denegación cross-tenant no
enumera identidades.
