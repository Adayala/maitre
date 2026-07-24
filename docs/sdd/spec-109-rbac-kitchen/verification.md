# Verificación — SPEC-109

## Criterios

### CAD-109-01 — Cada operación Kitchen mapea a permissions canónicas exactas

- [ ] SPEC-102–108 mapean 1:1 a permissions canónicas aprobadas.

### CAD-109-02 — La autorización combina membership, tenant, branch, station, turno y ownership

- [ ] tenant, branch, station, shift y ownership producen matriz estable.

### CAD-109-03 — COOK, MAITRE, MANAGER y expediter son assignments, no autoridad nominal

- [ ] perfiles sin assignment válido no autorizan acciones.

### CAD-109-04 — Overrides, transferencias y alerts sensibles requieren controles adicionales

- [ ] overrides, transfer y alerts sensibles requieren reason/audit.

### CAD-109-05 — Lecturas degradadas no sustituyen permisos mutativos

- [ ] lectura degradada no sustituye permisos mutativos.

### CAD-109-06 — La aprobación exige evidencia de allow/deny, revocación y aislamiento

- [ ] fixtures cubren revocación, stale auth, self-grant y aislamiento.
