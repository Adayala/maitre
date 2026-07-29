# Objetivo — SPEC-023

## Propósito

Establecer un contrato de autenticación seguro y desacoplado que permita usar Supabase Auth en el MVP sin introducir credenciales, sesiones o autorización propietarias dentro del dominio Maitre.

## Resultado esperado

1. El cliente React usa los flujos soportados por el proveedor para iniciar, renovar y cerrar sesión, recuperar contraseña y verificar email.
2. La API Node.js valida access tokens mediante un `SessionVerificationPort` y configuración confiable de issuer, audience, JWKS y algoritmos permitidos.
3. Maitre vincula el subject externo con un `User` global y resuelve Membership, roles y sucursales desde su base de datos.
4. Un token válido autentica identidad, pero nunca concede tenant, rol, sucursal ni entitlement por sí solo.
5. Cambiar de proveedor no modifica las reglas del dominio ni los handlers de aplicación.
6. El cliente ofrece acceso con Google mediante Supabase Auth cuando el proveedor está habilitado.

## Fuera de alcance I0

- implementar un servidor OAuth/OIDC propio;
- almacenar o verificar passwords en Maitre;
- emitir un segundo JWT de sesión;
- MFA, SSO empresarial o federation personalizada;
- autorización basada en metadata editable por el cliente.
- convertir una identidad Google autenticada en Membership interna sin invitación previa.

## Criterios de aceptación

### CAD-023-01 — Access token válido se verifica por issuer, audience, firma, algoritmo y tiempos

Access token válido se verifica mediante issuer, audience, firma/JWKS, algoritmo allowlisted, exp/nbf
y clock skew antes de crear `AuthenticatedPrincipal`.

### CAD-023-02 — El principal contiene identidad pero no tenant, roles ni scopes confiados

El principal contiene identidad, no tenant/roles/scopes confiados; contexto se resuelve
`subject/provider → User → Membership ACTIVE`.

### CAD-023-03 — User o Membership suspendidos y una sucursal fuera de alcance se deniegan aunque el JWT siga vigente

User/Membership suspendido o una sucursal fuera de alcance se deniega aunque el JWT continúe
criptográficamente vigente.

### CAD-023-04 — Login, refresh, logout, reset y verify pertenecen al provider o adaptador

Login/refresh/logout/reset/verify pertenecen al provider/adaptador; Maitre no almacena passwords ni
expone endpoints propios de login/refresh en I0.

### CAD-023-05 — Tokens, reset codes, service-role keys y claims sensibles no aparecen en URLs ni logs

Tokens, reset codes, service-role keys y claims sensibles no aparecen en URL, logs, traces, artifacts
ni bundle del browser.

### CAD-023-06 — Provider outage o JWKS rotation fallan cerrado y el adapter es reemplazable

Provider outage/JWKS rotation falla cerrado y la suite contractual permite reemplazar el adapter sin
cambiar dominio/casos de uso.

### CAD-023-07 — Google permite registro/login sin conceder acceso interno implícito

El browser inicia OAuth con Google mediante el SDK del proveedor y una URL de retorno allowlisted.
Los clientes pueden crear su identidad; el personal sólo accede al backoffice cuando una Membership
autoritativa ya lo habilita.
