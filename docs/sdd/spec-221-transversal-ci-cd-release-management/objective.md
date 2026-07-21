# Objetivo — SPEC-221

Convertir cada cambio aprobado en un release identificable, verificable y recuperable, reduciendo errores manuales, drift entre ambientes y despliegues que no puedan relacionarse con una spec.

## Resultados esperados

- Feedback rápido y determinista en pull requests.
- Evidencia unificada de specs, calidad, seguridad y contratos.
- Previews seguras y descartables.
- Promoción del mismo código probado.
- Migraciones compatibles durante despliegue y rollback.
- Estado de release, responsables y runbooks visibles.

## Fuera de alcance

- Habilitar producción comercial.
- Introducir Kubernetes, runners pagos o un sistema externo de releases.
- Automatizar aprobación humana de cambios fiscales/destructivos.
- Mantener ramas de release largas durante el MVP.
- Resolver colaboración multi-persona de Vercel Hobby sin verificar ownership/elegibilidad.
- Ejecutar migraciones desde Preview o durante el build serverless.
