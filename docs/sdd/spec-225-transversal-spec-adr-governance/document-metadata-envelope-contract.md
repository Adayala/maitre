# Contrato de metadata documental — SPEC-225

## Propósito

Definir un envelope machine-readable para identidad, rol, autoridad y lifecycle de cada Markdown
versionado bajo `docs/sdd/`. La metadata de la spec y la metadata del documento son distintas.

Este contrato no inserta front matter en documentos existentes ni asigna roles automáticamente.

## Estado del schema

```yaml
schema:
  name: SDD_DOCUMENT_METADATA
  schemaVersion: 1
  status: PROPOSED_FOR_REVIEW
  owner: UNASSIGNED
  reviewers: [UNASSIGNED]
  effectiveFrom: null
```

Hasta aprobación, los documentos existentes permanecen `LEGACY_UNCLASSIFIED`; no son inválidos por
retroactividad ni se consideran migrados.

## Formato

El formato propuesto es YAML front matter al inicio del archivo, antes del primer heading:

```yaml
---
sddDocument:
  schemaVersion: 1
  documentId: SDD-DOC-NNNNN
  specRef: SPEC-NNN | null
  title: <título>
  role: AUTHORITATIVE | DERIVED | EVIDENCE | AUDIT | MIGRATION | GUIDE | HISTORICAL
  status: DRAFT | ACTIVE | DEPRECATED | SUPERSEDED | RETIRED
  ownerRef: <OWN-NNN o UNASSIGNED>
  authorityRefs: [<typed references>]
  generatedFrom: [<typed references>]
  successorRef: <documentId o null>
  effectiveFrom: <commit completo o null>
  reviewRefs: [<DOC-REV IDs>]
---
```

El bloque se serializa una sola vez. Un snippet dentro de fenced code nunca cuenta como envelope.

## Identidad

- `documentId` usa `SDD-DOC-NNNNN`, asignado por registro, único e inmutable.
- No se deriva del path, título, filename, spec ni posición.
- Mover/renombrar conserva ID y actualiza consumers.
- El ID retirado no se reutiliza.
- Un split crea nuevos IDs y mapping; un merge elige nueva identidad salvo decisión explícita.
- El README de una spec también tiene document ID; `SPEC-NNN` identifica el contrato de producto,
  no el archivo README.

La asignación, registro, concurrencia, aliases y tombstones se rigen por
`document-id-registry-allocation-contract.md`.

Durante migración, path + blob hash identifican provisionalmente al legacy; no se publica un ID
hasta aprobar mapping.

## Aplicabilidad

Requieren envelope:

- Markdown raíz de `docs/sdd/`;
- README y artefactos raíz de cada spec;
- índices de subdirectorios;
- reviews, evidence, migrations e históricos versionados;
- documentos derivados/generados que se versionen.

No aplica a:

- archivos no Markdown;
- artifacts efímeros no versionados expresamente fuera de Git;
- ejemplos embebidos;
- outputs temporales en directorios de build excluidos.

Un archivo untracked no se incorpora al registro sólo porque exista en el worktree.

## Semántica de campos

### `specRef`

- obligatorio para artifacts pertenecientes a una spec;
- `null` para índices transversales sin owner spec;
- no cambia autoridad;
- no admite múltiples specs: un documento cross-spec declara una owner spec y referencias
  adicionales en `authorityRefs`.

### `role`

Usa las definiciones de `document-role-navigation-contract.md`. Es exactamente uno. Colecciones
mixtas declaran roles por documento; su índice separa `indexRole` de `collectionRoles`.

### `status`

- `DRAFT`: documento propuesto, no efectivo.
- `ACTIVE`: vigente para su rol y scope.
- `DEPRECATED`: vigente temporalmente, successor recomendado.
- `SUPERSEDED`: reemplazado, no fuente vigente.
- `RETIRED`: fuera de uso, conservado o registrado históricamente.

`ACTIVE` no significa que la spec esté implementada. Status documental no reemplaza lifecycle,
readiness ni outcome de la spec.

### Autoridad y derivación

- `authorityRefs`: fuentes que gobiernan el contenido.
- `generatedFrom`: inputs reproducibles para un `DERIVED`.
- `successorRef`: requerido para `SUPERSEDED`; para `RETIRED` puede ser nulo con retiro aprobado.
- `reviewRefs`: evidencia de revisión, no aprobación implícita.
- `effectiveFrom`: sólo para estados efectivos; nunca fecha libre en lugar de commit.

El formato, resolution modes, refs legacy y lifecycle se rigen por
`document-reference-identity-contract.md`.

## Invariantes por rol

| Rol | Requisitos |
| --- | --- |
| `AUTHORITATIVE` | owner aceptado para `ACTIVE`, authority scope explícito, review |
| `DERIVED` | `generatedFrom` no vacío, procedimiento/tool versionado |
| `EVIDENCE` | subject/commit/environment/outcome según contrato aplicable |
| `AUDIT` | corte/scope/provenance; no sobrescribe autoridad |
| `MIGRATION` | source/target mapping, lifecycle temporal, rollback |
| `GUIDE` | authorityRefs; no introduce requisitos exclusivos |
| `HISTORICAL` | razón de preservación y successor/retirement ref |

Un role válido con campos incompatibles produce finding; no se “arregla” cambiando role
automáticamente.

## Estados migratorios

