# Contrato transversal — SPEC-221 CI/CD & Release Management

PRs ejecutan gates reproducibles con lockfile; artefactos inmutables se promueven entre ambientes
sin rebuild ni secretos embebidos. Deploy exige migrations compatibles, health checks, smoke
tests, trazabilidad y rollback/roll-forward. Previews están aisladas. Tests cubren fallo de gate,
migración, deploy parcial, rollback, provenance, permisos, costo y protección de main.
