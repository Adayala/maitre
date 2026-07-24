# Verificación — SPEC-005

## Criterios

### CAD-005-01 — Salon modela un área branch-scoped

- [ ] Salon requiere `tenantId` y `branchId` válidos;
- [ ] no existe fuera de una Branch;
- [ ] consultas devuelven sólo salones del scope autorizado.

### CAD-005-02 — La identidad del salón es estable y única en su sucursal

- [ ] nombre/código se normalizan según política aprobada;
- [ ] duplicado dentro de la misma Branch falla;
- [ ] el mismo nombre puede existir en otras sucursales del Tenant si así se aprueba.

### CAD-005-03 — La capacidad del salón tiene semántica explícita

- [ ] `capacity` rechaza valores inválidos;
- [ ] el contrato aclara si es límite operativo, referencia declarativa o ambos;
- [ ] la capacidad del salón no contradice silenciosamente la de sus mesas.

### CAD-005-04 — Salon organiza layout sin absorber estado dinámico

- [ ] no persiste estados derivados de ocupación, pago o limpieza;
- [ ] atributos de orden/layout quedan acotados a identidad y disposición;
- [ ] reportes derivados se resuelven fuera del agregado.

### CAD-005-05 — Table depende de Salon con consistencia same-tenant

- [ ] una mesa no puede referenciar salón de otra Branch/Tenant;
- [ ] mover mesa entre salones exige autorización y consistencia same-tenant;
- [ ] referencias cruzadas inválidas fallan en aplicación y DB cuando aplique.

### CAD-005-06 — Lifecycle y aislamiento del salón son consistentes

- [ ] sólo permite transiciones de estado declaradas;
- [ ] un salón inactivo bloquea operaciones nuevas aprobadas sobre sus mesas;
- [ ] existe evidencia enlazada en tests, migraciones y revisión.
