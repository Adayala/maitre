# Verificación — SPEC-006

## Criterios

### CAD-006-01 — Table modela un recurso con alcance por sucursal e identidad local

- [ ] Table requiere `tenantId`, `branchId` y `salonId` coherentes;
- [ ] no existe fuera de un Salon autorizado;
- [ ] consultas devuelven sólo mesas del alcance permitido.

### CAD-006-02 — El identificador visible es único en el scope aprobado

- [ ] duplicado de `number` dentro del scope elegido falla;
- [ ] normalización de identificador visible es determinística;
- [ ] el contrato deja explícito si la unicidad es por salón o por sucursal.

### CAD-006-03 — Capacidad y atributos físicos son explícitos y validados

- [ ] `capacity` rechaza valores inválidos;
- [ ] atributos físicos usan catálogos o semánticas aprobadas;
- [ ] no existe blob abierto de layout que oculte reglas no especificadas.

### CAD-006-04 — El estado de la mesa es derivado y con precedencia declarada

- [ ] no se persiste columna de estado operativo como fuente de verdad;
- [ ] la precedencia entre `BLOCKED`, `CLEANING`, `PAYING`, `OCCUPIED`, `RESERVED` y `AVAILABLE` está declarada;
- [ ] la proyección reacciona correctamente ante ocupaciones, reservas y bloqueos.

### CAD-006-05 — Los bloqueos administrativos se distinguen de estados transitorios

- [ ] un bloqueo explícito impide asignaciones nuevas;
- [ ] limpiar o pagar no se modela como edición manual arbitraria del agregado base;
- [ ] el contrato distingue claramente entre bloqueo administrativo y estado derivado.

### CAD-006-06 — Layout, aislamiento y consistencia same-tenant son obligatorios

- [ ] mover mesa entre salones/branches inválidos falla;
- [ ] referencias cross-tenant fallan en aplicación y DB cuando aplique;
- [ ] existe evidencia enlazada en tests, migraciones y revisión.
