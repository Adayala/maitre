# Verificación — SPEC-039

## Criterios

### CAD-039-01 — Product pertenece a un tenant y posee identidad, nombre, descripción, tax/dietary/media refs, ciclo de vida editorial y versión

- [ ] Product tiene alcance tenant con identidad y versión;
- [ ] tax/dietary/media refs siguen contrato;
- [ ] el ciclo de vida editorial existe y se valida.

### CAD-039-02 — Product no pertenece a una única Category; MenuItems pueden reutilizarlo con precio/posición/overrides distintos

- [ ] Product con alcance tenant puede reutilizarse en múltiples MenuItems;
- [ ] Product no pertenece a una única Category;
- [ ] los MenuItems pueden variar precio/posición/overrides sin duplicar Product.

### CAD-039-03 — Precio comercial se congela en MenuItem/publication snapshot y nunca usa float

- [ ] Product no almacena category/price/position/operational availability;
- [ ] publication snapshot no cambia al editar Product;
- [ ] el precio comercial congelado no usa float.

### CAD-039-04 — El ciclo de vida editorial `ACTIVE | ARCHIVED` no se confunde con availability/stock operativo

- [ ] archive impide nueva publicación y preserva historia;
- [ ] availability/stock operativo no viven en Product;
- [ ] el ciclo de vida editorial y la disponibilidad operativa permanecen separados.

### CAD-039-05 — Allergens/dietary/nutrition declaran provenance, vigencia y disclaimer; no se presentan como garantía médica

- [ ] declarations desconocidas/sin provenance fallan según policy;
- [ ] provenance, vigencia y disclaimer quedan trazados;
- [ ] la información no se presenta como garantía médica.

### CAD-039-06 — Media refs, validation, archival, snapshot y aislamiento tenant poseen outcomes verificables sin alterar órdenes históricas

- [ ] media/modifier refs cross-tenant se rechazan;
- [ ] archival y snapshot preservan historia;
- [ ] el aislamiento tenant posee evidencia.
