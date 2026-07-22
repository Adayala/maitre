# Especificación — SPEC-103 Stations API

CRUD de configuración y commands `publish-routing`, `activate`, `deactivate`. Code es único por
Branch; updates usan `If-Match`. Publicar rechaza reglas ambiguas o destino inactivo.

Deactivate exige cola autoritativa vacía o plan de transferencia validado; la transferencia y el
cambio de estado son atómicos. No se acepta borrar Station con historia. Toda publicación,
reasignación y desactivación registra actor, motivo y versiones before/after.
