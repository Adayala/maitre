# Contrato RBAC — SPEC-122 Shifts

Separar permisos para consultar turnos propios, planificar, asignar, fichar, corregir jornadas,
aprobar ajustes y consultar agregados laborales. La autorización combina permisos, tenant,
sucursal, Employment y ownership; quien solicita un ajuste no puede aprobarlo cuando la política
exige segregación. `employee`, `supervisor` y `payroll` son assignments, no roles locales. Tests
cubren matriz de permisos, escalamiento y revocación inmediata.
