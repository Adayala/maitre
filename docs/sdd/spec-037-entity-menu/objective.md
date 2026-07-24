# Objetivo — SPEC-037

## Propósito

Representar una oferta comercial versionada por Brand/alcances, publicable como snapshot inmutable
compuesto por Categories y MenuItems que referencian Products reutilizables.

## Criterios de aceptación

### CAD-037-01 — Menu pertenece a Tenant y Brand y cada revisión posee identidad, version, currency y alcances coherentes

Menu pertenece a Tenant/Brand y cada revisión posee identidad/version, currency, vigencia y alcances
por sucursal coherentes.

### CAD-037-02 — DRAFT es editable y publicar crea snapshot inmutable moviendo el puntero activo atómicamente

DRAFT es editable; publicar crea snapshot inmutable y mueve el puntero activo atómicamente; cambios
posteriores crean nueva revisión.

### CAD-037-03 — Categories y MenuItems pertenecen al mismo Tenant y los Products referidos son elegibles

Categories/MenuItems de una revisión pertenecen al mismo Tenant y todo Product referido existe y es
elegible.

### CAD-037-04 — MenuItem congela category, product, price, tax, modifiers, posición y overrides de venta

MenuItem congela category, product, price minor units/currency, tax, modifiers, posición y overrides
necesarios para vender.

### CAD-037-05 — Revisiones activas no tienen vigencias o alcances ambiguos y ARCHIVED conserva historia

Revisiones activas no tienen vigencias/alcances ambiguos y ARCHIVED conserva orders/snapshots
históricos.

### CAD-037-06 — Publicación concurrente, contenido inválido, dinero, aislamiento y rollback del puntero poseen outcomes verificables

Publicación concurrente, contenido inválido, dinero, aislamiento y rollback del puntero poseen outcomes
verificables.
