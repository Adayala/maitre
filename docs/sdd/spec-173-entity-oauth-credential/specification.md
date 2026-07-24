# Especificación — SPEC-173 OAuthCredential

Dominio conserva provider subject, scopes, expiry, status, secret references y rotation version;
tokens/material nunca ingresan en tablas, APIs, events o logs.

Secret adapter usa opaque IDs no manipulables como URL, tenant/integration binding, encryption,
least privilege, audit, rotation overlap, backup y deletion. Refresh tiene lease para evitar carreras.
Revocation invalida secret version y cancela/pausa jobs que dependan de ella.

La entidad incluye `oauthCredentialId`, `integrationId`, `providerSubject`, `grantedScopes`,
`expiresAt?`, `status`, `secretRef`, `refreshSecretRef?`, `rotationVersion`, `createdAt`,
`updatedAt`, `revokedAt?` y `revision`. El estado distingue credenciales válidas, expiradas, revocadas
o en rotación, sin transportar nunca el token real.

La rotación debe permitir coexistencia temporal controlada de versiones cuando el provider lo exija,
pero el dominio siempre referencia cuál versión está activa para jobs nuevos. Los jobs en vuelo deben
coordinarse con la política de revocation/rotation para no mezclar estados inconsistentes.
