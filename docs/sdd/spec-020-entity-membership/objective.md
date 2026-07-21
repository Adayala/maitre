# Objetivo — SPEC-020

## Propósito

Resolver qué puede hacer un User dentro de un Tenant y en qué sucursales, conservando revocación, mínimo privilegio y aislamiento verificable.

## Resultados esperados

- Un User participa en uno o más tenants sin duplicar identidad.
- Membership activa posee roles explícitos.
- El alcance es todas las sucursales o un conjunto explícito.
- Revocar/suspender Membership elimina acceso al tenant.
- Cambios de roles/scopes son auditables y no dependen del token del cliente.

## No objetivos

- Almacenar credenciales o perfil global.
- Definir el catálogo completo de permisos/entitlements.
- Modelar asignaciones operativas por jornada/plaza.

## Criterios de aceptación

- [ ] Existe como máximo una Membership por User/Tenant.
- [ ] Membership activa tiene al menos un role assignment válido.
- [ ] `SELECTED_BRANCHES` tiene scopes no vacíos y tenant-consistentes.
- [ ] `ALL_BRANCHES` no usa filas de scope como segunda fuente.
- [ ] Tests bloquean acceso Tenant/Branch fuera de alcance.
- [ ] No se puede revocar el último OWNER sin transferencia/cierre aprobado.
