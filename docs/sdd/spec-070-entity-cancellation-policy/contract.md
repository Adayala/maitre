# Contrato — SPEC-070 CancellationPolicy

Política versionada por tenant/branch/channel con ventanas, reason codes y consecuencias
informativas. Una Reservation captura la revisión aplicada; cambios no son retroactivos.
I0 no cobra penalidades automáticamente. Evaluación recibe `asOf` y timezone, devuelve
`allowed`, classification y reason; no usa reloj global. Reglas solapadas tienen precedencia
determinista. Tests cubren boundary times/DST, snapshot, override autorizado y ausencia de
side effects de pago.
