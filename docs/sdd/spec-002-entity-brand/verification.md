# Verificación — SPEC-002

## Criterios

### CAD-002-01 — Brand modela identidad comercial con alcance tenant

- [ ] Brand requiere `tenantId` válido y no existe fuera de ese alcance;
- [ ] acepta nombre y assets opcionales válidos;
- [ ] no embebe usuarios, sucursales ni recursos hijos;
- [ ] consultas y lecturas devuelven únicamente marcas del tenant autorizado.

### CAD-002-02 — `slug` es estable, normalizado y único dentro del tenant

- [ ] normalización produce valores determinísticos;
- [ ] duplicado de `slug` dentro del mismo tenant falla;
- [ ] el mismo `slug` puede existir en tenants distintos;
- [ ] cambios de nombre no rompen unicidad ni trazabilidad aprobada.

### CAD-002-03 — Los defaults de marca son explícitos y acotados

- [ ] los defaults aprobados están modelados con campos claros o referencias explícitas;
- [ ] no existe `config` JSON abierto para decisiones de dominio no revisadas;
- [ ] sucursal sólo hereda lo declarado por contrato;
- [ ] overrides de sucursal no mutan retrospectivamente la marca.

### CAD-002-04 — Brand no absorbe menús, fiscalidad ni capacidades

- [ ] Brand no guarda menú completo, certificados, KMS material, cuotas ni entitlements;
- [ ] referencias a otros agregados usan IDs explícitos y same-tenant cuando aplica;
- [ ] el contrato distingue referencias de ownership.

### CAD-002-05 — El ciclo de vida comercial es consistente y restrictivo al archivar

- [ ] sólo permite transiciones declaradas;
- [ ] `ARCHIVED` bloquea cambios operativos nuevos;
- [ ] lecturas históricas siguen disponibles según autorización;
- [ ] timestamps se almacenan como `timestamptz` y UTC.

### CAD-002-06 — Cambios en Brand conservan aislamiento, auditoría y publicación de eventos

- [ ] User de Tenant A no lista, lee ni modifica Brand de Tenant B;
- [ ] creación y mutaciones registran auditoría;
- [ ] `BrandCreated` o evento equivalente se persiste atómicamente con outbox;
- [ ] existe evidencia enlazada en tests, migraciones y revisión.
