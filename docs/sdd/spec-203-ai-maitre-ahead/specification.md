# Especificación — SPEC-203 Maitre Ahead

Forecast incluye horizon, point/interval, baseline, drivers, assumptions, model version, generatedAt,
expiry y coverage. Se abstiene por cold start, missing data, drift, baja calibración o budget.

No comunica certeza ni dispara acción por sí solo. Evaluación compara baseline con backtest por
segmento/season, calibration y business loss. Context/features obedecen tenant/privacy; explicación
no revela datos de otros sujetos.
