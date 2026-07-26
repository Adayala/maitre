# Contrato API — SPEC-103 Stations

Crear, listar, actualizar, activar y desactivar estaciones de producción dentro de una
sucursal. `code` es único por branch; `displayOrder` ordena la selección/visualización operativa.
Desactivar exige no tener Commands no terminales asignados. I0 no implementa `publish-routing`,
reasignación atómica ni `If-Match`. Tests cubren unicidad, estación con cola activa, activate /
deactivate, orden de presentación y aislamiento entre tenants.
