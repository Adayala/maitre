# PLAN — SPEC-209

## Incremento 1 — Esqueleto verificable

1. Crear workspaces raíz y configuración compartida.
2. Crear los paquetes mínimos `domain`, `application`, `contracts` y `tooling`.
3. Crear shells mínimos `apps/web` y `apps/api` sin funcionalidad de producto.
4. Añadir comandos raíz y CI de SPEC-207.
5. Verificar build local y build en Vercel.

## Incremento 2 — Walking skeleton

1. Definir contrato `GET /health`.
2. Implementar caso de uso y adapter mínimo.
3. Consumirlo desde una pantalla React de diagnóstico.
4. Probar frontera HTTP y build end-to-end.
5. Demostrar ejecución del API fuera de Vercel.

## Incremento 3 — Primer slice de dominio

Después de aprobar las decisiones de datos e identidad:

1. implementar Tenant y Branch según sus specs;
2. añadir adapters de persistencia e identidad;
3. completar onboarding y dashboard setup;
4. demostrar aislamiento multi-tenant.
