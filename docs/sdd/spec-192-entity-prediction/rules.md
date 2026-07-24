# Reglas — SPEC-192

- Prediction es inmutable.
- No equivale a hecho observado.
- Señal insuficiente, drift, model inactive o budget agotado => `ABSTAINED`.
- PII no se copia en la predicción.
- Expirada sólo vale como historia, no como input actual.
