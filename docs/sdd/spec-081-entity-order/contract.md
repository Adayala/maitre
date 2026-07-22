# Contrato — SPEC-081 Order

Order agrega items solicitados dentro de Visit y conserva snapshots comerciales. `DRAFT`,
`SUBMITTED` y `CANCELLED` son estados autoritativos; preparación, readiness y entrega se derivan
determinísticamente de OrderItem. Submit es idempotente, revalida catálogo y congela revisión;
modificaciones posteriores crean ajustes auditados. Tenant/branch/visit son inmutables. Total no
es autoridad fiscal. Tests cubren derivación, doble submit, cancel parcial, catálogo cambiado y
cross-tenant.
