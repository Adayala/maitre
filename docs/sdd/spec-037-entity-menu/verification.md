# Verificación — SPEC-037

## Criterios

### CAD-037-01 — Menu pertenece a Tenant/Brand y cada revisión posee identidad/versión, currency, vigencia y alcances por sucursal coherentes

- [ ] Menu/revision/alcances pertenecen al Tenant/Brand correctos;
- [ ] cada revisión conserva identidad, versión y currency coherentes;
- [ ] vigencia y alcances por sucursal inconsistentes se rechazan.

### CAD-037-02 — DRAFT es editable; publicar crea snapshot inmutable y mueve el puntero activo atómicamente; cambios posteriores crean nueva revisión

- [ ] DRAFT cambia sin alterar PUBLISHED anterior;
- [ ] publicación válida congela snapshot y mueve el puntero atómicamente;
- [ ] cambios posteriores crean nueva revisión y no mutan la publicada.

### CAD-037-03 — Categories/MenuItems de una revisión pertenecen al mismo Tenant y todo Product referido existe y es elegible

- [ ] Categories/MenuItems pertenecen al mismo Tenant/revisión;
- [ ] Product referido existe y es elegible;
- [ ] refs inválidas o de otro tenant fallan cerrado.

### CAD-037-04 — MenuItem congela category, product, price minor units/currency, tax, modifiers, posición y overrides necesarios para vender

- [ ] MenuItem congela price/tax/modifiers y Product refs;
- [ ] price usa minor units/currency y no float;
- [ ] posición y overrides necesarios quedan fijados en el snapshot.

### CAD-037-05 — Revisiones activas no tienen vigencias/alcances ambiguos y ARCHIVED conserva orders/snapshots históricos

- [ ] alcances/vigencias ambiguos se rechazan;
- [ ] ARCHIVED conserva orders y snapshots históricos;
- [ ] el ciclo de vida no pierde historia comercial.

### CAD-037-06 — Publicación concurrente, contenido inválido, dinero, aislamiento y rollback del puntero poseen outcomes verificables

- [ ] publicación inválida no mueve el puntero;
- [ ] concurrencia y publicación desactualizada siguen outcomes contractuales;
- [ ] aislamiento y rollback del puntero poseen evidencia.
