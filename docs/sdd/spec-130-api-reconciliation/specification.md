# Especificación — SPEC-130 Reconciliation API

Get expected summary; registrar conteos; commands `submit`, `approve`, `reject`. El servidor
recalcula contra ledger revision y devuelve ecuación/desglose; el cliente no envía expected.

Un Payment/Refund recibido después de cutoff no altera una reconciliation APPROVED. Crea
LateAdjustment en la siguiente sesión o adjustment session específica, enlazado a la original, y
emite evento propio. Reopen está prohibido por default; sólo una policy aprobada permite nueva
revisión sin mutar la aprobación histórica.
