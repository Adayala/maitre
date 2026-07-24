# Verificación — SPEC-032

## Criterios

### CAD-032-01 — `GET /v1/entitlements` deriva tenant/contexto server-side y nunca acepta un tenantId arbitrario como autoridad

- [ ] deriva tenant/contexto server-side;
- [ ] no acepta tenantId arbitrario como autoridad;
- [ ] filtros y alcances por sucursal no exponen otros tenants.

### CAD-032-02 — La respuesta unifica Entitlements tipados y Quotas asociadas por code/alcance sin mezclar capacidad con consumo

- [ ] la respuesta separa capacidad efectiva de consumo por code/alcance;
- [ ] Quota enlaza Entitlement/reconciliation sin duplicar límite;
- [ ] la respuesta distingue claramente autorización de uso.

### CAD-032-03 — Filtros code/alcance por sucursal, orden estable y ETag identifican una revisión de cálculo exacta

- [ ] filtros permitidos responden de forma estable;
- [ ] el orden es estable;
- [ ] ETag/conditional GET corresponde a una revisión de cálculo.

### CAD-032-04 — Ausencia, suspensión y fuente desactualizada se representan explícitamente; no se infiere unlimited ni se amplía capacidad

- [ ] LIMITED/UNLIMITED/DENIED y absent son distinguibles;
- [ ] fuente desactualizada o suspendida no amplía capacidad;
- [ ] absence no se interpreta como unlimited.

### CAD-032-05 — La proyección puede servir a UI/cache, pero toda mutación consulta la fuente autoritativa y revalida Quota

- [ ] la proyección sirve a UI/cache como vista informativa;
- [ ] mutaciones revalidan contra fuente autoritativa;
- [ ] la respuesta no se usa como admisión definitiva.

### CAD-032-06 — Redacción, conditional GET, alcances y aislamiento entre tenants poseen evidencia sin exponer términos comerciales innecesarios

- [ ] terms/pricing internos permanecen minimizados;
- [ ] conditional GET y alcances poseen evidencia contractual;
- [ ] el aislamiento entre tenants sigue protegido.
