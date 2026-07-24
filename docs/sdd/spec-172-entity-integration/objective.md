# Objetivo — SPEC-172

Definir Integration como instalación con alcance tenant versionada, con ownership explícito por recurso y
sin ambigüedad sobre autoridad o ciclo de vida.

## Criterios de aceptación

### CAD-172-01 — Integration queda acotada con config no secreta y secret refs explícitas

una integration queda acotada por tenant/provider/adapter version/environment con
capabilities, non-secret config y secret refs explícitas.

### CAD-172-02 — El ciclo de vida `DRAFT -> ACTIVE -> DEGRADED -> DISABLED` queda auditado

el ciclo de vida es `DRAFT -> ACTIVE -> DEGRADED -> DISABLED` con transiciones auditadas.

### CAD-172-03 — `OwnershipMatrixVersion` define direction, autoridad, conflictos y deletes

`OwnershipMatrixVersion` define por resource+field direction, autoridad
`LOCAL|REMOTE|MERGED`, conflict strategy, delete semantics y reconciliation.

### CAD-172-04 — No existe last-write-wins implícito

last-write-wins no es default y toda política de conflicto debe estar declarada.

### CAD-172-05 — Upgrade y disable preservan historia y revocan capacidad operativa futura

upgrades de config/version y disable preservan historia; disable revoca jobs/endpoints sin
borrar evidencias previas.

### CAD-172-06 — La aprobación exige evidencia de ciclo de vida, ownership, conflictos y degradación

La aprobación exige fixtures de ciclo de vida, ownership matrix, conflictos, upgrade, degrade y
disable.
