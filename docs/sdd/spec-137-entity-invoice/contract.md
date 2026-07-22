# Contrato de entidad — SPEC-137 Invoice

Invoice representa la intención y resultado fiscal inmutable de una venta, con tenant,
entidad fiscal, punto de venta, tipo, número, moneda, receptor, totales y estado
DRAFT/PENDING/AUTHORIZED/REJECTED/CANCELLED. Tras autorización no se edita: correcciones usan
nota de crédito o débito. Tests cubren unicidad fiscal, idempotencia, precisión decimal,
transiciones, snapshots, PII, auditoría y aislamiento entre tenants.
