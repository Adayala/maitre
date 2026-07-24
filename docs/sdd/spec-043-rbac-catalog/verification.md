# Verificación — SPEC-043

## Criterios

### CAD-043-01 — Cada acción resuelve Membership ACTIVE, permiso y alcance por sucursal; un rol nominal no concede “full control”

- [ ] allow/deny por action/permiso/alcance coincide con matriz;
- [ ] rol nominal sin permiso queda denegado;
- [ ] cada decisión parte de Membership ACTIVE y alcance por sucursal.

### CAD-043-02 — Lectura publicada, lectura/escritura draft, publish, archive, product, price, tax y media son capacidades separadas

- [ ] la lectura publicada no concede lectura/escritura draft;
- [ ] publish/price/tax/archive/media se evalúan separadamente;
- [ ] las capacidades permanecen desagregadas.

### CAD-043-03 — Un actor no publica/edita alcances fuera de sus sucursales ni modifica snapshots publicados

- [ ] sucursal fuera de alcance falla sin enumeración;
- [ ] snapshot stale/publicado no se modifica;
- [ ] publish/edit fuera de sucursales permitidas falla cerrado.

### CAD-043-04 — Roles operativos sólo consumen la lectura publicada necesaria; no ven drafts ni datos editoriales no requeridos

- [ ] roles operativos no ven drafts;
- [ ] sólo consumen la lectura publicada necesaria;
- [ ] los datos editoriales no requeridos permanecen minimizados.

### CAD-043-05 — Acceso público QR usa capability opaca limitada y no Membership/GUEST ni tenant/sucursal elegidos arbitrariamente

- [ ] capability pública no permite elegir Tenant/sucursal;
- [ ] no usa Membership/GUEST como autoridad completa;
- [ ] drafts no son visibles vía acceso público.

### CAD-043-06 — Self-grant, draft leakage, cross-tenant, stale revision y acciones sensibles sin permiso/auditoría fallan cerrado

- [ ] self-grant y draft leakage fallan;
- [ ] cross-tenant permanece cerrado;
- [ ] acciones sensibles producen auditoría sanitizada.
