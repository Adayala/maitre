# Objetivo — SPEC-226

Resolver con evidencia ejecutable las incertidumbres que bloquean ADR-002 y ADR-003, manteniendo el spike pequeño, descartable y separado del código productivo.

## Resultados esperados

- Compatibilidad local/Vercel demostrada.
- Conexión, pooling y migraciones Supabase verificadas.
- Auth/JWKS y mapping de identidad probados con acceso cross-tenant negativo.
- CI, bundle, latencia y consumo medidos.
- Backup/restore y salida probados a escala demo.
- ADR-002/003 aceptados, rechazados o revisados con evidencia enlazada.

## Fuera de alcance

- Implementar Tenant, Branch, User o Membership productivos.
- Crear UI final o design system completo.
- Usar datos, CUIT, emails o certificados reales.
- Convertir código experimental en base productiva sin review.

## Criterios de aceptación

### CAD-226-01 — Cada spike responde una incertidumbre concreta con evidencia ejecutable y reproducible

Los spikes existen para resolver preguntas específicas que bloquean ADR-002/003. Su valor proviene de evidencia reproducible, no de exploración informal o conclusiones no verificables.

### CAD-226-02 — La reproducibilidad incluye comandos, versiones, configuración no secreta y cleanup explícitos

Otro checkout debe poder repetir el spike usando instrucciones, versiones y configuración documentadas sin valores secretos. Los recursos temporales se inventarian y limpian.

### CAD-226-03 — Seguridad, aislamiento y secreto siguen siendo obligatorios incluso en código experimental

Los spikes no pueden justificar fuga de tokens, service-role keys, claims inseguros ni accesos cross-tenant. Las credenciales de runtime y migración siguen separadas.

### CAD-226-04 — Los resultados miden plataforma, presupuesto y límites reales del stack MVP

Latencia, pooling, migraciones, auth, CI, bundle, exportación y restore se miden contra el entorno realista del MVP. Alcanzar un límite gratuito es un resultado válido y debe registrarse como tal.

### CAD-226-05 — El código experimental tiene destino explícito y no se convierte en base productiva por inercia

Cada spike deja claro si su código se elimina, archiva o reescribe. La evidencia aprobada alimenta ADRs y specs; el código experimental no se promueve silenciosamente.

### CAD-226-06 — ADR-002 y ADR-003 sólo cambian de estado a partir de evidencia completa y honesta

PASS, FAIL e INCONCLUSIVE se registran de forma explícita. Ningún resultado parcial o pendiente puede presentarse como adopción cerrada.
