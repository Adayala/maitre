# Objetivo — SPEC-025

## Propósito

Registrar una autenticación exitosa observada mediante el proveedor para auditoría y seguridad, sin
convertir el evento en autorización ni exponer tokens o fingerprints personales crudos.

## Criterios de aceptación

### CAD-025-01 — Una autenticación exitosa observada produce `identity.user.authenticated.v1`

Una autenticación exitosa observada produce `identity.user.authenticated.v1`; Maitre no requiere
`POST /auth/login` propio.

### CAD-025-02 — El payload identifica User, provider, método y session ref opaca sin secretos ni PII cruda

Payload identifica User/provider/método y session ref opaca sin access/refresh token, password,
email, IP completa o user-agent crudo.

### CAD-025-03 — Tenant context sólo aparece si fue validado y el evento no concede autoridad

Tenant context sólo aparece si fue validado; el evento no concede Membership, role, scope ni
entitlement.

### CAD-025-04 — Refresh silencioso no emite el evento salvo decisión o versión explícita

Refresh silencioso no emite el evento salvo nueva versión/decisión explícita y una falla de
publicación no invalida la sesión ya emitida.

### CAD-025-05 — Audit y analytics deduplican y aplican retención a señales minimizadas

Audit/analytics deduplican y aplican retención/acceso a señales de seguridad minimizadas.

### CAD-025-06 — Schema, redacción, retry, DLQ y separación authn/authz poseen evidencia contractual

Schema, redacción, retry/DLQ y separación authentication/authorization poseen evidencia contractual.
