# Contrato API — SPEC-163 Ratings

Crear puntuaciones como parte de feedback y consultar agregados por dimensión, sucursal y
período. El servidor valida la escala vigente, protege muestras pequeñas y nunca devuelve
identidad individual en agregados. La escritura es idempotente. Tests cubren límites,
duplicados, ventanas, supresión estadística, redondeo, paginación, autorización, privacidad y
aislamiento entre tenants.
