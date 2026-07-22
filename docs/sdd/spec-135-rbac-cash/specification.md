# Especificación — SPEC-135 Cash RBAC

Permisos: `cash.session.open/close`, `cash.movement.record/compensate`, `cash.count`,
`cash.reconciliation.submit/approve`, `discount.apply/override/manage`, `cash.report.read/export`.

CASHIER opera su sesión; MANAGER aprueba dentro de LimitsPolicy; finance/supervisor son assignments,
no roles locales. Quien registra/concilia no aprueba su propia diferencia cuando aplica
segregación. Operaciones sobre threshold requieren step-up + aprobador distinto. Sin LimitsPolicy
se deniega override/compensación riesgosa. Export y excepciones quedan auditados.
