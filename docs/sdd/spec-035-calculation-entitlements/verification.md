# Verificación — SPEC-035

## Criterios

### CAD-035-01 — El cálculo recibe inputs versionados y `asOf` explícito; no consulta reloj, red, billing ni estado global oculto

- [ ] mismos inputs/asOf producen mismo output/order/revision;
- [ ] no consulta reloj, red, billing ni estado global oculto;
- [ ] inputs y `asOf` quedan explicitados.

### CAD-035-02 — Sólo Subscription/items vigentes y alcances pertenecientes al tenant participan; input inválido o cross-tenant falla cerrado

- [ ] item expirado/inactivo no contribuye;
- [ ] config/type/alcance inválido falla cerrado;
- [ ] cross-tenant queda excluido.

### CAD-035-03 — Cada entitlement code define tipo, agregación y precedence; nunca se suman cantidades ni mezclan LIMITED/UNLIMITED/DENIED implícitamente

- [ ] aggregation de cada code sigue catálogo;
- [ ] unlimited/denied siguen precedence aprobada;
- [ ] no se mezclan tipos implícitamente.

### CAD-035-04 — Overrides requieren autoridad, motivo, vigencia y alcance; expiry los excluye sin editar historia

- [ ] override ausente/no autorizado/expirado no amplía capacidad;
- [ ] authority, motivo y vigencia quedan trazadas;
- [ ] expiry excluye sin editar historia.

### CAD-035-05 — Mismo input canónico produce el mismo set lógico, source refs, revision y orden; reemplazo de proyección es atómico

- [ ] output contiene source refs/hashes;
- [ ] el set lógico, la revision y el orden son determinísticos;
- [ ] reducción reemplaza proyección sin ventana stale.

### CAD-035-06 — Vacío, suspensión, solapamiento, reducción, config inválida, unlimited, override y aislamiento poseen fixtures esperadas

- [ ] output no incluye Quota/used;
- [ ] vacío, suspensión, solapamiento y reducción tienen fixtures esperadas;
- [ ] payload sensible e aislamiento quedan excluidos/cubiertos.
