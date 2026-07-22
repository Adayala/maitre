# Especificación — SPEC-163 Ratings API

Create idempotente dentro de Feedback y ScaleVersion. El servidor valida dimensión/escala y calcula
normalized; no acepta valor normalizado del cliente.

Aggregate por branch/dimension/window devuelve buckets, score, coverage, formula/scale versions y
freshness. Si threshold no se cumple suprime score, tamaño exacto y drill-down; no permite combinar
filtros para reconstruir cohortes pequeñas.
