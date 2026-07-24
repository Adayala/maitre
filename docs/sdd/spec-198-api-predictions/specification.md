# Especificación — SPEC-198 Predictions API

Request idempotente por purpose/alcance/asOf/model policy y get asíncrono. Authorization precede feature
retrieval; feature snapshot queda con alcance tenant. Hard timeout/budget y circuit breaker aplican.

La respuesta es COMPLETED o ABSTAINED/FAILED con model version, horizon, expiry, uncertainty, baseline,
explanation/freshness. Fallback se declara y no simula salida del modelo. Inputs/PII se redactan.

`POST /predictions` crea o reutiliza una solicitud de inferencia; `GET /predictions/{predictionId}`
devuelve estado y resultado. `404` oculta alcance no autorizado, `409` cubre conflicto de policy o
estado, `412` revisiones obsoletas y `422` inputs insuficientes o policy no permitida.

La API distingue claramente entre inferencia fallida, abstención deliberada y resultado exitoso. Un
fallback heurístico o de cache, cuando exista, debe presentarse como tal con sus propias limitaciones
y nunca fingir que provino del modelo activo.
