# Contrato — SPEC-081 Order

Order agrega items solicitados dentro de Visit y conserva snapshots comerciales. Status:
`DRAFT | SUBMITTED | ACCEPTED | IN_PREP | READY | DELIVERED | CANCELLED`. Submit es comando
idempotente y congela revisión; modificaciones posteriores crean comandos/ajustes auditados.
Tenant/branch/visit son inmutables. Total no es autoridad fiscal. Tests cubren lifecycle,
doble submit, cancel parcial, concurrencia, catálogo cambiado y cross-tenant.
