# Especificación — SPEC-177 OAuth API

Start crea state one-time ligado a tenant, actor, integration, provider, exact redirect, PKCE
challenge, requested scopes, nonce y expiry. Callback consume state atómicamente, valida todos los
bindings y guarda tokens mediante secret adapter antes de activar credencial.

Reauthorize sólo rota la misma installation y no puede sustituir otra. Redirects son allowlisted y
scopes mínimos. Revoke invalida credentials y jobs/sessions dependientes. Browser/logs nunca reciben
refresh/access tokens persistentes.
