# Contrato RBAC — SPEC-135 Cash

Separar permisos para abrir caja, registrar movimientos, contar, enviar, aprobar diferencias,
administrar descuentos y consultar cierres. La autorización combina permisos canónicos, tenant,
sucursal, sesión y ownership; CASHIER/MANAGER reciben assignments versionados, mientras
`supervisor`/`finance` no son roles locales. Operaciones de alto riesgo aplican segregación,
step-up y límites configurables. Tests cubren autoaprobación, escalamiento y revocación.
