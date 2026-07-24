# Objetivo — SPEC-173

Definir OAuthCredential como referencia segura a credenciales externas sin exponer material secreto al
dominio, APIs o logs.

## Criterios de aceptación

### CAD-173-01 — El dominio conserva sólo metadata y refs opacos, no tokens

el dominio conserva sólo provider subject, scopes, expiry, status, secret refs y rotation
version.

### CAD-173-02 — Tokens y material secreto nunca entran en tablas, APIs, events o logs

tokens y material secreto nunca ingresan en tablas de dominio, APIs, events o logs.

### CAD-173-03 — Secret adapter aísla binding, cifrado, auditoría y rotación

secret adapter usa opaque IDs, binding por tenant/integration, cifrado, least privilege,
auditoría y rotación con overlap controlado.

### CAD-173-04 — Refresh evita carreras mediante lease o exclusión equivalente

refresh usa lease o exclusión equivalente para evitar carreras y refresh duplicado.

### CAD-173-05 — Revocation invalida refs activas y pausa/cancela jobs dependientes

revocation invalida la secret version y pausa/cancela jobs dependientes de esa credencial.

### CAD-173-06 — La aprobación exige evidencia de refresh racing, rotación y expiración

La aprobación exige fixtures de refresh racing, revocation, rotation overlap, secret
isolation y expiración.
