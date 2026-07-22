# Contrato de conector — SPEC-184 POS System

Definir un puerto bidireccional versionado para catálogo, órdenes, pagos y cierres con ownership
explícito por recurso y estrategia de conflictos. IDs externos se mapean sin reutilización,
cursores avanzan atómicamente y delete se representa según capacidades del proveedor. Tests
cubren backfill, duplicados, edición concurrente, eventos fuera de orden, caída parcial,
rate limit, reconciliación y aislamiento.
