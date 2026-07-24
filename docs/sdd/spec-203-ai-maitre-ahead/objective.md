# Objetivo — SPEC-203

Definir Maitre Ahead como surface de forecast asistiva, calibrada y con abstención explícita.

## Criterios de aceptación

### CAD-203-01 — Todo forecast incluye horizon, interval, baseline, drivers, metadata y coverage

Todo forecast incluye horizon, point/interval, baseline, drivers, assumptions, model version,
generatedAt, expiry y coverage.

### CAD-203-02 — La surface se abstiene ante cold start, missing data, drift o baja calibración

Se abstiene ante cold start, missing data, drift, baja calibración o budget agotado.

### CAD-203-03 — La surface no comunica certeza absoluta ni dispara acción por sí sola

No comunica certeza absoluta ni dispara acción por sí solo.

### CAD-203-04 — La evaluación compara baseline con backtests, calibración y business loss

Evaluación compara baseline con backtest por segmento/season, calibration y business loss.

### CAD-203-05 — Contexto, features y explicación respetan tenant y privacidad

Context/features obedecen tenant/privacy y la explicación no revela datos de otros sujetos.

### CAD-203-06 — La aprobación exige evidencia de fields, abstention, calibración y explicaciones seguras

La aprobación exige fixtures de forecast fields, abstention causes, calibration, backtests,
privacy-safe explanations y no-auto-action.
