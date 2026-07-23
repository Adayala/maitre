# Contrato de roles y navegación documental — SPEC-225

## Propósito

Todo documento debe tener rol, autoridad, lifecycle y punto de entrada. La mera presencia en el
filesystem no lo vuelve descubrible ni autoritativo.

## Roles

| Rol | Semántica |
| --- | --- |
| `AUTHORITATIVE` | define obligación, schema, lifecycle o decisión vigente |
| `DERIVED` | proyección reproducible de fuentes autoritativas |
| `EVIDENCE` | registra observación, ejecución, hash, review u outcome |
| `AUDIT` | fotografía/findings de un corte; no cambia autoridad |
| `MIGRATION` | mapping/plan/manifest temporal con lifecycle |
| `GUIDE` | orientación no normativa |
| `HISTORICAL` | contenido preservado, no vigente |

Un documento puede tener un rol primario y referencias a otros, pero no mezclar autoridad y
evidencia sin secciones claramente separadas.

## Metadata lógica

```yaml
document:
  role: AUTHORITATIVE | DERIVED | EVIDENCE | AUDIT | MIGRATION | GUIDE | HISTORICAL
  owner: <asignación o UNASSIGNED>
  status: DRAFT | ACTIVE | DEPRECATED | SUPERSEDED | RETIRED
  authorityRefs: [<documentos/IDs>]
  successor: <path/ID o null>
  effectiveFrom: <commit/ref o null>
```

Durante migración puede inferirse el rol sólo como propuesta; no se promueve a `ACTIVE`.

El envelope, identidad, estados migratorios, compatibilidad y códigos están definidos en
`document-metadata-envelope-contract.md`.

## Punto de entrada

- Cada spec posee README raíz.
- Todo archivo Markdown raíz de la spec se enlaza desde ese README o desde un índice enlazado por él.
- Subdirectorios poseen `README.md` cuando contienen más de un artifact o lifecycle propio.
- Un artifact puede aparecer en varios índices, pero conserva una autoridad primaria.
- Links usan rutas relativas resolubles y texto que describa rol/outcome.

No se exige listar evidence artifacts efímeros individualmente si un índice versionado los cubre.

## Autoridad

Orden de resolución:

1. spec/contract/ADR vigente identificado;
2. contratos especializados enlazados;
3. registro/review/evidence;
4. auditorías/migraciones;
5. guías/historia.

Una auditoría que detecta contradicción abre finding; no sobrescribe el contrato. Un guide no puede
introducir requisitos exclusivos.

## Lifecycle y successors

`DEPRECATED`, `SUPERSEDED` o `HISTORICAL` deben enlazar successor/razón y permanecer navegables desde
un índice histórico. Eliminar un link no retira autoridad por sí solo.

Un documento retirado puede salir del índice principal sólo cuando no tenga consumidores activos y
exista registro de retiro.

## Detección de huérfanos

Se considera huérfano un Markdown que:

- no está enlazado desde README/índice alcanzable;
- no está expresamente clasificado como artifact generado/efímero;
- no tiene successor/registro histórico;
- o sólo es alcanzable desde un link roto.

El gate futuro recorre enlaces relativos excluyendo fenced examples, URLs externas y artifacts
declarados fuera de Git.

La extracción, resolución de rutas/fragments, clasificación, grafo, subcódigos y baseline están
definidos por `markdown-link-reachability-contract.md`. Este documento define la política
documental; aquel contrato define el resultado mecánico esperado.

## Estructura recomendada del README

```text
Metadata
Decisiones/summary
Contratos autoritativos
Artefactos base
Migraciones/evidencia
Auditorías/reviews
Históricos
```

El orden ayuda a distinguir autoridad; no cambia semántica.

## Línea base SPEC-225

Antes de este contrato, SPEC-225 contenía 42 Markdown raíz auxiliares y seis no estaban enlazados
desde README:

- `final-specification-audit.md`;
- `legacy-path-retirement-contract.md`;
- `placeholder-readme-migration.md`;
- `platform-dependency-contract.md`;
- `semantic-consistency-audit.md`;
- `structure.md`.

Se incorporan como navegación, no como aprobación de su contenido.

## Criterios de salida

- [ ] Cero Markdown raíz huérfano por spec.
- [x] Subdirectorios actuales con múltiples artifacts poseen índice.
- [ ] Cada documento declara rol/lifecycle durante migración.
- [ ] Autoridad y evidencia no se confunden.
- [ ] Históricos enlazan successor/retirement.

Los checks permanecen abiertos para el conjunto global.

Los conteos, categorías y lotes del conjunto completo están en
`global-navigation-baseline.md`.

El umbral, cobertura directa, parent links y baseline de subdirectorios están en
`subdirectory-index-contract.md`.
