# Objetivo — SPEC-210

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

## Criterios de aceptación

### CAD-210-01 — La plataforma elegida preserva PostgreSQL estándar, identidad reemplazable y aislamiento multi-tenant

La decisión selecciona una plataforma gratuita que soporte PostgreSQL estándar y un boundary de identidad reemplazable. La autorización continúa resolviéndose en Maitre, no sólo en claims del proveedor.

### CAD-210-02 — El baseline I0 delimita estructura física, scopes y relaciones sin habilitar DDL prematuro

El baseline y su diccionario delimitan tablas, nulabilidad, scopes, constraints mínimas y estrategias de FK compuestas. Esa documentación no equivale a permiso para implementar migraciones productivas sin aprobación.

### CAD-210-03 — Browser y runtime no exponen secretos ni acceso directo a tablas operacionales

Los secretos privilegiados y el acceso operativo a tablas se encapsulan server-side. El navegador no puede operar tablas internas como contrato de producto.

### CAD-210-04 — Dump, restore, exportación y sustitución de proveedor son verificables antes de adopción

La plataforma sólo puede adoptarse si demuestra exportación, restore, sustitución por PostgreSQL estándar y recuperación de identidad/objetos necesarios con evidencia reproducible.

### CAD-210-05 — La operación en free tier falla de forma segura y observable dentro del perímetro MVP

Cuotas, pausas por inactividad, signed URLs y límites del plan gratuito se gobiernan de forma explícita. La degradación no debe filtrar detalles internos ni ampliar permisos.

### CAD-210-06 — ADR-002 permanece bloqueada hasta completar evidencia PASS de los spikes requeridos

La comparación documental no autoriza adopción. Cualquier spike requerido en estado `NOT_RUN`, FAIL o INCONCLUSIVE mantiene ADR-002 como propuesta o revisión pendiente.
