# Especificación — SPEC-139 FiscalPrinter

Adapter/capability opcional por Branch. Registra provider, model, device ID, capabilities,
configuration secret reference y health snapshot; secretos/SDK state quedan fuera del dominio.

No es autoridad de Invoice, numeración ni autorización ARCA y no bloquea WSFE/QR cuando la entidad
fiscal no lo requiere. Si una operación exige hardware y está offline queda job pendiente/fallido
explicable; siempre existe representación digital mínima cuando la norma lo permita.
