# Especificación — SPEC-022

## Endpoints

### `GET /v1/roles`

Lista la proyección visible del catálogo según `contract.md`. Soporta filtros `assignable` y
`status`, orden estable por code y conditional GET mediante ETag.

## Fuera de alcance I0

- `POST`, `PATCH` o `DELETE` de roles/permisos;
- detalle por ID separado;
- listado global irrestricto de permisos;
- asignación de Role a Membership.

Agregar `GET /v1/roles/{code}` o un catálogo de permissions requiere especificar autorización,
redacción, versionado y compatibilidad; no se infiere de este documento.
