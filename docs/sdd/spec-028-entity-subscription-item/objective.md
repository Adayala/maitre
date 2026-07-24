# Objetivo — SPEC-028

## Propósito

Vincular una Subscription con un servicio versionado, su cantidad, alcance y configuración validada,
preservando historia y evitando habilitaciones tenant-defined arbitrarias.

## Criterios de aceptación

### CAD-028-01 — Cada item referencia `serviceCode + catalogVersion` existente y pertenece al contexto correcto

Cada item referencia `serviceCode + catalogVersion` existente y pertenece a la Subscription/Tenant
correctos.

### CAD-028-02 — Quantity, alcances por sucursal y config deben ser válidos

Quantity es positiva, los alcances por sucursal pertenecen al Tenant y config cumple el schema del servicio.

### CAD-028-03 — No existen dos items activos para la misma combinación service y alcance

No existen dos items activos para la misma combinación service/alcance.

### CAD-028-04 — Activar, modificar o desactivar usa lifecycle, vigencia, concurrencia y auditoría

Activar/modificar/desactivar usa lifecycle, vigencia, concurrencia y auditoría; no existe eliminación
de uso histórico.

### CAD-028-05 — Cambios recalculan Entitlements y reducciones incompatibles entran en remediation

Cambios recalculan Entitlements de forma determinista y una reducción incompatible entra en
remediation, no borra datos.

### CAD-028-06 — Precio o billing no deciden autorización

Precio/billing no decide autorización y queda fuera de este contrato mientras no exista catálogo
comercial aprobado.
