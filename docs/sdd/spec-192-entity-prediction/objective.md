# Objetivo — SPEC-192

Definir Prediction como resultado inmutable, explicable y no equivalente a hecho observado.

## Criterios de aceptación

### CAD-192-01 — Prediction conserva versión, snapshot, tiempos, resultado e incertidumbre

Prediction conserva model version, feature snapshot/hash, generatedAt, horizon/expiry, result,
uncertainty, baseline, explanation y abstention reason.

### CAD-192-02 — Prediction es inmutable y distinta de un hecho observado

Prediction es inmutable y no se interpreta como hecho observado.

### CAD-192-03 — Falta de señales, drift o budget agotado producen `ABSTAINED`

Faltan features, coverage/confidence baja, model inactive, drift o budget agotado implican
`ABSTAINED`, no un resultado inventado.

### CAD-192-04 — PII no se copia dentro de la predicción persistida

PII no se copia dentro de la predicción; las refs se autorizan al leer.

### CAD-192-05 — Una predicción expirada sólo queda como historia

Una predicción expirada queda visible como historia pero nunca alimenta una decisión o automatización
actual.

### CAD-192-06 — La aprobación exige evidencia de abstention, expiry, explanation e inmutabilidad

La aprobación exige fixtures de abstention, expiry, explanation, uncertainty, inmutabilidad y
separación prediction-vs-observed fact.
