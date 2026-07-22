# Especificación — SPEC-172 Integration

Instalación tenant-scoped: provider/adapter version, environment, capabilities, non-secret config,
secret references, OwnershipMatrixVersion y lifecycle `DRAFT -> ACTIVE -> DEGRADED -> DISABLED`.

OwnershipMatrix define por resource+field: direction, authority `LOCAL|REMOTE|MERGED`, conflict
strategy, delete semantics y reconciliation. Last-write-wins no es default. Config/version upgrade
es auditado; disable revoca jobs/endpoints y preserva historia.
