# Contrato transversal — SPEC-213 MVP Walking Skeleton

El primer corte conecta autenticación, contexto autorizado, shell React, API Node, caso de uso,
PostgreSQL, telemetría y despliegue Vercel mediante comportamiento real mínimo. `/v1/me/context`
descubre scopes; headers posteriores sólo seleccionan y nunca conceden autoridad. Aceptación
cubre happy path, denegación cross-tenant, error observable, migración y despliegue reproducible.
