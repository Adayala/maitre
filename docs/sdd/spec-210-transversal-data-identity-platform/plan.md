# PLAN — SPEC-210

## Spike de aprobación

1. Crear proyecto `development` Free sin datos reales.
2. Conectar Node.js desde Vercel mediante Supavisor transaction mode.
3. Ejecutar migración mínima con tenant, user y membership.
4. Implementar login y validación server-side de sesión.
5. Demostrar RLS contra acceso cruzado.
6. Ejecutar dump, borrar una copia local y restaurarla.
7. Medir cold start, conexión y latencia desde la región elegida.

## Walking skeleton

1. Implementar `GET /health` con estado separado de API y database.
2. Implementar registro/invitación según specs de Identity.
3. Crear Tenant y Branch dentro de una transacción.
4. Exponer dashboard setup a React.js.
5. Agregar auditoría, idempotencia y errores normalizados.

## Gate de adopción

Supabase se aprueba si pasan conexión, aislamiento, migración reproducible, backup/restore y ejecución dentro de las cuotas Free. Si falla un criterio P0, comparar Neon antes de escribir más adapters.
