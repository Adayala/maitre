# Verificación — SPEC-080

## Criterios

### CAD-080-01 — Cada operación de reservas mapea a un permiso exacto

- [ ] cada ruta/comando posee exactamente un permiso aprobado.

### CAD-080-02 — La autorización combina membership, permiso, alcance y revisión vigentes

- [ ] Membership/permiso/revisión/alcance producen matriz estable.

### CAD-080-03 — Los labels de rol no otorgan autoridad por sí mismos

- [ ] un label de rol sin assignment queda denegado.

### CAD-080-04 — Las acciones sobre PII y operaciones sensibles tienen controles dedicados

- [ ] PII/bulk/merge/export/anonymize/override aplican controles adicionales.

### CAD-080-05 — Las capabilities públicas son opacas y no equivalen a membership

- [ ] capability sólo sirve para acción/recurso/expiry/replay aprobados.

### CAD-080-06 — La aprobación exige evidencia de allow/deny, no enumeración y aislamiento

- [ ] self-grant, autorización desactualizada, `404`, auditoría y aislamiento entre tenants/sucursales fallan cerrado.
