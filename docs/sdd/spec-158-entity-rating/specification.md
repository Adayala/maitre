# Especificación — SPEC-158 Rating

Valor entero por ScaleVersion y dimension. Normalización canónica: para escala `[min,max]`,
`normalized = (value-min)/(max-min)` en `[0,1]`; escalas categóricas requieren mapping versionado.

Rating es inmutable; corrección crea revisión enlazada con reason. Unicidad por feedback + dimension
+ scale version. Purpose/base y retención se heredan explícitamente del Feedback; agregados nunca
devuelven identidad y aplican privacy threshold.
