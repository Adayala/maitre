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
- Almacenar roles, permisos, tenant o sucursales.
- Modelar huéspedes anónimos o comensales como Users internos.

## Criterios de aceptación

### CAD-017-01 — User modela un perfil global desacoplado de credenciales y tenancy

User representa a una persona autenticable a nivel dominio con identidad global, pero no almacena passwords, refresh tokens, tenant, rol ni sucursal.

### CAD-017-02 — La identidad externa mapea de forma estable a un único User de dominio

La combinación `(identityProvider, externalIdentityId)` identifica de forma única al User. Cambiar de proveedor requiere migración explícita sin romper el ID de dominio.

### CAD-017-03 — Un mismo User puede participar en múltiples tenants mediante Membership

User no contiene memberships embebidas ni autoridad directa. La participación en tenants y sucursales se resuelve por Membership y sus scopes relacionados.

### CAD-017-04 — El estado del User impacta la autenticación efectiva sin redefinir autorización

User `SUSPENDED` o `DEACTIVATED` impide obtener contexto autorizado aun cuando el token externo sea criptográficamente válido.

### CAD-017-05 — Email y datos personales se tratan como perfil/PII minimizada

Email, display name y otros datos personales se usan como perfil o contacto, no como autoridad. APIs, logs y auditoría minimizan su exposición.

### CAD-017-06 — El dominio sigue portable frente a cambios del proveedor de identidad

Cambiar el proveedor no modifica las reglas del dominio ni el identificador del User. El dominio consume puertos propios y no acopla su semántica a Supabase u otro vendor.
