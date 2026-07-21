# VERIFICATION — SPEC-145

## Factura electrónica

- [ ] Maitre obtiene un Ticket de Acceso válido en homologación sin exponer la clave privada.
- [ ] Emite al menos una factura y una nota de crédito con CAE.
- [ ] Consulta un comprobante autorizado y obtiene el mismo resultado persistido.
- [ ] Un reintento después de timeout no duplica numeración ni comprobantes.
- [ ] Las tablas y puntos de venta se obtienen de ARCA, no de valores fijos.

## Libro IVA Digital

- [ ] Los archivos cumplen el diseño oficial vigente, codificación y límites de tamaño.
- [ ] Totales de ventas/compras coinciden con el ledger fiscal del período.
- [ ] El paquete se importa correctamente en Portal IVA.
- [ ] Maitre distingue claramente `exportado` de `presentado`.
- [ ] La confirmación de presentación queda auditada.

## Seguridad y operación

- [ ] Credenciales aisladas por tenant, CUIT y ambiente.
- [ ] Logs sin certificados, claves, token ni sign.
- [ ] Alarmas para vencimiento de certificado y fallas/rechazos de ARCA.
- [ ] Runbook para indisponibilidad, rechazo y recuperación.
