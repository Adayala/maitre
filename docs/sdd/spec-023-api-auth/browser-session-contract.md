# Contrato de sesión browser

## Decisión I0 propuesta

El browser usa un backend-for-frontend same-site. El refresh token del Identity Provider se guarda
exclusivamente en cookie `HttpOnly`, `Secure`, `SameSite=Lax`, `Path=/auth`, sin acceso JavaScript.
El access token tiene vida corta y permanece en memoria del BFF/server; no se persiste en
localStorage/sessionStorage/IndexedDB.

Si el despliegue obliga a bearer directo desde SPA, esa variante requiere ADR independiente y no se
considera aprobada por este documento.

## CSRF y cookies

Mutaciones autenticadas por cookie exigen Origin/Referer allowlist y CSRF token ligado a sesión para
métodos no seguros. CORS usa origins exactos y nunca combina credentials con wildcard. Cookies de
preview/production tienen nombres, domains y secrets separados.

## Verificación y autorización

El adapter valida issuer, audience, algoritmo allowlist, signature/JWKS, expiry, not-before y clock
skew. Luego resuelve AuthenticatedPrincipal→User→Membership server-side. Claims de tenant, roles o
branch sólo son hints y nunca autoridad. Membership revocada deniega aunque el token siga vigente.

## Refresh, logout y revocación

Refresh rota token/family cuando el provider lo soporta y serializa concurrencia por sesión. Replay
revoca la familia y requiere login. Logout invalida sesión server-side, intenta revocación provider,
borra cookie y es idempotente; no depende sólo de borrar estado local.

Cambios de Membership/permissions incrementan authorization version y fuerzan revalidación. Eventos
de seguridad conservan session/user refs seudónimas, nunca tokens.

## Pendiente de aprobación

Esta propuesta requiere ADR/resultado de SPEC-226 sobre hosting, cookies y provider. Hasta entonces
SPEC-023 permanece `IN_PROGRESS/BLOCKED`; no se interpreta como decisión productiva aceptada.
