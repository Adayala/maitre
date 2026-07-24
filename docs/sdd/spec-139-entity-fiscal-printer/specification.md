# Especificación — SPEC-139 FiscalPrinter

Adapter/capability opcional por Branch. Registra provider, model, device ID, capabilities,
configuration secret reference y health snapshot; secretos/SDK state quedan fuera del dominio.

No es autoridad de Invoice, numeración ni autorización ARCA y no bloquea WSFE/QR cuando la entidad
fiscal no lo requiere. Si una operación exige hardware y está offline queda job pendiente/fallido
explicable; siempre existe representación digital mínima cuando la norma lo permita.

FiscalPrinter pertenece a una `branchId` y conserva `fiscalPrinterId`, `provider`, `model`,
`deviceId`, `capabilities`, `configSecretRef`, `configVersion`, `healthSnapshot` y `status`. Puede
modelar impresora fiscal u otro dispositivo homologado según el régimen, pero no reemplaza el
dominio fiscal principal ni la autorización externa.

`ACTIVE`, `DEGRADED`, `OFFLINE` y `RETIRED` describen disponibilidad operativa del adapter. Si una
operación normativa exige hardware y el dispositivo está degradado u offline, el sistema genera un
job pendiente o fallido explicable y auditable. Cuando la norma permite alternativa digital, esa
representación mínima debe seguir siendo posible sin que el printer se convierta en un hard blocker.
