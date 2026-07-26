# Contrato RBAC — SPEC-122 Shifts

El modelo RBAC implementado hoy en workforce se basa en:

- sesión autenticada válida;
- tenant seleccionado por `X-Tenant-Id`;
- membership activa en el tenant;
- `roleIds` de la membership resueltos a permisos;
- scope de sucursales (`ALL_BRANCHES` o `SELECTED_BRANCHES`);
- ownership por `externalIdentityId` para los casos own-access.

Permisos canónicos materializados:

- `workshift:read_own`
- `workshift:plan`
- `workshift:assign`
- `time:clock`
- `time:read_own`
- `time:adjust_request`
- `time:adjust_approve`
- `time:read_sensitive`
- `time:export`
- `labor_policy:review`
- `labor_policy:manage`

El contrato actual garantiza:

- own-access para shifts/time/breaks sólo sobre resources asociados al `Employment.personRef` del
  actor;
- lectura sensible y mutaciones supervisorias sólo dentro del branch scope autorizado;
- `Employment` tratado como dato laboral sensible: su alta cae bajo `workshift:plan` y su lectura
  supervisora bajo `time:read_sensitive`;
- segregación requester/approver en ajustes de tiempo y break;
- `time:export` branch-scoped con step-up reciente, sesión vigente, motivo y evidencia auditable;
- `labor_policy:review` y `labor_policy:manage` separados de lectura sensible, export y aprobación.

No forman parte del contrato actual roles implícitos de negocio como `employee`, `supervisor` o
`payroll` con permisos automáticos. Esos nombres pueden existir como perfiles operativos, pero la
autorización efectiva la determinan los permisos explícitos resueltos desde `roleIds`.
