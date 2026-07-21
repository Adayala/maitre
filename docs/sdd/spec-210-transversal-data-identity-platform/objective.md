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

## Resultado propuesto

Supabase parece reducir el número de proveedores y ofrece una experiencia integrada. Esta comparación documental no constituye adopción: SPK-02/03/04/06 deben validar pooling, identidad, RLS/migraciones y salida antes de aceptar ADR-002.

## Fuera de alcance

- Declarar Supabase apto para producción comercial.
- Elegir ORM o query builder.
- Permitir acceso directo del navegador a tablas operacionales.
- Adoptar Edge Functions, Realtime o APIs propietarias sin una spec adicional.
- Crear un segundo proyecto remoto antes de demostrar su necesidad.
