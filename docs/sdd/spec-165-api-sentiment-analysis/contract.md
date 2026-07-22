# Contrato API — SPEC-165 Sentiment Analysis

Solicitar análisis sobre feedback autorizado y consultar resultados versionados. Create es
idempotente por texto normalizado, idioma y versión de modelo; procesa asíncronamente, aplica
límites y devuelve estados PENDING/COMPLETED/FAILED. Ningún texto sensible llega a proveedores
sin base y configuración explícitas. Tests cubren timeout, reintento, redacción, baja confianza,
modelo cambiado, RBAC, costos y aislamiento.
