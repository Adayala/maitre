# Contrato — SPEC-052 Check

Check es la cuenta económica de una Visit, distinta de factura fiscal. Captura line items,
ajustes, impuestos estimados, total, currency, status `OPEN | PAYMENT_PENDING | SETTLED |
VOID`, revisión y auditoría. Dinero usa precisión definida, nunca float. Totales se derivan
de snapshots de OrderItem/discount/tax y deben reconciliar. SETTLED/VOID son terminales y
correcciones crean ajustes trazables. Tests cubren rounding, split futuro no implícito,
concurrencia, void y cross-tenant.
