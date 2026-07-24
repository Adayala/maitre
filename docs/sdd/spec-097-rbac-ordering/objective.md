# Objetivo — SPEC-097

Definir permisos canónicos, alcances y perfiles operativos para Ordering y Kitchen sin roles
nominales implícitos ni escalamiento oculto.

## Criterios de aceptación

### CAD-097-01 — Cada operación de Ordering mapea a permisos canónicos exactos

cada operación de SPEC-087–096 mapea a permisos canónicos exactos, sin wildcard.

### CAD-097-02 — La autorización combina membership, alcance operativo y ownership

autorización combina Membership ACTIVE, permiso, tenant, branch, turno, station y
ownership según corresponda.

### CAD-097-03 — Los labels WAITER/COOK/CASHIER/MANAGER no otorgan autoridad por nombre

WAITER, COOK, CASHIER y MANAGER son perfiles de assignment, no autoridad nominal por
nombre.

### CAD-097-04 — Las capabilities públicas permanecen separadas del membership interno

capabilities públicas quedan separadas de roles internos y no sustituyen Membership.

### CAD-097-05 — Excepciones y reasignaciones requieren controles adicionales y auditoría

excepciones, cancelación preparada, overrides y reasignaciones requieren controls
adicionales y auditoría.

### CAD-097-06 — La aprobación exige evidencia de allow/deny, revocación y aislamiento

La aprobación exige matrices allow/deny, revocación, stale auth, self-grant, station
isolation y cross-tenant.
