# Reglas — SPEC-181

- No existe test genérico; cada adapter declara capacidades testeables.
- Producción sólo admite tests read-only/health probados.
- URLs pasan SSRF policy.
- Ejecutar test requiere step-up, permiso, idempotencia y auditoría.
- Resultados no exponen secrets ni raw responses.
