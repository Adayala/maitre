# Especificación — SPEC-135 Cash RBAC

Permisos: `cash.session.open/close`, `cash.movement.record/compensate`, `cash.count`,
`cash.reconciliation.submit/approve`, `discount.apply/override/manage`, `cash.report.read/export`.

CASHIER opera su sesión; MANAGER aprueba dentro de LimitsPolicy; finance/supervisor son assignments,
no roles locales. Quien registra/concilia no aprueba su propia diferencia cuando aplica
segregación. Operaciones sobre threshold requieren step-up + aprobador distinto. Sin LimitsPolicy
se deniega override/compensación riesgosa. Export y excepciones quedan auditados.

Permissions canónicas I0:

```text
cash.session.open
cash.session.close
cash.movement.record
cash.movement.compensate
cash.count
cash.reconciliation.submit
cash.reconciliation.approve
discount.apply
discount.override
discount.manage
cash.report.read
cash.report.export
```

La autorización combina Membership, branch scope, session ownership, LimitsPolicy y sensibilidad de
datos. `finance` y `supervisor` son assignments/perfiles de permisos, no roles locales con autoridad
implícita. Un CASHIER puede operar su sesión dentro de límites aprobados; MANAGER y aprobadores
separados intervienen cuando thresholds, overrides o conciliaciones lo requieren.
