# Contrato API — SPEC-181 Integration Test

Ejecutar una prueba explícita y acotada de autenticación, conectividad y capacidades sin crear
transacciones productivas. La operación es rate-limited, auditable, usa timeout estricto y
devuelve diagnósticos normalizados y redactados; en preview sólo apunta a sandbox. Tests cubren
secretos inválidos, DNS/SSRF, timeout, provider degradado, concurrencia, RBAC y ausencia de
efectos laterales.
