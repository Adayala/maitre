# Verificación — SPEC-022

## Criterios

### CAD-022-01 — `GET /v1/roles` devuelve catálogo visible con code, labels, permisos visibles, assignable y restricciones de alcance

- [ ] la respuesta incluye sólo campos aprobados del catálogo visible;
- [ ] `assignable` y restricciones de alcance se exponen de forma explícita;
- [ ] no se filtran assignments o memberships.

### CAD-022-02 — El orden es determinista por code y ETag/conditional GET identifica la versión exacta del catálogo

- [ ] el orden es determinista por code;
- [ ] ETag o equivalente identifica la versión del catálogo;
- [ ] conditional GET responde consistentemente.

### CAD-022-03 — `assignable=false` informa presentación pero no concede ni reemplaza la decisión server-side de delegación

- [ ] `assignable=false` sólo informa UI/presentación;
- [ ] la delegación real sigue siendo server-side;
- [ ] la respuesta no se usa como autoridad.

### CAD-022-04 — Roles deprecated se excluyen por defecto y sólo aparecen en consulta histórica autorizada

- [ ] roles deprecated no aparecen por defecto;
- [ ] la consulta histórica exige autorización;
- [ ] el contrato distingue catálogo activo vs histórico.

### CAD-022-05 — La respuesta minimiza permisos internos sensibles y no filtra assignments, memberships o datos cross-tenant

- [ ] la respuesta minimiza permisos internos sensibles;
- [ ] no expone assignments o memberships;
- [ ] no filtra datos cross-tenant.

### CAD-022-06 — No existen mutaciones de Role/Permission en I0; endpoints adicionales requieren contrato/versionado explícito antes de incorporarse

- [ ] no existen mutaciones de Role/Permission en I0;
- [ ] endpoints adicionales requieren contrato explícito;
- [ ] el versionado queda documentado antes de ampliar superficie.
