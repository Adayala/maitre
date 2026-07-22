# Especificación — SPEC-173 OAuthCredential

Dominio conserva provider subject, scopes, expiry, status, secret references y rotation version;
tokens/material nunca ingresan en tablas, APIs, events o logs.

Secret adapter usa opaque IDs no manipulables como URL, tenant/integration binding, encryption,
least privilege, audit, rotation overlap, backup y deletion. Refresh tiene lease para evitar carreras.
Revocation invalida secret version y cancela/pausa jobs que dependan de ella.
