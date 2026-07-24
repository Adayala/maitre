# Objetivo — SPEC-039

## Propósito

Representar una definición con alcance tenant reutilizable de producto, separada de su colocación/precio
en Menu y de su disponibilidad/stock operativo.

## Criterios de aceptación

### CAD-039-01 — Product pertenece a un tenant y posee identidad, metadata editorial y versión

Product pertenece a un tenant y posee identidad, nombre, descripción, tax/dietary/media refs,
ciclo de vida editorial y versión.

### CAD-039-02 — Product no pertenece a una única Category y MenuItems pueden reutilizarlo

Product no pertenece a una única Category; MenuItems pueden reutilizarlo con precio/posición/overrides
distintos.

### CAD-039-03 — El precio comercial se congela en MenuItem o publication snapshot y nunca usa float

Precio comercial se congela en MenuItem/publication snapshot y nunca usa float.

### CAD-039-04 — El ciclo de vida editorial no se confunde con availability o stock operativo

El ciclo de vida editorial `ACTIVE | ARCHIVED` no se confunde con availability/stock operativo.

### CAD-039-05 — Allergens, dietary y nutrition declaran provenance, vigencia y disclaimer

Allergens/dietary/nutrition declaran provenance, vigencia y disclaimer; no se presentan como garantía
médica.

### CAD-039-06 — Media refs, validation, archival, snapshot y aislamiento tenant poseen outcomes verificables

Media refs, validation, archival, snapshot y aislamiento tenant poseen outcomes verificables sin alterar
órdenes históricas.
