# Objetivo — SPEC-070

## Propósito

CancellationPolicy define, por versión y contexto, cómo clasificar una cancelación sin
ejecutar cobros ni modificar retroactivamente Reservations confirmadas.

## Resultado esperado

### CAD-070-01 — Cada versión de policy conserva alcance, vigencia y reglas ordenadas

Cada versión posee tenant, sucursal/default, channel, effective interval, timezone, reglas
ordenadas y revisión.

### CAD-070-02 — Las reservations confirmadas congelan su policy version

Reservation congela la policy version aplicable al confirmar y cambios posteriores no son
retroactivos.

### CAD-070-03 — Evaluate es una función pura y explicable

evaluate es pura para Reservation snapshot y `asOf`, y devuelve allowed, classification,
motivo y consecuencias informativas explicables.

### CAD-070-04 — Reglas solapadas y bordes temporales se resuelven determinísticamente

precedencia y bordes temporales/DST son deterministas ante reglas solapadas.

### CAD-070-05 — I0 clasifica cancelaciones sin ejecutar cobros ni overrides implícitos

I0 no cobra penalidades; override es un artefacto separado, autorizado, acotado, expirable
y auditable.

### CAD-070-06 — La aprobación exige evidencia de snapshots, boundaries y aislamiento

La aprobación exige fixtures de activación, snapshots, boundaries, override, concurrencia,
ausencia de side effects y aislamiento.
