# Contrato API — SPEC-162 Feedback

Enviar feedback por token opaco y listar, obtener, asignar, resolver o redactar internamente.
Submit aplica rate limit, sanitización e Idempotency-Key sin revelar si una visita ajena existe;
los comandos internos usan If-Match y auditan actor y motivo. Tests cubren abuso, duplicados,
token vencido, XSS, anonimato, paginación, retención, RBAC y aislamiento entre tenants.
