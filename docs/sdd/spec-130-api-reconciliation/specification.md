# Especificación — SPEC-130 Reconciliation API

Get expected summary; registrar conteos; commands `submit`, `approve`, `reject`. El servidor
recalcula contra ledger revision y devuelve ecuación/desglose; el cliente no envía expected.

Un Payment/Refund recibido después de cutoff no altera una reconciliation APPROVED. Crea
LateAdjustment en la siguiente sesión o adjustment session específica, enlazado a la original, y
emite evento propio. Reopen está prohibido por default; sólo una policy aprobada permite nueva
revisión sin mutar la aprobación histórica.

El surface incluye al menos detail del expected summary, carga/actualización de conteos dentro del
estado permitido y los comandos explícitos `submit`, `approve` y `reject`. No existe edición opaca
de una reconciliation aprobada ni recalculo client-side de expected como fuente de verdad.

Cada operación se apoya en la `ledgerRevision` congelada de la sesión reconciliada. Si un payment o
refund llega después de `cutoffAt`, no altera una reconciliation `APPROVED`; debe derivarse a
`LateAdjustment`, nueva sesión o adjustment session específica según policy, conservando trazabilidad
con la reconciliation original.

`reopen` está denegado por defecto. Si una policy aprobada lo habilita, el comportamiento correcto
es crear una nueva revisión o intento controlado, nunca mutar la aprobación histórica ni borrar
evidencia previa.
