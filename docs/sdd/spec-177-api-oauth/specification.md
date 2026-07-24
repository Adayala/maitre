# Especificación — SPEC-177 OAuth API

Start crea state one-time ligado a tenant, actor, integration, provider, exact redirect, PKCE
challenge, requested scopes, nonce y expiry. Callback consume state atómicamente, valida todos los
bindings y guarda tokens mediante secret adapter antes de activar credencial.

Reauthorize sólo rota la misma installation y no puede sustituir otra. Redirects son allowlisted y
scopes mínimos. Revoke invalida credentials y jobs/sessions dependientes. Browser/logs nunca reciben
refresh/access tokens persistentes.

`POST /oauth/start` devuelve la URL de autorización y el state efímero; `GET|POST /oauth/callback`
procesa la respuesta del provider; `POST /oauth/{integrationId}:reauthorize` reinicia el flujo sobre
la misma instalación; `POST /oauth/{integrationId}:revoke` invalida la credencial vinculada. Errores
usan `404` para scope ajeno, `409` para conflicto de lifecycle/reauthorize, `412` para revisión
obsoleta y `422` para callback, redirect o scopes inválidos.

La API nunca serializa access/refresh tokens al cliente ni los refleja en logs. El browser sólo ve
state/redirects efímeros y resultados sanitizados. La activación de credenciales depende de persistir
los secretos correctamente y de validar que el subject/provider coincide con la installation esperada.
