# Contrato API — SPEC-103 Stations

Crear, listar, actualizar, activar y desactivar estaciones de producción dentro de una
sucursal. Nombre y código son únicos por branch; desactivar exige no dejar trabajo activo
sin destino y toda reasignación es explícita y auditada. If-Match protege actualizaciones.
Tests cubren unicidad, concurrencia, estación con cola, reasignación atómica, autorización,
orden de presentación y aislamiento entre tenants.
