# Contrato RBAC — SPEC-122 Shifts

Separar permisos para consultar turnos propios, planificar, asignar, fichar, corregir jornadas,
aprobar ajustes y consultar agregados laborales. `Employment` se trata como dato laboral sensible:
su alta cae bajo `workshift.plan` y su lectura supervisora bajo `time.read_sensitive`. La
autorización combina permisos, tenant, sucursal, Employment y ownership; quien solicita un ajuste
no puede aprobarlo cuando la política exige segregación. `employee`, `supervisor` y `payroll` son
assignments, no roles locales. Tests cubren matriz de permisos, escalamiento y revocación
inmediata. `time.export` exige step-up, evidencia auditable y ejecución asíncrona branch-scoped.
`labor_policy.review/manage` gobiernan policy laboral, pero no sustituyen permisos de lectura
sensible, export ni aprobación.
