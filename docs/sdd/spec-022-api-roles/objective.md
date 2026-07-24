# Objetivo — SPEC-022

## Propósito

Exponer una proyección de sólo lectura y versionada del catálogo de roles para configuración de UI sin
convertir visibilidad o cache cliente en autoridad de asignación.

## Criterios de aceptación

### CAD-022-01 — `GET /v1/roles` devuelve catálogo visible con code, labels, permisos y restricciones de alcance

`GET /v1/roles` devuelve catálogo visible con code, labels, permisos visibles, assignable y
restricciones de alcance.

### CAD-022-02 — El orden es determinista por code y ETag identifica la versión exacta del catálogo

El orden es determinista por code y ETag/conditional GET identifica la versión exacta del catálogo.

### CAD-022-03 — `assignable=false` informa presentación pero no reemplaza la decisión server-side

`assignable=false` informa presentación pero no concede ni reemplaza la decisión server-side de
delegación.

### CAD-022-04 — Roles deprecated se excluyen por defecto y sólo aparecen en consulta histórica autorizada

Roles deprecated se excluyen por defecto y sólo aparecen en consulta histórica autorizada.

### CAD-022-05 — La respuesta minimiza permisos sensibles y no filtra assignments o datos cross-tenant

La respuesta minimiza permisos internos sensibles y no filtra assignments, memberships o datos
cross-tenant.

### CAD-022-06 — No existen mutaciones de rol o permiso en I0

No existen mutaciones de rol/permiso en I0; endpoints adicionales requieren contrato/versionado
explícito antes de incorporarse.
