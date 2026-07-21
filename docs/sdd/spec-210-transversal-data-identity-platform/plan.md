# PLAN — SPEC-210

## Spike de aprobación

1. Confirmar owner/integración y crear o vincular un proyecto `development` Free sin datos reales.
2. Conectar Node.js desde Vercel mediante el pooler/modo candidato y comparar el resultado.
3. Ejecutar migración experimental mínima con Tenant, User, Membership y Branch.
4. Implementar login y validación server-side de sesión.
5. Demostrar RLS contra acceso cruzado.
6. Ejecutar dump, borrar una copia local y restaurarla.
7. Medir cold start, conexión y latencia desde la región elegida.

## Walking skeleton

1. Implementar `/health/live` y `/health/ready` según SPEC-213.
2. Implementar Auth boundary y `/v1/me/context` sin registro público.
3. Aprovisionar datos sintéticos mediante seed/script idempotente.
4. Exponer el Dash shell a React.js.
5. Agregar auditoría, errores normalizados y aislamiento Tenant A/B.

## Gate de adopción

ADR-002 puede aceptarse si SPK-02/03/04/06 pasan conexión, aislamiento, migración reproducible, backup/restore y ejecución dentro de las cuotas Free. Si falla un criterio P0, registrar alternativa y repetir criterios equivalentes antes de escribir adapters productivos.
