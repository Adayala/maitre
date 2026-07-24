# Especificación — SPEC-163 Ratings API

Create idempotente dentro de Feedback y ScaleVersion. El servidor valida dimensión/escala y calcula
normalized; no acepta valor normalizado del cliente.

Aggregate por branch/dimension/window devuelve buckets, score, coverage, formula/scale versions y
freshness. Si threshold no se cumple suprime score, tamaño exacto y drill-down; no permite combinar
filtros para reconstruir cohortes pequeñas.

`POST /ratings` crea o confirma ratings ligados a feedback autorizado; `GET /ratings` lista ratings
permitidos bajo redaction; `GET /ratings:aggregate` devuelve vistas agregadas. Errores usan `404`
para feedback/scope ajeno, `409` para duplicidad incompatible, `412` para revisión obsoleta y `422`
para escala/dimensión inválida.

La agregación se limita a dimensiones, ventanas y scopes permitidos. Si una combinación de filtros
reduce demasiado la base, la API responde con supresión o bucket generalizado en lugar de datos
precisos. `freshness` y `asOf` deben quedar explícitos para evitar interpretar como tiempo real lo que
es una vista derivada.
