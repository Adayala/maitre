# Objetivo — SPEC-018

## Propósito

Definir un catálogo versionado de roles que agrupe permissions canónicas para Membership sin
convertir nombres visibles, claims del proveedor o wildcards persistidos en autoridad.

## Resultados esperados

- Los códigos iniciales son `OWNER`, `ADMIN`, `MANAGER`, `MAITRE`, `WAITER`, `COOK`, `CASHIER` y
  `GUEST`.
- Los códigos son ASCII, estables e inmutables; “MAÎTRE” puede ser una etiqueta localizada.
- Cada versión del catálogo determina permissions, delegabilidad y estado.
- La autorización evalúa permisos efectivos y alcance, no el nombre del rol.

## Criterios de aceptación

### CAD-018-01 — El catálogo posee códigos únicos en mayúsculas ASCII y una versión estable

El catálogo posee códigos únicos en mayúsculas ASCII y una versión estable.

### CAD-018-02 — Todo código de permiso referenciado existe y un código desconocido falla cerrado

Todo código de permiso referenciado existe y un código desconocido falla cerrado.

### CAD-018-03 — OWNER no se concede por invitación común ni se delega autoridad superior a la propia

OWNER no se concede mediante invitación común y ningún actor delega autoridad superior a la propia.

### CAD-018-04 — GUEST no habilita operación interna y los roles funcionales respetan el alcance de Membership

GUEST no habilita operación interna y los roles funcionales siempre respetan el alcance de
tenant/sucursal de Membership.

### CAD-018-05 — Desactivar o deprecar un rol conserva asignaciones históricas y exige migración explícita

Desactivar/deprecar un rol conserva asignaciones históricas y exige sucesor o migración explícita.

### CAD-018-06 — Cambios de permisos actualizan versión, matrices y auditoría sin CRUD tenant libre

Cambios de permisos actualizan versión, matrices y evidencia de auditoría sin CRUD tenant libre.
