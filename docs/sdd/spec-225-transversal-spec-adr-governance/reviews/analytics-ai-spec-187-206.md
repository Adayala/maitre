# Revisión de contratos — Analytics & AI SPEC-187–206

| Campo | Valor |
| --- | --- |
| Alcance | SPEC-187–206 |
| Commit revisado | `2d4ea81` |
| Protocolo | `contract-review-checklist.md` |
| Outcome | `BLOCKED` |
| Autoridad para implementar | No otorgada |

## Resultado ejecutivo

El bloque versiona eventos, fórmulas, modelos y predicciones; comunica freshness/cobertura/
incertidumbre; suprime muestras pequeñas; ofrece fallbacks deterministas y exige aprobación,
limits, audit y kill switch para Autopilot. Las bases de explicabilidad y seguridad son buenas.

La aprobación queda bloqueada por metadata provisoria y porque aún no existe un catálogo
autoritativo de eventos/features/métricas ni una plataforma/modelo viable dentro del presupuesto
free-tier.

## Findings bloqueantes

### AI-REV-001 — Metadata provisoria en todo el bloque

- Severidad: alta.
- Evidencia: SPEC-187–206 mantienen type, phase y priority `TBD`, sin owner/reviewer ni
  dependencias autoritativas.
- Resolución: normalizar veinte README con SPEC-225, asignar owners de datos/modelo/producto y
  registrar outcome.

### AI-REV-002 — Catálogo de eventos/features/métricas sin autoridad

- Severidad: alta.
- Evidencia: AnalyticsEvent admite tipo/propiedades allowlisted; métricas y modelos referencian
  sources/features, pero no existe registry/schema lineage único ni ownership por señal.
- Riesgo: productores pueden cambiar significado, duplicar dimensiones o alimentar modelos con
  datos incompatibles.
- Resolución: definir registry versionado, trusted producers, schema compatibility, lineage,
  quality checks, deprecation y backfill; enlazar métricas/features a IDs inmutables.

### AI-REV-003 — Runtime/modelos/costo sin spike aprobado

- Severidad: alta.
- Evidencia: contratos permiten ML/LLM pero no fijan modelos, hosting, límites, licencias,
  privacidad, latencia ni consumo compatible con Vercel/Supabase free tier.
- Riesgo: costo inesperado, bloqueo de proveedor o capacidad no ejecutable.
- Resolución: spikes comparativos con baseline determinista, mediciones, cuotas, costo máximo,
  fallback/off switch y portabilidad; IA paga queda fuera del MVP hasta decisión explícita.

### AI-REV-004 — Autopilot no tiene catálogo de acciones/risk tiers

- Severidad: alta.
- Evidencia: menciona allowlist y aprobación humana, pero no define acciones habilitables,
  permisos, límites, evidencia, expiración de approval o compensación por command.
- Riesgo: una sugerencia puede convertirse en mutación amplia o irreparable.
- Resolución: registry action→risk→inputs→preview→approver→limits→idempotency→compensation;
  I0 debe permanecer suggestion-only con ejecución deshabilitada por defecto.

## Findings medios

### AI-REV-005 — Ingesta necesita autenticidad y anti-abuso

Batch idempotente no basta: definir productor autorizado, schema, size/rate limits, clock
tolerance y rechazo/cuarentena. Cliente público nunca debe poder emitir eventos de negocio
autoritativos ni elegir tenant/subject.

### AI-REV-006 — DSL de métricas necesita sandbox y cost model

Además de impedir código arbitrario, limitar joins, cardinalidad, rango, recursion y tiempo;
preview debe estimar costo y no acceder a dimensiones fuera del permiso del autor/lector.

### AI-REV-007 — Model registry necesita evaluación/reproducibilidad completas

Definir dataset snapshot/hash, feature code, seed, environment, metrics/thresholds por objetivo,
bias/privacy review, approval separation, shadow/canary, monitoring y rollback. Una referencia de
artefacto firmada no basta para reproducir.

### AI-REV-008 — Prompt injection/data exfiltration cross-tenant

Rewind/Live/Insights deben construir contexto desde fuentes allowlisted, aplicar autorización
antes del prompt, no ejecutar instrucciones de datos, filtrar outputs y registrar trazas
redactadas. Las citas deben ser referencias internas autorizadas, no texto libre del usuario.

### AI-REV-009 — Alert/Insight lifecycle y fatiga

Definir activation identity, dedupe/cooldown, acknowledge/resolve/reopen, feedback y ownership.
Insights contradictorios o stale no deben activar automation y las alertas necesitan runbook.

### AI-REV-010 — Roles no canónicos

`analyst`, `ML admin` y `tenant admin` deben mapear a permission assignments versionados.
Drill-down, export, metric publish, model activate y automation approve son permisos separados
con segregación.

## Evidencia positiva

- Eventos son append-only, deduplicables, redactados y tenant-scoped.
- Métricas/formulas se versionan y no ejecutan código arbitrario.
- Dashboards reaplican permisos por widget y degradan parcialmente.
- Predicciones distinguen resultado de hecho, incluyen incertidumbre y expiran.
- Reports tienen manifest/hash, links expirables y protección CSV.
- Rewind cita fuentes y distingue hechos/inferencias con fallback sin LLM.
- Ahead se abstiene con cobertura insuficiente y compara baseline.
- Autopilot contempla preview, human approval, idempotencia, compensación y kill switch.

## Próxima revisión

Revisar después de resolver AI-REV-001–004. La evidencia debe incluir data registry, golden
metrics, eval datasets, spikes de costo/runtime, action risk registry y pruebas de aislamiento/
injection con fallbacks deterministas.
