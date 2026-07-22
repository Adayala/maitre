# Contrato transversal — SPEC-224 Testing & Test Data

La pirámide combina unit, contract, integration, component y E2E según riesgo, con fixtures
deterministas y datos sintéticos sin secretos ni PII productiva. Tests aíslan tenant, timezone,
reloj y aleatoriedad; flakiness no se tolera como normal. Gates miden mutaciones críticas,
accesibilidad, seguridad y regresión. Seeds son versionados, idempotentes y descartables.
