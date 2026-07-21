# Especificación — SPEC-023

## 1. Decisión propuesta

Supabase Auth es el proveedor inicial sujeto a ADR y a los spikes de SPEC-226. El código de aplicación sólo conoce `AuthenticatedPrincipal` y `SessionVerificationPort`; el adaptador de infraestructura encapsula SDK, JWKS y peculiaridades del proveedor.

## 2. Límites de responsabilidad

### Proveedor de identidad

- registro o invitación técnica, login, refresh y logout;
- password hashing, reset y verificación de email;
- emisión y revocación de sesiones según sus capacidades;
- publicación de issuer y claves de verificación.

### Cliente React

- iniciar los flows del proveedor mediante su SDK/adaptador;
- conservar la sesión con la estrategia aprobada en el spike;
- enviar sólo el access token como `Authorization: Bearer <token>` a Maitre;
- limpiar estado local al cerrar sesión o recibir una sesión inválida.

### API Maitre

- validar criptográficamente el access token y sus claims estándar;
- mapear `(provider, subject)` a un `User` global;
- resolver Membership, roles, branch scopes y entitlements desde fuentes Maitre;
- responder errores sin revelar existencia de cuentas ni secretos.

Maitre no recibe passwords ni refresh tokens en sus endpoints de dominio.

## 3. Contratos internos

```ts
type AuthenticatedPrincipal = {
  provider: string;
  subject: string;
  email?: string;
  emailVerified?: boolean;
  issuedAt: Date;
  expiresAt: Date;
};

interface SessionVerificationPort {
  verifyAccessToken(token: string): Promise<AuthenticatedPrincipal>;
}
```

El principal contiene identidad autenticada, no permisos. Email es un dato informativo del proveedor y no una clave de autorización.

## 4. Verificación del access token

El adaptador debe validar antes de crear el principal:

- firma contra claves obtenidas de una fuente JWKS confiable;
- algoritmo incluido en una allowlist explícita, nunca elegido sólo desde el header;
- `iss`, `aud`, `exp` y, cuando exista, `nbf`;
- subject no vacío y formato esperado;
- tolerancia de reloj acotada y configurable.

Las claves pueden cachearse con TTL y refresh controlado. Ante issuer, audience, algoritmo, firma o claves inválidas, el sistema falla cerrado. Nunca se registran tokens completos.

## 5. Flujos de sesión

### Login y refresh

El browser usa el proveedor. Maitre no expone `/auth/login` ni `/auth/refresh` propios en I0. Los mensajes visibles no deben permitir enumerar cuentas.

### Logout

El cliente elimina su sesión local y solicita revocación al proveedor cuando esté soportada. La API considera inválido todo request sin access token vigente; logout no sustituye expiraciones cortas ni revocación.

### Reset de password y verificación de email

Se ejecutan mediante flows del proveedor. Toda URL de retorno pertenece a una allowlist por ambiente. La API Maitre no consume passwords ni tokens de reset.

## 6. Resolución de contexto

Después de autenticar:

1. buscar `User` por `(provider, subject)`;
2. rechazar User suspendido o desactivado;
3. cargar Memberships activas;
4. obtener roles y branch scopes persistidos en Maitre;
5. calcular el contexto expuesto por `GET /v1/me/context` según SPEC-213.

No existe provisioning implícito por el solo hecho de presentar un token válido. La creación o vinculación de User requiere un flujo autorizado e idempotente.

## 7. Errores HTTP

Los endpoints protegidos usan Problem Details:

| Caso | Estado | Tipo estable |
| --- | ---: | --- |
| bearer ausente, malformado o inválido | 401 | `authentication-required` |
| sesión expirada | 401 | `session-expired` |
| identidad válida sin User habilitado | 403 | `identity-not-enabled` |
| User o Membership suspendido | 403 | `access-suspended` |
| tenant/branch fuera de alcance | 403 | `insufficient-scope` |

El `WWW-Authenticate` acompaña respuestas 401. El detalle público no distingue cuenta inexistente, desactivada o credenciales incorrectas cuando ello facilite enumeración.

## 8. Seguridad del browser

I0 usa bearer tokens y no cookies de sesión propias de Maitre. Si una decisión posterior adopta cookies, deberá definir `HttpOnly`, `Secure`, `SameSite` y protección CSRF en una ADR antes de implementación.

No se exponen service-role keys al browser. Secrets, tokens, códigos de reset y claims sensibles se redactan en logs, traces y errores.

## 9. Portabilidad

El adaptador Supabase vive en infraestructura. Tests de contrato se ejecutan contra cualquier implementación de `SessionVerificationPort`. Configuración, migraciones y lógica de dominio no dependen de IDs internos adicionales del proveedor fuera del par estable `(provider, subject)`.
