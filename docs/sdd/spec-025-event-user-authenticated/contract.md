# Contrato del evento — SPEC-025

## Propósito y límites

Registrar una autenticación exitosa para seguridad/auditoría. No es evento de dominio para
autorizar requests, no transporta tokens y no se publica por refresh silencioso salvo
decisión explícita futura.

## Identidad y payload

- Nombre: `identity.user.authenticated.v1`.
- Aggregate: User / `userId`.
- Campos: `eventId`, `occurredAt`, `userId`, provider, auth method categorizado,
  session/reference opaca, tenant context opcional validado, correlation ID y señales de
  riesgo no identificantes.

No incluye access/refresh token, password, IP completa, user-agent crudo o memberships.
Datos de seguridad tienen retención/acceso según SPEC-219/220.

## Semántica y aceptación

Duplicados son posibles; analytics/audit deduplican. Un fallo de publicación no invalida
la sesión ya emitida, pero queda observable/reintentable. Tests cubren schema, redacción,
retención, retry y separación entre autenticación exitosa y autorización tenant.
