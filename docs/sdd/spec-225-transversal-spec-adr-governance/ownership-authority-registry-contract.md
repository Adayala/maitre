# Contrato del registro de ownership y autoridad — SPEC-225

## Propósito

Definir la fuente versionada para assignments `OWN`, delegaciones y relaciones de autoridad. Este
contrato especifica almacenamiento, identidad, historia y resolución; no crea el registro ni
incorpora identidades personales.

## Decisión propuesta

```yaml
registry:
  registryId: OWNERSHIP-AUTHORITY-REGISTRY-V1
  status: PROPOSED_NOT_APPROVED
  root: .sdd/governance/authority
  manifest: registry.yaml
  schemaVersion: 1
  format: YAML_UTF8_LF
  identityMode: PSEUDONYMOUS_STABLE_REF
  filesCreated: 0
```

La ruta es repository-relative y queda sujeta a `DOC-REV`. No es autoritativa mientras no se
apruebe y active.

## Layout lógico

```text
.sdd/governance/authority/
├── registry.yaml
├── identities/
│   └── IDN-NNNNN.yaml
├── assignments/
│   └── OWN-NNNNN.yaml
├── delegations/
│   └── OWN-DEL-NNNNN.yaml
├── relations/
│   └── OWN-AUTH-NNNNN.yaml
└── evidence/
    └── <record-id>.review.yaml
```

- Cada archivo contiene exactamente un record.
- Filename e ID interno deben coincidir.
- No se admiten symlinks, archivos temporales versionados ni nested roots.
- Evidence restringida queda fuera y se referencia por ID/hash.

## Manifest

```yaml
schemaVersion: 1
registryId: OWNERSHIP-AUTHORITY-REGISTRY-V1
status: DRAFT | ACTIVE | SUPERSEDED | RETIRED
revision: <entero monotónico>
subjectCommit: <sha completo>
records:
  identities: [<ID + path + hash>]
  assignments: [<ID + path + hash>]
  delegations: [<ID + path + hash>]
  relations: [<ID + path + hash>]
summary:
  byStatus: {}
  byCapability: {}
  byRiskTier: {}
reviewRef: <DOC-REV|null>
supersedesRevision: <entero|null>
```

`ACTIVE` exige paths/hashes completos, review exacta y cero IDs duplicados/reutilizados.

## Identidad

```yaml
identityId: IDN-NNNNN
identityType: PERSON | GROUP | SERVICE
stableRef: <opaque stable ref>
displayLabel: <no sensible>
status: ACTIVE | SUSPENDED | RETIRED
providerBinding:
  providerId: <provider profile|null>
  externalSubjectHash: sha256:<hex>|null
privacy:
  classification: INTERNAL
  personalDataStored: false
```

- El repo no almacena email, nombre legal, username mutable ni provider subject en claro.
- `stableRef` es opaco y no se deriva de PII.
- `displayLabel` es orientativo; no participa en autorización.
- `SERVICE` puede ejecutar automatización, pero no recibe `ACCEPT_RISK` ni `APPROVE_POLICY`.
- Retirar identidad no borra historia.

## Provider profile

Un provider es opcional y sólo verifica bindings/membership:

```yaml
providerId: IDP-NNN
providerType: SCM | DIRECTORY | HRIS | MANUAL_ATTESTATION
status: PROPOSED | ACTIVE | SUSPENDED | RETIRED
authority:
  verifiesIdentity: <bool>
  verifiesMembership: <bool>
  grantsCapabilities: false
freshness:
  maximumAge: <duration>
failureMode: UNKNOWN_BLOCKED
dataPolicy:
  persistedFields: [HASHED_SUBJECT, MEMBERSHIP_EVIDENCE_REF]
reviewRef: <DOC-REV>
```

El provider nunca concede capabilities. Outage/stale data produce `UNKNOWN_BLOCKED`; no se consulta
red desde el validator local/CI no autorizado.

## IDs y allocator

Namespaces independientes:

```text
IDN-NNNNN
OWN-NNNNN
OWN-DEL-NNNNN
OWN-AUTH-NNNNN
IDP-NNN
```

Reglas:

- IDs monotónicos, inmutables y nunca reutilizados;
- gaps permitidos;
- allocator usa registry revision esperada y compare-and-swap;
- dos reservas concurrentes no reciben el mismo ID;
- cancelación crea tombstone, no libera ID;
- importar legacy crea mapping explícito;
- no se calcula “máximo + 1” sin lock/revision verificada.

