# Rules — SPEC-085

- `checkRevision` y `asOf` son obligatorios en toda representación pública.
- Capability `BILL_READ` es opaca, hasheada y separada de menu/order/payment capabilities.
- Payload excluye PII, PAN/CVV, provider references, notas internas y credenciales.
- Nueva revisión de Check reemplaza la representación vigente; no se mezclan revisiones.
- DigitalBill no es comprobante fiscal ni autoridad para mutaciones comerciales.
- Respuestas inválidas/revocadas/vencidas usan política anti-enumeración y cache restrictivo.
