# Notas — SPEC-002

## Asunciones

- Slug generación es determinística (mismo input → mismo slug)
- Config JSONB puede crecer sin impactar performance
- Branches siempre heredan config si no la sobrescriben

## Riesgos

| Riesgo | Prob | Impacto | Mitigación |
| --- | --- | --- | --- |
| Slug collision | Baja | Alto | Unique constraint + error handling |
| Config mutation | Media | Medio | Immutable updates, tests |
| Performance de JSONB | Baja | Medio | Indexes, benchmarks |

## Decisiones de diseño

### Config como JSONB vs separate columns

**Contexto:** Brand tiene varias configs (language, currency, policies)

**Alternativas:**
1. Columns por cada config (30+ columns)
2. JSONB flexible (elegido)
3. Separate config table (overkill)

**Decisión:** JSONB
**Por qué:** Flexibilidad, menos migrations, busquedas posibles

## Relacionadas

- SPEC-001 Tenant (padre)
- SPEC-004 Branch (hijo, hereda)
- SPEC-037 Menu (opcional, referenced)
- SPEC-008 Brands API
- SPEC-014 BrandCreated Event
