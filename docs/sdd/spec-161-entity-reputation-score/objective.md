# Objetivo — SPEC-161

Definir ReputationScore como agregado versionado y privacy-safe de observaciones normalizadas, con
coverage e incertidumbre explícitas.

## Criterios de aceptación

### CAD-161-01 — Score usa observaciones normalizadas y pesos versionados

score se calcula sobre observaciones normalizadas `[0,1]` con pesos declarados por fuente,
recencia y confianza bajo una formula version publicada.

### CAD-161-02 — Fuentes ausentes no se imputan y outliers siguen reglas explícitas

fuentes ausentes no se imputan y outliers sólo se limitan mediante regla versionada, nunca
por eliminación silenciosa.

### CAD-161-03 — La salida publica score, coverage, buckets, ventana e incertidumbre

la salida publica score `[0,100]`, coverage, source buckets, window, formula version,
`asOf` e intervalo de incertidumbre.

### CAD-161-04 — Cambios en observaciones recompone nuevas versiones trazables

edición/borrado de observaciones recompone una nueva versión del score preservando
trazabilidad histórica.

### CAD-161-05 — Thresholds de privacidad suprimen score y tamaño exacto cuando corresponde

si sample efectivo o coverage no alcanzan threshold, se suprime score y tamaño exacto y se
usa sólo el bucket permitido.

### CAD-161-06 — La aprobación exige evidencia de pesos, outliers y supresión

La aprobación exige fixtures de pesos, recencia, confidence, outliers, supresión por
privacidad y recompuesto histórico.
