# Reglas — SPEC-165

- Idempotencia se basa en revisión exacta y versions del pipeline.
- Baja confianza produce `ABSTAINED`.
- Budget, purpose/base y redaction se validan antes del provider.
- Response no expone prompt interno ni secrets del provider.
- Administración de modelos usa permisos separados.
