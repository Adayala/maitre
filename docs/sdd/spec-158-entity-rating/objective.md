# Objetivo — SPEC-158

Definir Rating como observación estructurada e inmutable sobre feedback, normalizable entre escalas
y segura para agregación sin filtrar identidad.

## Criterios de aceptación

### CAD-158-01 — Rating se define por `ScaleVersion`, dimensión y valor válido para la escala

rating se define por `ScaleVersion`, dimensión y valor entero o categórico válido para esa
escala.

### CAD-158-02 — La normalización a `[0,1]` queda definida por versión de escala

la normalización canónica a `[0,1]` queda definida por versión de escala y mapping
explícito para escalas categóricas.

### CAD-158-03 — Rating es inmutable y las correcciones crean revisiones enlazadas

rating es inmutable; correcciones crean una revisión enlazada con reason y no mutan el
valor histórico.

### CAD-158-04 — Existe unicidad por feedback, dimensión y scale version dentro de una revisión

existe unicidad por feedback + dimensión + scale version dentro de una revisión
determinada.

### CAD-158-05 — Tratamiento y agregados heredan privacidad desde Feedback

purpose/base/retención se heredan explícitamente desde Feedback y los agregados aplican
privacy threshold sin devolver identidad.

### CAD-158-06 — La aprobación exige evidencia de escalas, normalización y privacidad agregada

La aprobación exige fixtures de escalas numéricas/categóricas, correcciones,
normalización, unicidad y privacidad agregada.
