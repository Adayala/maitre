# Verificación — SPEC-155

## Criterios

### CAD-155-01 — FiscalPointOfSale queda identificado por scope oficial y checkpoint por tipo

- [ ] punto de venta fiscal queda identificado y versionado por scope oficial.

### CAD-155-02 — La numeración se serializa por pointOfSale + voucherType sin intents incompatibles

- [ ] la numeración se serializa por secuencia sin intents incompatibles.

### CAD-155-03 — AuthorizationIntent conserva candidate number e identidad idempotente estable

- [ ] AuthorizationIntent conserva candidate number e identidad idempotente estable.

### CAD-155-04 — Timeout ambiguo bloquea avance hasta reconciliación sin reutilizar números

- [ ] timeout ambiguo bloquea avance hasta reconciliación sin reutilizar números.

### CAD-155-05 — Sólo el último autorizado remoto actualiza checkpoint; divergencias bloquean

- [ ] sólo el checkpoint remoto autorizado actualiza la secuencia y divergencias bloquean.

### CAD-155-06 — La aprobación exige evidencia de serialización, timeout ambiguo y divergencia

- [ ] fixtures cubren concurrencia, divergencia, vigencias y reintentos idempotentes.
