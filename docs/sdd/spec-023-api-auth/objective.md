# Objetivo — SPEC-023

## Propósito

Establecer un contrato de autenticación seguro y desacoplado que permita usar Supabase Auth en el MVP sin introducir credenciales, sesiones o autorización propietarias dentro del dominio Maitre.

## Resultado esperado

1. El cliente React usa los flujos soportados por el proveedor para iniciar, renovar y cerrar sesión, recuperar contraseña y verificar email.
2. La API Node.js valida access tokens mediante un `SessionVerificationPort` y configuración confiable de issuer, audience, JWKS y algoritmos permitidos.
3. Maitre vincula el subject externo con un `User` global y resuelve Membership, roles y branches desde su base de datos.
4. Un token válido autentica identidad, pero nunca concede tenant, rol, branch ni entitlement por sí solo.
5. Cambiar de proveedor no modifica las reglas del dominio ni los handlers de aplicación.

## Fuera de alcance I0

- implementar un servidor OAuth/OIDC propio;
- almacenar o verificar passwords en Maitre;
- emitir un segundo JWT de sesión;
- MFA, SSO empresarial o federation personalizada;
- autorización basada en metadata editable por el cliente.
