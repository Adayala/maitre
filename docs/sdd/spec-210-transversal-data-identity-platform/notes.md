# NOTES — SPEC-210

## Motivo de elección

Supabase agrupa PostgreSQL, Auth y Storage, reduciendo proveedores y tiempo de integración. PostgreSQL y RLS son capacidades estándar; Auth y Storage requieren adapters y un plan explícito de salida.

## Límites verificados al 2026-07-21

- Free: 500 MB de base, 50.000 MAU, 1 GB de Storage, 5 GB de egress y dos proyectos activos.
- Los proyectos Free con baja actividad pueden pausarse después de siete días.
- Un proyecto pausado puede restaurarse desde el dashboard dentro de la ventana publicada.
- Backups administrados diarios corresponden a planes pagos; para Free se recomienda `supabase db dump` y copia externa.
- Supavisor transaction mode está indicado para funciones serverless y no soporta prepared statements.

## Fuentes oficiales

- [Precios y límites](https://supabase.com/pricing)
- [Pausa de proyectos Free](https://supabase.com/docs/guides/platform/free-project-pausing)
- [Conexiones y Supavisor](https://supabase.com/docs/guides/database/connecting-to-postgres)
- [Backups](https://supabase.com/docs/guides/platform/backups)
- [Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Seguridad de Data API](https://supabase.com/docs/guides/api/securing-your-api)
- [Arquitectura de Auth](https://supabase.com/docs/guides/auth/architecture)

## Riesgos abiertos

- La pausa por inactividad impide considerar Free como entorno productivo confiable.
- Migrar identidades puede exigir reset o reautenticación de usuarios.
- RLS compleja puede causar fallos de seguridad o rendimiento si no se prueba e indexa.
- La ausencia de backup administrado exige disciplina operativa desde el primer dato no regenerable.
- Cuotas y términos pueden cambiar; deben revisarse mensualmente.
