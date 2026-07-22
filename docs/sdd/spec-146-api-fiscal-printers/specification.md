# Especificación — SPEC-146 Fiscal Printers API

Register/list/configure-by-secret-reference/activate/test/retire. No recibe ni devuelve secrets.
Test usa capability allowlisted, timeout/límites y nunca emite comprobante real.

Retire exige cero jobs pendientes o migración explícita. Provider errors se normalizan y no cambian
Invoice/numeración. El endpoint sólo existe si la capability está habilitada; ausencia de printer no
bloquea emisión electrónica general.
