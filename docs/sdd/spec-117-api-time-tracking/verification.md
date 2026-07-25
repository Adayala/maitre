# Verificación — SPEC-117

## Criterios

### CAD-117-01 — Los comandos de clock y ajuste definen evidencia, source y segregación claras

- [x] comandos de clock/ajuste y segregación de aprobación son inequívocos.

### CAD-117-02 — El protocolo offline preserva IDs, secuencia, timezone y proof

- [x] protocolo offline preserva IDs, secuencia, timezone y proof correctamente.

### CAD-117-03 — ReceivedAt, replay, skew y dudas de Employment convergen sin perder evidencia

- [x] replay, skew y Employment dudoso convergen sin perder evidencia.

### CAD-117-04 — `PENDING_REVIEW` captura anomalías sin confiar ciegamente en device time

- [x] `PENDING_REVIEW` captura anomalías sin descartar ni sobreconfiar en device time.

### CAD-117-05 — Ajustes y períodos exportados se corrigen append-only

- [x] ajustes retroactivos preservan historia y períodos exportados.
- [x] self-access sólo puede leer `TimeEntry`/`TimeAdjustment` propios.
- [x] representaciones self-access de `TimeAdjustment` ocultan `requesterId`, `approverId` y
  `evidence`.
- [x] supervisor writes (`clock-in`, `clock-out`, `request/approve/reject adjustment`) respetan
  `branchScope` y responden `404` fuera de sucursales asignadas.
- [x] `clock-out` valida la sucursal real del `OPEN TimeEntry`, incluso cuando el `Employment`
  es elegible para múltiples sucursales.

### CAD-117-06 — La aprobación exige evidencia de conexión intermitente, doble marcación y DST

- [x] fixtures cubren conexión intermitente, doble marcación, DST y segregación.
