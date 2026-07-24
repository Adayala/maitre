# Objetivo — SPEC-177

Definir la API OAuth de inicio, callback, reautorización y revocación sin exponer tokens al browser ni
permitir sustituciones cruzadas de instalación.

## Criterios de aceptación

### CAD-177-01 — `start` crea state one-time con bindings, PKCE, scopes y expiry

`start` crea un state one-time ligado a tenant, actor, integration, provider, redirect
exacto, PKCE challenge, scopes solicitados, nonce y expiry.

### CAD-177-02 — `callback` consume state atómicamente y persiste tokens sólo vía secret adapter

`callback` consume state atómicamente, valida todos los bindings y persiste tokens sólo
mediante secret adapter antes de activar la credencial.

### CAD-177-03 — `reauthorize` sólo rota la misma installation

`reauthorize` sólo puede rotar la misma installation y no puede sustituir otra
credencial/integración distinta.

### CAD-177-04 — Redirects y scopes respetan allowlists y mínimos aprobados

redirects son allowlisted y scopes se restringen al mínimo aprobado.

### CAD-177-05 — `revoke` corta credenciales y jobs sin exponer tokens

`revoke` invalida credenciales y jobs/sesiones dependientes sin exponer tokens en browser,
logs o responses.

### CAD-177-06 — La aprobación exige evidencia de replay, PKCE, reauthorize y ausencia de tokens públicos

La aprobación exige fixtures de state replay, PKCE, redirect allowlist, reauthorize,
revoke y ausencia de tokens persistentes en canales públicos.
