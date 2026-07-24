# Rules — SPEC-122

- No existen wildcard ni roles locales implícitos con autoridad por nombre.
- `employee`, `supervisor` y `payroll` son assignments/perfiles, no shortcuts de autorización.
- Requester y approver de ajustes deben diferir cuando la policy lo exige.
- Sensitive read y export requieren step-up, audit y scope válido.
- Revocación o stale auth invalidan acceso inmediatamente según policy.
