# Contrato API — SPEC-177 OAuth

Iniciar autorización con PKCE y state de un solo uso, procesar callback y ejecutar revoke o
reauthorize. Redirect URIs están allowlisted, scopes son mínimos y tokens se guardan en secret
manager sin llegar al browser ni logs. Tests cubren CSRF, replay, state vencido, callback de
tenant incorrecto, scope faltante, refresh revocado, redacción, auditoría y aislamiento.
