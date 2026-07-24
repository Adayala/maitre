# Verificación — SPEC-097

## Criterios

### CAD-097-01 — Cada operación de Ordering mapea a permisos canónicos exactos

- [ ] SPEC-087–096 mapean 1:1 a permisos canónicos aprobados.

### CAD-097-02 — La autorización combina membership, scope operativo y ownership

- [ ] tenant, sucursal, shift, station y ownership producen matriz estable.

### CAD-097-03 — Los labels WAITER/COOK/CASHIER/MANAGER no otorgan autoridad por nombre

- [ ] perfiles sin assignment válido no autorizan operaciones.

### CAD-097-04 — Las capabilities públicas permanecen separadas del membership interno

- [ ] capabilities públicas permanecen separadas de Membership interno.

### CAD-097-05 — Excepciones y reasignaciones requieren controles adicionales y auditoría

- [ ] overrides, cancelación preparada y reasignación requieren motivo y auditoría.

### CAD-097-06 — La aprobación exige evidencia de allow/deny, revocación y aislamiento

- [ ] fixtures cubren revocación, stale auth, self-grant y aislamiento.
