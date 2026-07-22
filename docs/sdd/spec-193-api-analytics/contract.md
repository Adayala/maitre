# Contrato API — SPEC-193 Analytics

Ingerir eventos en lotes idempotentes y consultar series agregadas por período, timezone y
dimensiones permitidas. Respuestas declaran freshness, cobertura y cursor; muestras pequeñas
se suprimen. Tests cubren lotes parciales, duplicados, eventos tardíos, volumen, paginación,
privacidad, RBAC y aislamiento.
