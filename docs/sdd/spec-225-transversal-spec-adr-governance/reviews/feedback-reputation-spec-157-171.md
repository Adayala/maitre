# Revisión de contratos — Feedback & Reputation SPEC-157–171

| Campo | Valor |
| --- | --- |
| Alcance | SPEC-157–171 |
| Commit revisado | `c51ad64` |
| Protocolo | `contract-review-checklist.md` |
| Outcome | `BLOCKED` |
| Autoridad para implementar | No otorgada |

## Resultado ejecutivo

Los contratos minimizan identidad, separan reseña original de análisis, versionan modelo/fórmula,
comunican confianza/freshness y suprimen muestras pequeñas. Integraciones están detrás de puertos
y contemplan rate limits, términos, edición/borrado y degradación.

La aprobación queda bloqueada por metadata provisoria y porque ReputationScore carece de una
fórmula/normalización autoritativa; además, cada plataforma externa requiere un spike vigente de
acceso y términos antes de comprometer un conector.

## Findings bloqueantes

### REP-REV-001 — Metadata provisoria en todo el bloque

- Severidad: alta.
- Evidencia: SPEC-157–171 mantienen type, phase y priority `TBD`, sin owner/reviewer ni
  dependencias autoritativas.
- Resolución: normalizar quince README con SPEC-225 y asignar responsables.

### REP-REV-002 — Score/fórmula sin contrato de normalización

- Severidad: alta.
- Evidencia: ReputationScore admite fuentes/escalas y formulaVersion, pero no define mapping,
  weighting, ventanas, mínimos, outliers, edición/borrado ni tratamiento de fuentes ausentes.
- Riesgo: dashboards/eventos pueden mostrar números irreproducibles o comparaciones engañosas.
- Resolución: especificar fórmula versionada, inputs, normalización, incertidumbre y fixtures
  dorados; evitar un score único si no es comparable.

### REP-REV-003 — Conectores externos sin validación por proveedor

- Severidad: alta.
- Evidencia: el puerto es correcto, pero no hay evidencia por plataforma sobre API disponible,
  scopes, cuotas/free tier, webhooks/polling, almacenamiento permitido, attribution y borrado.
- Riesgo: diseñar una feature que viole términos, requiera pago o no pueda obtener datos.
- Resolución: spike fechado por proveedor con fuentes oficiales, resultado PASS/FAIL/INCONCLUSIVE,
  costo, límites y exit strategy antes de priorizar adapter.

## Findings medios

### REP-REV-004 — Consentimiento/base de tratamiento necesita matriz

Feedback propio, reseña pública importada, rating y análisis por tercero tienen propósitos/bases
distintos. Definir campo→purpose→base/consent→retención→roles→delete y no asumir que “público”
autoriza almacenamiento o ML ilimitado.

### REP-REV-005 — Moderación/case management sin workflow

REVIEWED/RESOLVED/REDACTED y acknowledge/assign/resolve necesitan estados, actor, reason,
concurrencia, reapertura y relación con contenido original. Redactar internamente no debe fingir
borrado en la plataforma externa.

### REP-REV-006 — Sentiment provider y evaluación no están gobernados

Definir procesamiento local/externo, no-retención del proveedor, residencia, redacción previa,
presupuesto y dataset/evals por idioma. Baja confianza se abstiene y nunca automatiza sanción a
empleados ni respuesta pública.

### REP-REV-007 — Capability de submit requiere threat model

Token de feedback necesita scope, expiración, revocación, hash at rest, rate limit y
anti-enumeración; no debe revelar Visit/Order ni permitir múltiples submissions ilimitados.

### REP-REV-008 — Roles no canónicos

`customer`, `staff` y `reputation analyst` deben mapear a GUEST/roles existentes o permission
assignments versionados. Acceso a texto, PII, export y model administration son permisos distintos.

### REP-REV-009 — SampleSize en evento puede debilitar supresión

ReputationUpdated incluye sampleSize. En sucursales/períodos pequeños puede permitir inferencia;
aplicar los mismos umbrales/buckets del dashboard también a eventos y logs.

## Evidencia positiva

- Feedback separa identidad y permite redacción preservando auditoría.
- Rating usa escala/dimensión versionadas y agregados sin identidad.
- ExternalReview conserva provenance, edición y borrado remoto.
- Sentiment conserva modelo/prompt/confianza y no reemplaza el texto original.
- APIs declaran freshness, cobertura, supresión y límites de privacidad.
- Eventos omiten texto, autor, token y PII.
- Integraciones encapsulan SDKs/credenciales y degradan sin bloquear operación.
- RBAC deniega texto/PII por defecto y audita exportaciones.

## Próxima revisión

Revisar después de resolver REP-REV-001–003. La evidencia debe incluir fórmula dorada, matriz de
privacidad, workflows de moderación, evals de sentimiento y spikes oficiales por plataforma con
costos/cuotas vigentes.
