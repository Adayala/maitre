# Especificación — SPEC-081 Order

## Autoridad y lifecycle

Order es el agregado comercial autoritativo de una Visit. Representa la intención comercial
aceptada por el negocio y agrupa OrderItem, snapshots de catálogo y totales. Su identidad y scope
incluyen `tenantId`, `brandId`, `branchId`, `visitId` y `orderId`; tenant, brand, branch y visit
quedan congelados desde creación.

Sólo `DRAFT`, `SUBMITTED` y `CANCELLED` son estados autoritativos del agregado. Fulfillment no se
escribe manualmente en Order: se deriva desde OrderItem con esta precedencia estable:

- `DRAFT -> SUBMITTED`: submit idempotente después de revalidar catálogo y congelar snapshot.
- `SUBMITTED -> CANCELLED`: sólo cuando todos los items quedan cancelados antes de entrega.
- `IN_PREP`, `READY`, `PARTIALLY_DELIVERED` y `DELIVERED` son estados derivados de items.

Derivación, en orden de precedencia: todos cancelados = `CANCELLED`; todos terminales y al menos
uno entregado = `DELIVERED`; algún entregado = `PARTIALLY_DELIVERED`; todos los no cancelados ready
= `READY`; algún item en producción/ready = `IN_PREP`; en otro caso = `SUBMITTED`.

Order permite comandos de borrador como agregar/quitar items, reemplazar notas del agregado y
ajustar metadatos operativos no fiscales mientras permanezca en `DRAFT`. Una vez aceptado submit,
el agregado deja de admitir mutaciones destructivas; cualquier cambio posterior se expresa mediante
OrderAdjustment y revisiones nuevas, nunca reescribiendo el snapshot aprobado.

Submit recibe `catalogRevisionId` e `Idempotency-Key`. En una transacción revalida producto,
modifier, disponibilidad, precio, impuestos, moneda y restricciones. Un cambio devuelve
`409 CATALOG_CHANGED` con diferencias; no se acepta silenciosamente. Al aceptar congela snapshot,
crea unidades de producción y outbox. Cambios posteriores crean OrderAdjustment auditado.

El snapshot comercial congelado incluye para cada item y modifier: IDs de referencia, labels
resueltos, quantity, dinero exacto, tax treatment, currency, restricciones tipadas y metadatos
culinarios mínimos necesarios para producción. No depende de que el catálogo futuro conserve esos
registros.

Order conserva `subtotal`, `discountTotal`, `serviceChargeTotal`, `taxTotal`, `grandTotal` y
`balanceImpact` como dinero exacto y con currency única del agregado. Los totales comerciales deben
seguir la misma convención compartida con Catalog, Check y Fiscal, pero Order no es factura ni
autoridad fiscal y no puede sustituir Invoice ni numeración fiscal.

Cada mutación exitosa incrementa `aggregateRevision`, registra actor/causa/timestamp del servidor,
y publica outbox consistente con el agregado. Clientes usan `If-Match` o revisión esperada para
evitar lost updates. Proyecciones de tracking, KDS o bill nunca son autoridad para mutar Order.
