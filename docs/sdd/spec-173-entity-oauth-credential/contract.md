# Contrato de entidad — SPEC-173 OAuth Credential

OAuthCredential conserva sólo metadatos y referencias secretas para access/refresh tokens:
provider, subject, scopes, expiración, estado y versión de rotación. Tokens nunca aparecen en
DB de dominio, API, logs ni eventos; refresh se coordina para evitar carreras. Tests cubren
expiración, revocación, scopes reducidos, rotación concurrente, errores del provider,
redacción y aislamiento entre tenants.
