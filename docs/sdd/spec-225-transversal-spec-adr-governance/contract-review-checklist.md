# Protocolo de revisión de contratos — SPEC-225

Este protocolo convierte la revisión por pares en evidencia repetible. No reemplaza el juicio
del owner/reviewer ni autoriza implementación por sí mismo.

## Entrada

- README autoritativo con metadata completa, owner y reviewer distintos cuando corresponda.
- `contract.md`, reglas, verificación y dependencias disponibles en el mismo checkout.
- ADRs y spikes bloqueantes resueltos o declarados explícitamente.
- Consumidores conocidos y contratos afectados identificados.

## Revisión obligatoria

| Dimensión | Evidencia mínima | Bloquea aprobación cuando |
| --- | --- | --- |
| Alcance | resultado, exclusiones y términos definidos | mezcla capacidades o deja autoridad ambigua |
| Dominio | invariantes, estados y ownership | lógica crítica queda en UI, handler o proveedor |
| Datos | identidad, tenant, timestamps, moneda y retención | admite cross-tenant, pérdida de precisión o PII innecesaria |
| API | schemas, errores, idempotencia y concurrencia | confía en contexto/importes del cliente o permite doble efecto |
| Eventos | sobre, versión, outbox y deduplicación | supone exactly-once o expone secretos/PII |
| Seguridad | RBAC, abuso, auditoría y threat cases | autorización no es server-side y deny-by-default |
| Diseño | responsabilidades y dependencias dirigidas | duplica reglas o crea acoplamiento a framework/proveedor |
| Portabilidad | puertos, configuración, export y fallback | Vercel, Supabase o un SDK se vuelve dominio |
| Free tier | cuotas, volumen, costo y degradación | el MVP puede generar cobro o quedar sin salida segura |
| UX/a11y | estados, errores, teclado y privacidad | un flujo crítico no es accesible o explica mal incertidumbre |
| Calidad | unit, contract, integration y E2E por riesgo | criterios no son automatizables o falta test de aislamiento |
| Operación | telemetría, SLO, retry, recovery y runbook | un fallo crítico no es detectable o recuperable |

DRY significa una sola autoridad por regla, schema o cálculo. No obliga a compartir código entre
conceptos que sólo se parecen ni justifica una abstracción antes de tener consumidores reales.

## Casos adversariales mínimos

Toda revisión debe buscar, según aplique: reintento, concurrencia, duplicado, evento tardío,
timeout ambiguo, sesión revocada, cross-tenant, timezone/DST, redondeo decimal, datos stale,
payload malicioso, proveedor caído, cuota agotada, migración parcial y rollback.

## Resultado

El reviewer registra uno de estos outcomes:

- `APPROVE`: no quedan findings bloqueantes y la evidencia es suficiente.
- `REQUEST_CHANGES`: lista findings con severidad, ubicación, criterio incumplido y resolución.
- `BLOCKED`: identifica ADR, spike, owner, credencial o decisión externa faltante.

Un outcome incluye commit revisado y fecha, no texto genérico. Findings críticos o altos impiden
`READY_FOR_IMPLEMENTATION`; los aceptados excepcionalmente requieren owner, motivo, mitigación y
vencimiento. Después de cambios incompatibles se invalida la aprobación previa y se revisan los
consumidores afectados.