## Lifecycle e inmutabilidad

Records aceptados no se reescriben para cambiar semántica. Un cambio crea successor:

```yaml
successorId: <nuevo record ID>
supersedes: <record ID>
changeReason: <reason>
effectiveFrom: <commit/ref>
```

Eventos de status pueden registrarse en un record separado o nueva revisión según schema aprobada;
en ambos casos la historia previa y sus hashes permanecen verificables.

Eliminar, renombrar o compactar records requiere tombstone/mapping y no puede hacer reaparecer un ID.

## Resolución

Para autorizar un acto:

1. cargar manifest `ACTIVE` exacto;
2. verificar subject commit/revision/review;
3. resolver record por ID, path y hash;
4. resolver identity y provider evidence requerida;
5. evaluar vigencia, scope, capability, tier y conflictos;
6. resolver delegaciones/relations como DAG;
7. emitir decisión y cadena de derivación.

No se escanean archivos no listados para “descubrir” autoridad. Un record huérfano es finding, no
input efectivo.

## Atomicidad y concurrencia

- Una revisión agrega records, hashes y manifest en el mismo changeset.
- El manifest se publica último en escritura administrativa atómica.
- CI sólo lee y nunca repara/reordena.
- Cambiar revision esperada invalida propuesta concurrente.
- Merge automático de assignments/delegations está prohibido.
- Un successor de registry conserva predecessor y delta revisado.

## Privacidad y acceso

El registro minimiza datos:

- refs opacas y labels no sensibles;
- no emails/teléfonos/nombres legales;
- no tokens, membership dumps ni organigramas completos;
- evidence externa por hash/ref y retención explícita;
- reportes públicos usan IDs y outcomes;
- acceso a bindings restringidos se audita fuera del repo.

Derechos de privacidad corrigen/borran bindings personales donde corresponda sin borrar decisiones
históricas: se preserva una identity ref tombstoned no reversible.

## Reconciliación y drift

Proyecciones README/CODEOWNERS/provider se comparan con el manifest:

```text
IN_SYNC | DRIFTED | STALE | UNKNOWN | NOT_CONFIGURED
```

- drift nunca modifica el registro automáticamente;
- provider más reciente no sobrescribe assignments;
- reconciliation produce propuesta y review;
- discrepancies críticas bloquean decisiones nuevas;
- historia ya emitida se conserva y puede recibir finding/revocation.

## Backup y recuperación

- Git no es la única prueba: hashes y review enlazan contenido.
- Missing/corrupt manifest falla cerrado.
- No se elige “última revisión” por mtime o filename.
- Recovery restaura una revisión aprobada exacta y verifica hashes.
- Rollback semántico crea nueva revisión/successors; no reescribe historia.

## Códigos

| Código | Condición |
| --- | --- |
| `OWNR001` | root/layout/manifest/schema/path inválido |
| `OWNR002` | registry revision/commit/review/status inconsistente |
| `OWNR003` | ID/allocator/tombstone/mapping inválido o reutilizado |
| `OWNR004` | identity/binding/provider profile inválido |
| `OWNR005` | record/path/hash/manifest mismatch u orphan |
| `OWNR006` | lifecycle/successor/supersession/history inválido |
| `OWNR007` | resolución de assignment/delegation/relation inválida |
| `OWNR008` | atomicidad/concurrencia/revision esperada incumplida |
| `OWNR009` | provider/projection drift tratado como autoridad |
| `OWNR010` | privacidad/minimización/retención/acceso incumplido |
| `OWNR011` | symlink/traversal/contenido sensible o writer indebido |
| `OWNR012` | selección/resolución/serialización no determinista |

## Estado

```yaml
contractStatus: SPECIFIED_NOT_APPROVED
registryRootCreated: false
manifestCreated: false
identityProviderSelected: false
identitiesRegistered: 0
assignmentsRegistered: 0
delegationsRegistered: 0
relationsRegistered: 0
```

## Criterios de salida

- [x] Root, layout, manifest e identidad propuestos.
- [x] Provider, allocator, lifecycle y resolución especificados.
- [x] Atomicidad, privacidad, drift y recovery especificados.
- [x] Doce códigos definidos.
- [x] Especificar fixtures `OWNR`.
- [ ] Aprobar root/schema/provider/privacy mediante `DOC-REV`.
- [ ] Inicializar allocator/registry sólo con identities aceptadas.
