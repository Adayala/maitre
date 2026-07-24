# Reglas — SPEC-016

- No existe autorización genérica por `EMPLOYEE` ni comparación ordinal de roles.
- OWNER/ADMIN/MANAGER operan sólo mediante permissions y scopes efectivos.
- Nadie crea/edita recursos cross-tenant ni se autoasigna permisos.
- Fiscal/archivo/soporte son acciones sensibles auditadas.
- Revocación de Membership/assignment invalida autorización server-side.
