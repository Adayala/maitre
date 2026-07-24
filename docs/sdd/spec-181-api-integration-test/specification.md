# Especificación — SPEC-181

No existe test genérico. Cada adapter declara capacidad de prueba, environment permitido, efectos secundarios,
fixtures, cleanup, timeout, rate/budget y redacción. Producción sólo permite health read-only probado;
tests que crean objetos quedan limitados a sandbox con cleanup verificable.

Las URLs pasan la política SSRF. El comando requiere step-up/permiso, idempotencia y auditoría. El resultado normaliza
checks y limitaciones sin secretos/raw responses. Una capacidad no demostrada devuelve `NOT_SUPPORTED`.

`POST /integrations/{integrationId}:test` ejecuta una capacidad declarada del adapter bajo parámetros
allowlisted; `GET /integration-tests/{testRunId}` puede servir estado/resultado si el test es asíncrono.
La API debe distinguir claramente entre `NOT_SUPPORTED`, `FAILED`, `ABORTED_BY_POLICY` y `PASSED`
para que operadores no confundan ausencia de soporte con un problema transitorio.

Los tests no autorizan nuevas capacidades: sólo demuestran parcialmente las ya declaradas por el
adapter/spec. La evidencia del test es operativa y auditable, pero no reemplaza el gate `PASS` del
spike/provider evaluation cuando ese gate siga siendo requerido.
