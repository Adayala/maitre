# Reglas — SPEC-032

- Un actor sólo lee el contexto permitido por Membership/permiso/alcance.
- OWNER/ADMIN nominal no habilita lectura cross-tenant.
- Entitlement y Quota conservan identidades/tipos separados en la respuesta.
- Revision/computedAt/staleness son explícitos.
- Cache/proyección no autoriza mutaciones.
- Ausencia o fuente inválida falla cerrado; no significa unlimited.
