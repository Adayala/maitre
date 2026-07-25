# Rules — SPEC-090

- Capability `BILL_READ` es la única autoridad pública de acceso.
- `checkRevision`, `asOf`, `lastConfirmedAt` y `freshness` son obligatorios en toda respuesta exitosa.
- Payload excluye PII, PAN/CVV, provider references y notas internas.
- Nueva revisión reemplaza la representación vigente; no se mezclan revisiones.
- La API es read-only y no concede permisos de payment/split/dispute.
- Emitir el token exige tenant + permiso + alcance por sucursal sobre el `Check`.
