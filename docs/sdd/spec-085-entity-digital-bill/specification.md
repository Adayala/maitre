# Especificación — SPEC-085 DigitalBill

DigitalBill es una proyección pública versionada de Check, no un documento fiscal ni un snapshot
independiente. Cada respuesta contiene `checkRevision`, `asOf`, líneas permitidas, subtotal,
descuentos, impuestos, total, saldo y estado `OPEN | SETTLED | VOID`.

Una revisión nueva reemplaza la representación cacheable anterior sin alterar revisiones
históricas del Check. El token `BILL_READ` es opaco, hasheado at rest, revocable, expirable y no se
reutiliza para menú, order o payment. La respuesta omite Guest, instrumentos de pago, provider
references y notas internas; usa cache-control restrictivo.

DigitalBill hereda scope desde Check y Visit, pero no expone esos IDs como autoridad pública. El
payload incluye sólo las líneas y agregados necesarios para que el comensal entienda consumo y
saldo: descripciones publicables, cantidades, importes exactos, descuentos visibles, impuestos
mostrables, service charge cuando aplique y estado resumido del saldo.

Si Check emite una revisión nueva, DigitalBill anterior deja de ser la representación vigente aun
cuando siga siendo cacheable por un período corto. La resolución siempre debe declarar
`checkRevision` y `asOf` para que el cliente detecte staleness. Nunca mezcla datos de dos
revisiones en una misma respuesta.

El capability público para bill sólo habilita lectura. Cualquier acción de pago, split, propina,
disputa o descarga fiscal requiere capability o autorización distinta. Errores de capability
inválida, vencida o revocada responden sin filtrar si el bill existe o si el check pertenece a
otro tenant/branch.
