# Contrato API — SPEC-022

## Operación

`GET /v1/roles` devuelve el catálogo activo visible para el actor y tenant. Es read-only;
crear/modificar roles queda fuera de I0.

## Respuesta

Cada item contiene `code`, `name`, `description`, permissions visibles, `assignable` y
restricciones de scope. La API puede ocultar permisos internos sensibles; el servidor sigue
siendo autoridad aunque el cliente cachee el catálogo.

Filtros opcionales: `assignable=true`, `status`. Orden determinista por `code`; soporta
ETag/conditional GET. No requiere paginación mientras el catálogo sea acotado, pero la
respuesta mantiene envelope de SPEC-215.

## Reglas y aceptación

- Un actor ve un rol aunque no pueda asignarlo, pero `assignable=false` explica la UI.
- Respuesta nunca convierte visibilidad en permiso de delegación.
- Roles deprecated se excluyen por defecto y pueden consultarse para historia autorizada.
- Tests cubren OWNER/ADMIN/MANAGER, cache/ETag, catálogo vacío/versionado y ausencia de
  filtración cross-tenant.