```text
LEGACY_UNCLASSIFIED → MAPPED → PROPOSED → ACTIVE
                                  ├→ SUPERSEDED
                                  └→ RETIRED
```

- `LEGACY_UNCLASSIFIED`: sin envelope aprobado.
- `MAPPED`: identidad/rol propuestos fuera del documento.
- `PROPOSED`: envelope aplicado en batch, todavía bajo review.
- `ACTIVE`: review aprobó metadata y contenido aplicable.

`PROPOSED` se representa con status documental `DRAFT`; no se agrega al enum persistido.

## Línea base

Relevamiento al crear este contrato:

```yaml
baselineId: DOCM-BASE-001
status: OBSERVED_NOT_FROZEN
trackedMarkdown: 2153
worktreeMarkdown: 2188
trackedByLocation:
  sddRoot: 17
  specRoot: 2103
  nested: 33
worktreeByLocation:
  sddRoot: 17
  specRoot: 2137
  nested: 34
canonicalEnvelopes:
  tracked: 0
  worktree: 0
legacyUnclassified:
  tracked: 2153
  worktree: 2188
```

Seis archivos contienen líneas parecidas a `role:` dentro de schemas/propuestas; ninguno posee el
front matter de este contrato. Cero tablas detectadas declaran un campo documental `Role/Rol`.

Los 35 archivos de diferencia neta worktree↔tracked no se interpretan como un lote único: el
worktree incluye cambios untracked/deleted concurrentes que requieren snapshot y ownership.

`DOCM-BASE-001` es un corte histórico, no un contador vivo. Nuevas especificaciones documentales
pueden aumentar el worktree mientras el schema siga sin activar; congelar un baseline ejecutable
requiere subject commit/snapshot nuevo.

## Migración

La adopción se realiza por lotes:

1. congelar subject commit y snapshot;
2. inventariar paths/blobs;
3. proponer IDs/roles/status sin editar;
4. revisar mappings, splits y authorityRefs;
5. aplicar envelopes como `DRAFT`;
6. validar schema, links y unicidad;
7. emitir DOC-REV;
8. promover sólo metadata aprobada.

Orden sugerido:

```text
índices existentes → SPEC-225 pilot → SPEC-226 evidence →
documentos transversales → bloques de dominio → raíces globales
```

Es una secuencia de riesgo/revisión, no prioridad de producto.

## Ratchet

```yaml
baseline:
  trackedCanonical: 0
  trackedLegacy: 2153
rules:
  newTrackedMarkdownWithoutEnvelope: FAIL_AFTER_ACTIVATION
  canonicalToLegacy: FORBIDDEN
  duplicateDocumentId: FORBIDDEN
  activeWithoutReview: FORBIDDEN
  legacyCountMayOnlyDecrease: true
```

Antes de activar el schema, el ratchet informa deuda sin bloquear cambios ajenos. La activación
requiere política de transición explícita para no impedir toda documentación mientras se migra.

## Compatibilidad

- Agregar campo opcional compatible incrementa revisión menor del schema.
- Cambiar semántica/enum/obligatoriedad crea nueva schemaVersion.
- Readers rechazan versiones desconocidas.
- Un documento no contiene dos versiones simultáneas.
- Migrar schema genera mapping y conserva envelope anterior en historia Git, no duplicado inline.

## Códigos

| Código | Condición |
| --- | --- |
| `DOCM001` | front matter ausente cuando es requerido |
| `DOCM002` | schema/version/serialización inválidos o duplicados |
| `DOCM003` | document ID inválido, duplicado o reutilizado |
| `DOCM004` | specRef/path/registro inconsistente |
| `DOCM005` | role/status inválido o incompatible |
| `DOCM006` | owner/authority/generatedFrom requerido ausente |
| `DOCM007` | successor/retirement/supersession inválido |
| `DOCM008` | review/effectiveFrom incompatible o prematuro |
| `DOCM009` | mapping/split/merge/move incompleto |
| `DOCM010` | baseline crece, drift o serialización no determinista |
| `DOCM011` | contenido sensible en metadata |
| `DOCM012` | versión desconocida o migración incompatible |

## Seguridad y determinismo

- Metadata no contiene secretos, PII, tokens ni URLs firmadas.
- Refs apuntan a evidence durable con control de acceso.
- YAML UTF-8/LF y orden canónico.
- Arrays se ordenan por ID salvo que el orden sea semántico y esté declarado.
- Cero timestamps en metadata comparable.
- Paths relativos, nunca rutas locales absolutas.
- El parser no ejecuta tags, aliases ni tipos YAML arbitrarios.

## Criterios de salida

- [x] Envelope, identidad, roles, status e invariantes especificados.
- [x] Aplicabilidad, migración, compatibilidad y ratchet especificados.
- [x] Baseline tracked/worktree relevado.
- [x] Doce códigos definidos.
- [x] Especificar fixtures `DOCM`.
- [ ] Aprobar schemaVersion 1.
- [x] Preparar primer mapping sin editar documentos.
- [ ] Ejecutar piloto sólo después de snapshot/review.

Los últimos dos checks permanecen abiertos. Los casos normativos están en
`document-metadata-fixture-catalog.md`; cobertura canónica de `DOCM-BASE-001`: `0/2153 tracked`.

El primer mapping propuesto está en `document-metadata-pilot-manifest.md`; continúa `PLANNED` y no
satisface todavía los checks de aprobación o ejecución.
