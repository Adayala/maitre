# Rules — SPEC-122

- No existen wildcard ni roles locales implícitos con autoridad por nombre.
- `employee`, `supervisor` y `payroll` son assignments/perfiles, no shortcuts de autorización.
- Requester y approver de ajustes deben diferir cuando la policy lo exige.
- Sensitive read y export requieren step-up, audit y scope válido.
- Revocación o stale auth invalidan acceso inmediatamente según policy.
- `time.export` es asíncrono y requiere evidencia persistida; no existe export síncrono ilimitado en I0.
- Step-up expira independientemente de la sesión base y debe reevaluarse por request de export.
- `labor_policy.review` y `labor_policy.manage` no implican `time.read_sensitive`, `time.export` ni
  `time.adjust.approve`.
- El assignment `payroll` nunca autoriza por nombre; sólo habilita lo que indiquen los permisos
  explícitos asociados.
