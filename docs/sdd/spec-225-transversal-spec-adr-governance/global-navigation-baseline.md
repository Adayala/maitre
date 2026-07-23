# Línea base global de navegación documental — SPEC-225

## Corte

Relevamiento textual sobre los 226 directorios `docs/sdd/spec-NNN-*`.

| Grupo | Specs | Markdown raíz sin enlace directo desde README |
| --- | ---: | ---: |
| README raíz versionados | 90 | 289 en 84 specs |
| README raíz no versionados | 136 | 1.088 |

“Sin enlace directo” significa que el filename no aparece como destino relativo en el README raíz.
El análisis posterior de reachability desde cada README versionado confirmó:

| Clasificación | Cantidad |
| --- | ---: |
| `INDIRECTLY_REACHABLE` | 0 |
| `TRUE_ORPHAN` | 289 |

El resultado se limita a Markdown raíz dentro de la misma spec. Excluye fenced examples y links
externos; exige un camino relativo válido desde el README propietario.

## Distribución versionada

| Filename | Sin enlace directo |
| --- | ---: |
| `structure.md` | 83 |
| `plan.md` | 64 |
| `tasks.md` | 63 |
| `objective.md` | 60 |
| `rules.md` | 5 |
| `verification.md` | 4 |
| contratos especializados | 10 |

Los diez contratos especializados son:

- `organization-readiness-contract.md`;
- `browser-session-contract.md`;
- `identity-dependency-contract.md`;
- `subscription-authority-contract.md`;
- `catalog-authority-contract.md`;
- `audit-dashboard-authority-contract.md`;
- `quality-baseline-contract.md`;
- `budget-register-contract.md`;
- `command-matrix.md`;
- `restore-exit-contract.md`.

## Clasificación requerida

Cada candidato recibe:

```text
DIRECTLY_LINKED | INDIRECTLY_REACHABLE | TRUE_ORPHAN |
GENERATED_EPHEMERAL | HISTORICAL_INDEXED | OWNERSHIP_BLOCKED
```

- `DIRECTLY_LINKED`: README apunta al archivo.
- `INDIRECTLY_REACHABLE`: README apunta a índice/documento que lo enlaza.
- `TRUE_ORPHAN`: no existe camino navegable ni excepción.
- `GENERATED_EPHEMERAL`: artifact excluido por contrato, con índice/retención.
- `HISTORICAL_INDEXED`: sólo accesible desde índice histórico deliberado.
- `OWNERSHIP_BLOCKED`: archivo/README local no versionado cuya navegación no puede editarse aún.

## Grafo de navegación

Roots:

- `docs/sdd/START_HERE.md`;
- `docs/sdd/INDEX.md`;
- `docs/sdd/SPECS.md`;
- README raíz de cada spec.

Edges: links Markdown relativos navegables fuera de fenced code. Se ignoran anchors, URLs externas,
mailto/data y ejemplos.

Un documento es alcanzable si existe path desde al menos un root aplicable. Para la cobertura interna
de una spec, el root obligatorio es su README.

## Reglas de remediación

1. No agregar todos los filenames como lista plana sin rol.
2. Enlazar contratos autoritativos directamente.
3. Agrupar evidencia/auditorías mediante índice cuando exista lifecycle propio.
4. Enlazar siempre los nueve artefactos base o un índice base inequívoco.
5. Preservar históricos mediante índice de historia/successor.
6. No editar README no versionado hasta resolver ownership.
7. Verificar links y reachability después del cambio.
8. Reducir el baseline por ratchet; no ocultar candidatos con allowlist genérica.

## Lotes propuestos

### NAV-01 — Artefactos base versionados

Scope: 83 structure, 64 plan, 63 tasks, 60 objective, 5 rules y 4 verification candidatos.

Clasificación: los 279 candidatos base son `TRUE_ORPHAN`.

Acción pendiente: agregar navegación agrupada sólo donde falte.

### NAV-02 — Contratos especializados

Scope: diez contratos listados.

Clasificación: los diez contratos son `TRUE_ORPHAN`.

Acción pendiente: enlace directo desde su README propietario, con rol `AUTHORITATIVE`.

### NAV-03 — Placeholders no versionados

Scope: 1.088 candidatos en 136 specs.

Estado: `OWNERSHIP_BLOCKED`; se integra con `placeholder-readme-migration.md`.

### NAV-04 — Índices globales

Scope: `START_HERE`, `INDEX`, `SPECS` y roots.

Resultado inicial: START_HERE, INDEX y SPECS alcanzan 0/226 README.

Acción: aplicar NAV-04A para los 90 README versionados y mantener NAV-04B bloqueado hasta NAV-03,
según `global-index-navigation-contract.md`.

El orden de lotes es documental y no indica prioridad de producto.

## Evidencia before/after

Cada lote reporta:

- archivos inspeccionados;
- clasificación por candidato;
- directos/indirectos/huérfanos;
- links agregados/removidos;
- links rotos;
- paths ownership-blocked;
- diff y reviewed commit.

El scope exacto, template, sub-lotes y ratchets están especificados en
`navigation-remediation-manifests.md`.

Los dos links rotos preexistentes se gobiernan mediante
`broken-link-remediation-register.md`; los lotes NAV no los ocultan.

## Estado actual

- SPEC-225: 43 Markdown raíz, cero sin enlace directo después de su normalización.
- Conjunto versionado restante: 289 `TRUE_ORPHAN`, cero indirectamente alcanzables.
- Conjunto no versionado: bloqueado por ownership.
- Se ejecutó reachability intradirectorio para README versionados; falta remediación y reachability
  global desde START_HERE/INDEX/SPECS.

## Criterios de salida

- [x] Los 289 candidatos versionados están clasificados.
- [ ] Cero `TRUE_ORPHAN` en specs versionadas.
- [ ] Los diez contratos especializados tienen navegación autoritativa.
- [ ] Los 1.088 candidatos locales se resuelven mediante ownership/migración.
- [ ] Roots globales alcanzan todas las specs activas.

Los checks permanecen abiertos.
