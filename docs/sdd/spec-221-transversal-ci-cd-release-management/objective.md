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

## Criterios de aceptación

### CAD-221-01 — CI entrega feedback rápido, determinista y bloquea cambios inválidos antes del merge

El pipeline reproduce instalación, build, tests, scans y validaciones contractuales desde checkout limpio. Los gates requeridos no dependen de intervención manual ni path filters frágiles.

### CAD-221-02 — Previews y ambientes compartidos usan secretos, datos y permisos mínimos autorizados

Las previews son descartables, acotadas y no deben poner en riesgo datos o credenciales compartidas. El entorno demo sólo promueve configuración aprobada.

### CAD-221-03 — El mismo commit probado se promueve sin rebuild ambiguo entre ambientes

El artefacto o deployment promovido a demo corresponde exactamente al commit ya validado. La promoción no reconstruye código distinto ni pierde trazabilidad con specs y migraciones.

### CAD-221-04 — Las migraciones siguen una estrategia compatible con despliegue, rollback y forward-only controlado

Expand/migrate/contract, backfills y cambios destructivos se gobiernan por runbooks y aprobaciones explícitas. Preview y build no ejecutan migraciones productivas.

### CAD-221-05 — Rollback de aplicación, configuración y datos se distingue y se ejercita con evidencia

Revertir un release no implica improvisar recuperación de datos o repetición de efectos externos. Los runbooks diferencian rollback de aplicación, config y compensación/restore de datos.

### CAD-221-06 — Production permanece bloqueado hasta cumplir gates comerciales, operativos y de seguridad

El pipeline del MVP no habilita producción comercial por accidente. La promoción a un ambiente productivo requiere readiness aprobada en costos, seguridad, DR, soporte y operación.
