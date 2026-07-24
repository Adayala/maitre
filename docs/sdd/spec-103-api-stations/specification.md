# Especificación — SPEC-103 Stations API

CRUD de configuración y commands `publish-routing`, `activate`, `deactivate`. Code es único por
Branch; updates usan `If-Match`. Publicar rechaza reglas ambiguas o destino inactivo.

Deactivate exige cola autoritativa vacía o plan de transferencia validado; la transferencia y el
cambio de estado son atómicos. No se acepta borrar Station con historia. Toda publicación,
reasignación y desactivación registra actor, motivo y versiones before/after.

El surface incluye create/list/detail/update de configuración, más comandos explícitos
`publish-routing`, `activate` y `deactivate`. No existe borrado duro para Stations con historia
operativa; a lo sumo se permite archivado bajo policy sin romper referencias históricas.

Las lecturas respetan scope `tenantId/brandId/branchId`; detail fuera de scope usa `404` y las
colecciones filtran antes de paginar. Los writes usan `If-Match` o revisión esperada para proteger
contra lost updates. `code` y cualquier alias operacional aprobado deben ser únicos dentro de la
Branch.

`publish-routing` valida la RoutingPolicy completa antes de activarla: rechaza reglas ambiguas,
destinos inactivos, destinations incompatibles y referencias cross-branch. `deactivate` valida
vacío autoritativo o transferencia atómica compatible, de modo que no quede trabajo activo sin
ownership definido ni estados intermedios visibles.
