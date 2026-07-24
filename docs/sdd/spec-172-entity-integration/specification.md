# Especificación — SPEC-172 Integration

Instalación tenant-scoped: provider/adapter version, environment, capabilities, non-secret config,
secret references, OwnershipMatrixVersion y lifecycle `DRAFT -> ACTIVE -> DEGRADED -> DISABLED`.

OwnershipMatrix define por resource+field: direction, authority `LOCAL|REMOTE|MERGED`, conflict
strategy, delete semantics y reconciliation. Last-write-wins no es default. Config/version upgrade
es auditado; disable revoca jobs/endpoints y preserva historia.

La entidad incluye `integrationId`, `tenantId`, `provider`, `adapterVersion`, `environment`,
`capabilities`, `nonSecretConfig`, `secretRefs`, `ownershipMatrixVersion`, `status`,
`degradedReason?`, `createdAt`, `updatedAt`, `disabledAt?` y `revision`. La instalación no representa
por sí sola un sync activo; expresa la configuración y autoridad declarada del conector.

`DEGRADED` modela funcionamiento parcial con restricciones conocidas, sin asumir caída total. La
matriz de ownership debe poder responder para cada campo quién es autoridad, cómo se resuelven
conflictos y qué ocurre con borrados o reconciliaciones, evitando defaults implícitos peligrosos.
