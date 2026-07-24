# Objetivo — SPEC-141

Definir FiscalQrCode como derivado determinístico de Invoice AUTHORIZED con format/normative
version y payload canónico reproducible.

## Criterios de aceptación

### CAD-141-01 — La generación queda restringida a Invoice AUTHORIZED y fuentes normativas registradas

la generación queda restringida a Invoice AUTHORIZED y a normative sources registradas.

### CAD-141-02 — Canonical payload y hash producen bytes idénticos para el mismo input

canonical payload, hash y referencia a Invoice/version producen bytes idénticos para el
mismo input.

### CAD-141-03 — Campos, encoding, URL y límites provienen sólo del registry normativo

campos, encoding, URL y límites provienen del NormativeSourceRegistry, no del cliente.

### CAD-141-04 — CAE y datos fiscales se incluyen sólo según formato, nunca secretos

CAE y datos fiscales se incluyen sólo según formato; nunca secretos.

### CAD-141-05 — Cambios oficiales crean nuevas versiones sin mutar historia

cambios oficiales crean nueva versión de renderer/fixtures sin mutar representaciones
históricas.

### CAD-141-06 — La aprobación exige evidencia de encoding, determinismo y validación oficial

La aprobación exige fixtures de encoding, decimales, fechas, CAE, tamaño, determinismo y
validación oficial.
