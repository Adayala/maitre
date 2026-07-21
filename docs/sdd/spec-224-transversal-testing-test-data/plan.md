# Plan — SPEC-224

## Fase 1 — Harness

1. Configurar Vitest projects y coverage V8.
2. Crear `Clock`, `IdGenerator` y builders base.
3. Configurar PostgreSQL service/efímero y migraciones.
4. Configurar Testing Library, axe, MSW y Playwright.

## Fase 2 — Walking skeleton

1. Unit tests de contexto/autorización.
2. Integration de User/Membership/Tenant/RLS.
3. Route/contract tests de health y `/v1/me/context`.
4. E2E login → Dash → logout.

## Fase 3 — Recorrido MVP

1. Añadir builders y tests por incremento SPEC-222.
2. Crear E2E Floor → Kitchen → cuenta/cierre.
3. Añadir concurrencia/idempotencia/outbox/offline.
4. Crear adapter contracts ARCA sin producción.

## Fase 4 — Gobierno

1. Medir coverage útil, duración y flakes.
2. Añadir quarantine policy automatizada.
3. Programar browsers/mutation/restore según riesgo.
4. Revisar tests redundantes y gaps escapados.
