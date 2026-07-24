# Reglas — SPEC-176

- La API no expone secretos; usa referencias opacas.
- Config valida adapter version y capacidades permitidas.
- Mutaciones usan idempotencia y concurrencia optimista.
- `activate` exige PASS gate, ownership y credenciales válidas.
- `disable` revoca operación futura sin borrar runs históricos.
