# Contrato de conector — SPEC-183 Accounting Software

Definir un puerto para exportar asientos, comprobantes, impuestos y cierres, e importar acuses
mediante IDs externos y cursores idempotentes. El mapping contable es versionado, explicable y
configurable sin filtrar lógica del proveedor al dominio. Tests de contrato cubren cuentas
faltantes, lote parcial, duplicados, moneda, períodos cerrados, rate limit, backfill,
reconciliación y redacción.
