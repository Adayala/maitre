# Objetivo — SPEC-109

Definir permisos canónicos, alcances y perfiles operativos para Kitchen sin roles locales implícitos
ni escalamiento oculto.

## Criterios de aceptación

### CAD-109-01 — Cada operación Kitchen mapea a permisos canónicos exactos

cada operación de SPEC-102–108 mapea a permisos canónicos exactos, sin wildcard.

### CAD-109-02 — La autorización combina membership, tenant, branch, station, turno y ownership

autorización combina Membership ACTIVE, tenant, branch, station, turno y ownership según
corresponda.

### CAD-109-03 — COOK, MAITRE, MANAGER y expediter son assignments, no autoridad nominal

COOK, MAITRE y MANAGER son perfiles de assignment; expediter es assignment de permisos, no
rol local.

### CAD-109-04 — Overrides, transferencias y alerts sensibles requieren controles adicionales

overrides, transferencias, reprioritization y gestión de alerts requieren controles
adicionales y auditoría.

### CAD-109-05 — Lecturas degradadas no sustituyen permisos mutativos

capacidades degradadas de lectura no sustituyen permisos mutativos cuando falta
workforce/turno.

### CAD-109-06 — La aprobación exige evidencia de allow/deny, revocación y aislamiento

La aprobación exige matrices allow/deny, revocación, autorización desactualizada, aislamiento de station,
self-grant y aislamiento entre tenants.
