# Especificación — SPEC-158 Rating

Valor entero por ScaleVersion y dimension. Normalización canónica: para escala `[min,max]`,
`normalized = (value-min)/(max-min)` en `[0,1]`; escalas categóricas requieren mapping versionado.

Rating es inmutable; corrección crea revisión enlazada con reason. Unicidad por feedback + dimension
+ scale version. Purpose/base y retención se heredan explícitamente del Feedback; agregados nunca
devuelven identidad y aplican privacy threshold.

La entidad incluye `ratingId`, `feedbackId`, `dimension`, `scaleVersion`, `rawValue`,
`normalizedValue`, `correctionOf?`, `correctionReason?`, `purpose`, `treatmentBasis`,
`retentionClass`, `createdAt` y `revision`. `normalizedValue` es derivado determinístico del valor y
de la versión de escala; no puede ser sobreescrito manualmente por el cliente.

Cuando un feedback contenga múltiples dimensiones, cada una se registra como rating separado. La
agregación posterior debe apoyarse en `normalizedValue` y en thresholds de privacidad, nunca en la
identidad opcional del feedback ni en metadata sensible no necesaria.
