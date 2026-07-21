# ADR-002 — Supabase Data and Identity

| Campo | Valor |
| --- | --- |
| **ID** | ADR-002 |
| **Estado** | PROPOSED |
| **Fecha** | 2026-07-21 |
| **Deciders** | UNASSIGNED |
| **Blockers** | Asignar deciders y completar SPK-02, SPK-03, SPK-04 y SPK-06 |
| **Specs relacionadas** | SPEC-017, SPEC-020, SPEC-023, SPEC-210, SPEC-214, SPEC-220, SPEC-226 |

## Contexto

El MVP necesita PostgreSQL, autenticación y almacenamiento con tier gratuito, aislamiento multi-tenant y una salida portable.

## Opciones consideradas

- Supabase PostgreSQL + Auth + Storage.
- PostgreSQL gratuito y proveedores separados de identidad/storage.
- Otro servicio PostgreSQL gestionado con identidad propia.

## Decisión propuesta

Usar Supabase para PostgreSQL y Auth, y Storage sólo cuando una feature lo requiera. El browser usa Auth y APIs públicas permitidas, pero no consulta tablas operativas directamente. Repositorios, identidad y storage se encapsulan detrás de ports.

## Consecuencias

### Positivas

- menos proveedores y configuración inicial;
- PostgreSQL estándar y RLS;
- entorno local/herramientas integradas;
- tier gratuito apto para demo sintética.

### Negativas

- límites/pausa/backups del plan gratuito;
- migración de identidades puede requerir reset/reautenticación;
- complejidad de pooling serverless y RLS;
- riesgo de acoplamiento si SDKs cruzan adapters.

## Criterios de aceptación

- spike de conexión Vercel/Supavisor;
- migraciones desde cero;
- tests RLS cross-tenant;
- dump/restore y export de objetos;
- medición de cuota y revisión de términos;
- ejecución del dominio sin SDK Supabase.

La evidencia y el resultado de cada criterio se registran en [SPEC-226](../sdd/spec-226-transversal-i0-platform-validation-spikes/README.md). La conexión Supabase–Vercel no cambia por sí sola el estado de este ADR.

## Alternativa si falla

Comparar PostgreSQL gestionado compatible y proveedor de identidad reemplazable antes de ampliar persistencia.
