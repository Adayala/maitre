# Especificación — SPEC-085 DigitalBill

DigitalBill es una proyección pública versionada de Check, no un documento fiscal ni un snapshot
independiente. Cada respuesta contiene `checkRevision`, `asOf`, líneas permitidas, subtotal,
descuentos, impuestos, total, saldo y estado `OPEN | SETTLED | VOID`.

Una revisión nueva reemplaza la representación cacheable anterior sin alterar revisiones
históricas del Check. El token `BILL_READ` es opaco, hasheado at rest, revocable, expirable y no se
reutiliza para menú, order o payment. La respuesta omite Guest, instrumentos de pago, provider
references y notas internas; usa cache-control restrictivo.
