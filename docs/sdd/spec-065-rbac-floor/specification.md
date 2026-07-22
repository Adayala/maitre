# Especificación — SPEC-065 Floor RBAC

Permisos: visit create/move/close/reopen; occupancy manage; table status read; check read/adjust/
void/settle; payment create/capture/refund/reconcile; service period manage.

WAITER opera Visit/Check según branch/ownership, CASHIER cobra/refund dentro de LimitsPolicy,
MANAGER autoriza reopen/void/refund/force-close. COOK sólo lectura mínima si requerida. No hay roles
locales. Operaciones financieras/excepciones exigen reason, step-up/segregación y audit.
