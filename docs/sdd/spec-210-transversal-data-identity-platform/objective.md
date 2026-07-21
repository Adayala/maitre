# OBJECTIVE — SPEC-210

## Objetivo

Seleccionar una plataforma gratuita que permita implementar las primeras specs de Organization, Identity, Subscription y Catalog con mínima operación, preservando seguridad multi-tenant y portabilidad.

## Criterios

| Criterio | Supabase Free | Neon Free |
| --- | --- | --- |
| PostgreSQL estándar | Sí | Sí |
| Auth integrada | Sí, hasta cuota del plan | Sí, Neon Auth |
| Storage integrado | Sí | No como producto principal integrado |
| RLS PostgreSQL | Sí | Sí, como capacidad PostgreSQL |
| Serverless pooling | Supavisor transaction mode | PgBouncer pooling |
| Tamaño gratuito documentado | 500 MB | 0,5 GB |
| Recuperación gratuita | Exportación propia requerida | Ventana limitada de restore/time travel |
| Inactividad | Puede pausarse por baja actividad | Scale-to-zero, sin límite temporal anunciado |
| Complejidad inicial | Menor para DB + Auth + Storage | Menor si se usa solo DB/Auth |

## Resultado

Supabase reduce el número de proveedores en el MVP y ofrece una experiencia integrada. Se acepta la pausa por inactividad únicamente para desarrollo/demo y se compensa la ausencia de backups administrados en Free mediante exportación lógica automatizada y restauración probada.

## Fuera de alcance

- Declarar Supabase apto para producción comercial.
- Elegir ORM o query builder.
- Permitir acceso directo del navegador a tablas operacionales.
- Adoptar Edge Functions, Realtime o APIs propietarias sin una spec adicional.
