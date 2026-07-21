# Contrato RBAC — SPEC-122 Shifts

Separar permisos para consultar turnos propios, planificar, asignar, fichar, corregir jornadas,
aprobar ajustes y consultar agregados laborales. La autorización combina rol, tenant, sucursal,
relación laboral y ownership; quien solicita un ajuste no puede aprobarlo cuando la política
exige segregación. Tests matriciales cubren employee, supervisor, manager, payroll y admin,
escalamiento horizontal y vertical, y revocación inmediata.
