# Reglas — SPEC-146

- La API jamás recibe ni devuelve secretos; usa referencias aprobadas.
- `test` no puede emitir comprobantes reales ni consumir numeración fiscal.
- `retire` requiere cola vacía o migración explícita.
- Errores del proveedor se normalizan y no alteran autoridad fiscal.
- Ausencia o degradación de printer no invalida por sí sola la emisión electrónica general.
