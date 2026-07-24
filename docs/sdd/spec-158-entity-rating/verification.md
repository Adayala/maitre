# Verificación — SPEC-158

## Criterios

### CAD-158-01 — Rating se define por `ScaleVersion`, dimensión y valor válido para la escala

- [ ] rating se valida contra una scale version y dimensión explícitas.

### CAD-158-02 — La normalización a `[0,1]` queda definida por versión de escala

- [ ] normalización a `[0,1]` es canónica y versionada.

### CAD-158-03 — Rating es inmutable y las correcciones crean revisiones enlazadas

- [ ] correcciones crean nueva revisión sin mutar historia.

### CAD-158-04 — Existe unicidad por feedback, dimensión y scale version dentro de una revisión

- [ ] unicidad por feedback/dimensión/escala queda preservada.

### CAD-158-05 — Tratamiento y agregados heredan privacidad desde Feedback

- [ ] herencia de tratamiento y privacy threshold se mantienen en agregados.

### CAD-158-06 — La aprobación exige evidencia de escalas, normalización y privacidad agregada

- [ ] fixtures cubren escalas, correcciones, normalización y privacidad.
