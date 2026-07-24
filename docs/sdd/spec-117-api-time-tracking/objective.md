# Objetivo — SPEC-117

Definir la API de time tracking para clock-in/out y ajustes con evidencia offline, segregación de
aprobación y preservación de marcas originales.

## Criterios de aceptación

### CAD-117-01 — Los comandos de clock y ajuste definen evidencia, source y segregación claras

comandos de clock y ajuste quedan definidos con evidencia, source y segregación de
aprobación claras.

### CAD-117-02 — El protocolo offline preserva IDs, secuencia, timezone y proof

el protocolo offline preserva command ID, device ID seudónimo, secuencia monotónica,
capturedAt, timezone y proof.

### CAD-117-03 — ReceivedAt, replay, skew y dudas de Employment convergen sin perder evidencia

receivedAt, replay detection, skew y dudas de Employment convergen sin perder evidencia.

### CAD-117-04 — `PENDING_REVIEW` captura anomalías sin confiar ciegamente en device time

`PENDING_REVIEW` captura anomalías sin descartar la marca ni confiar ciegamente en el reloj
del cliente.

### CAD-117-05 — Ajustes y períodos exportados se corrigen append-only

períodos exportados y ajustes posteriores se corrigen append-only, sin reescritura
histórica.

### CAD-117-06 — La aprobación exige evidencia de conexión intermitente, doble marcación y DST

La aprobación exige fixtures de conexión intermitente, reloj alterado, doble marcación, DST,
segregación y aislamiento.
