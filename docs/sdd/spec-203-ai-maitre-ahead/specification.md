# Especificación — SPEC-203 Maitre Ahead

Forecast incluye horizon, point/interval, baseline, drivers, assumptions, model version, generatedAt,
expiry y coverage. Se abstiene por cold start, missing data, drift, baja calibración o budget.

No comunica certeza ni dispara acción por sí solo. Evaluación compara baseline con backtest por
segmento/season, calibration y business loss. Context/features obedecen tenant/privacy; explicación
no revela datos de otros sujetos.

La surface entrega pronósticos con contexto suficiente para ser interpretados críticamente, no como
verdad garantizada. Debe mostrar baseline y limitaciones para que el usuario pueda comparar si el
modelo agrega valor sobre heurísticas simples.

La abstención no es error: es un outcome esperado cuando la calidad o el presupuesto no alcanzan.
Las explicaciones deben centrarse en drivers agregados/autorizados, evitando exponer información de
otros sujetos o cohortes pequeñas.
