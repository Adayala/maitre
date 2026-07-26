# Especificación — SPEC-070 CancellationPolicy

I0 actual: una única policy simple por tenant. No hay versionado por sucursal/canal, intervalos de
vigencia, ni reglas múltiples con precedencia. El modelo sólo expresa un cutoff en horas antes del
inicio y una descripción informativa de cargo potencial.

`evaluateCancellation(policy, startAt, asOf)` es pura y usa sólo timestamps absolutos. Devuelve
si la cancelación cae dentro de la ventana libre (`withinFreeCancellationWindow`) y una reason
canónica mínima (`NO_POLICY`, `WITHIN_WINDOW`, `PAST_CUTOFF`).

La policy se crea o reemplaza por tenant como registro único. Reservation puede referenciar
`cancellationPolicyId`, pero este I0 no congela snapshots de policy al confirmar ni conserva
historial de revisiones aplicadas.

No existe `CancellationOverride` ni workflow de aprobación. I0 nunca bloquea la cancelación ni
cobra penalidad automáticamente: la evaluación es sólo informativa.
