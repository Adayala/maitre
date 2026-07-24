# Especificación — SPEC-087 Orders API

- `POST /v1/visits/{visitId}/orders` crea DRAFT; ignora/rechaza importes del cliente.
- `POST /v1/orders/{id}/submit` revalida catálogo y congela snapshot en forma idempotente.
- `POST /v1/orders/{id}/cancel` cancela sólo cantidades elegibles mediante OrderAdjustment.
- GET list/detail aplica alcance tenant/sucursal/visit y redacción.

Create/submit requieren `Idempotency-Key`; comandos requieren `If-Match`. El servidor devuelve
`409 CATALOG_CHANGED` con diferencias, `409` por conflicto idempotente, `412` por revisión y `422`
por transición. Submit crea KitchenTicket + outbox en la misma unidad transaccional.

El create acepta únicamente datos de intención comercial: `visitId`, items, modifiers, notas
permitidas y metadatos operativos aprobados. El servidor ignora o rechaza subtotal, impuestos,
descuentos, currency, station routing y cualquier total calculado por el cliente. La respuesta
declara `orderId`, `aggregateRevision`, estado autoritativo y snapshot calculado.

List y detail respetan `tenantId`, `brandId`, `branchId` y `visitId` derivados de auth o de la
ruta autorizada. Fuera de alcance, detail devuelve `404`; las colecciones filtran antes de paginar.
La redacción omite PII innecesaria y datos internos de cocina o pago no autorizados para el actor.

`POST /v1/orders/{id}/cancel` no borra la orden ni reescribe items: ejecuta cancelación elegible
por quantities o por agregado según policy, produciendo OrderAdjustment auditado. Si existen items
no cancelables por estado productivo o restricciones de pago, la API responde `422` o `409`
tipado sin cancelar parcialmente en silencio.
