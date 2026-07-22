# Contrato de entidad — SPEC-192 Prediction

Predicción inmutable que conserva modelo, versión, timestamp, horizonte, inputs referenciados,
resultado, incertidumbre y explicación, sin copiar PII. Nunca representa un hecho confirmado y
expira según su horizonte. Tests cubren features faltantes, baja confianza, reproducibilidad,
staleness, redacción y aislamiento.
