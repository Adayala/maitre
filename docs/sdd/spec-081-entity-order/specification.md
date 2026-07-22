# Especificación — SPEC-081 Order

## Autoridad y lifecycle

Order es el agregado comercial de una Visit. Tenant, branch y visit son inmutables. Sólo `DRAFT`
y `SUBMITTED` son estados comandables del agregado; fulfillment se determina desde OrderItem:

- `DRAFT -> SUBMITTED`: submit idempotente después de revalidar catálogo y congelar snapshot.
- `SUBMITTED -> CANCELLED`: sólo cuando todos los items quedan cancelados antes de entrega.
- `IN_PREP`, `READY`, `PARTIALLY_DELIVERED` y `DELIVERED` son estados derivados de items.

Derivación, en orden de precedencia: todos cancelados = `CANCELLED`; todos terminales y al menos
uno entregado = `DELIVERED`; algún entregado = `PARTIALLY_DELIVERED`; todos los no cancelados ready
= `READY`; algún item en producción/ready = `IN_PREP`; en otro caso = `SUBMITTED`.

## Submit y cambios

Submit recibe `catalogRevisionId` e `Idempotency-Key`. En una transacción revalida producto,
modifier, disponibilidad, precio, impuestos, moneda y restricciones. Un cambio devuelve
`409 CATALOG_CHANGED` con diferencias; no se acepta silenciosamente. Al aceptar congela snapshot,
crea unidades de producción y outbox. Cambios posteriores crean OrderAdjustment auditado.

Order conserva totales comerciales bajo la convención compartida con Catalog/Check/Fiscal, pero
no es factura ni autoridad fiscal.
