# Verificación — SPEC-151

## Criterios

### CAD-151-01 — El nombre canónico publicable es `fiscal.invoice.validated.v1`

- [ ] el nombre canónico publicable es `fiscal.invoice.validated.v1`.

### CAD-151-02 — El evento se emite sólo en `DRAFT -> VALIDATED`

- [ ] el evento se emite sólo en la transición `DRAFT -> VALIDATED`.

### CAD-151-03 — El payload sigue el envelope común con campos fiscales mínimos

- [ ] el payload incluye envelope común y campos fiscales mínimos requeridos.

### CAD-151-04 — El evento omite PII y payloads fiscales sensibles no necesarios

- [ ] PII y payloads sensibles quedan excluidos.

### CAD-151-05 — Revalidaciones emiten revisiones superiores preservando orden y dedupe

- [ ] revalidaciones emiten revisiones superiores sin duplicados lógicos.

### CAD-151-06 — La aprobación exige evidencia de naming, revisiones y compatibilidad legacy

- [ ] fixtures cubren naming, transiciones, revisiones y compatibilidad legacy.
