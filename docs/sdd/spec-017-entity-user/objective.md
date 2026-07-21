# Objetivo — SPEC-017

## Propósito

Representar una persona autenticable mediante una identidad externa sin duplicar credenciales ni acoplar su perfil a un único tenant.

## Resultados esperados

- Una identidad externa se mapea a un único User de dominio.
- El mismo User puede participar en múltiples tenants mediante Membership.
- Desactivar un User impide acceso en todos sus tenants.
- Email/display name se tratan como perfil/PII, no como autorización.
- Migrar el proveedor de identidad no cambia el ID de dominio.

## No objetivos

- Gestionar passwords, MFA, verificación de email o refresh tokens.
- Almacenar roles, permisos, tenant o branches.
- Modelar huéspedes anónimos o comensales como Users internos.

## Criterios de aceptación

- [ ] No existe material de credenciales en User o su tabla.
- [ ] `(identityProvider, externalIdentityId)` identifica de forma única al User.
- [ ] Dos memberships de tenants diferentes pueden referir al mismo User.
- [ ] User suspendido/desactivado no obtiene contexto autorizado.
- [ ] Logs/APIs minimizan email y otros datos personales.
