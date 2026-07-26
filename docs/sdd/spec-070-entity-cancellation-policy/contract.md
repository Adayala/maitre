# Contrato — SPEC-070 CancellationPolicy

Política simple por tenant con `name`, `hoursBeforeStartCutoff` y `feeDescription` opcional.
Una evaluación recibe `startAt` y `asOf`, devuelve `allowed: true`, la marca
`withinFreeCancellationWindow` y una `reason` mínima. I0 no usa timezone explícita, no tiene
versionado/override/snapshot y no produce side effects de pago. Tests cubren upsert por tenant y
clasificación dentro/fuera de la ventana libre.
