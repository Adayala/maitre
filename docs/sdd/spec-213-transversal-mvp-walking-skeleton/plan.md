# Plan — SPEC-213

## Incremento 1 — Base ejecutable

1. Crear workspaces mínimos, configuración y comandos raíz.
2. Levantar React/Vite y Fastify en Node estándar.
3. Implementar health live/ready con contract tests.
4. Ejecutar lint, typecheck, tests y build en CI.

## Incremento 2 — Persistencia e identidad

1. Crear migraciones mínimas y seed ficticio.
2. Configurar Supabase Auth y verificación server-side.
3. Implementar repositorios normalizados y schema ejecutable de `GET /v1/me/context`.
4. Probar estado vacío, scopes de branch y aislamiento cross-tenant.

## Incremento 3 — Experiencia vertical

1. Implementar login, resolución/selección de contexto y logout.
2. Construir Dash shell con tokens y primitivas compartidas.
3. Completar estados loading, vacío, error, offline y sesión expirada.
4. Validar teclado, axe y viewports objetivo.

## Incremento 4 — Operación

1. Añadir telemetría y redacción de datos sensibles.
2. Desplegar development, demo y preview.
3. Probar restauración desde checkout y base vacía.
4. Adjuntar evidencia, documentar runbook y aprobar el gate de salida.
