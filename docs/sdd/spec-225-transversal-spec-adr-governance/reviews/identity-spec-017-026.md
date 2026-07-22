# Revisión de contratos — Identity SPEC-017–026

| Campo | Valor |
| --- | --- |
| Alcance | SPEC-017–026 |
| Commit revisado | `2ac8a5f` |
| Protocolo | `contract-review-checklist.md` |
| Outcome | `BLOCKED` |
| Autoridad para implementar | No otorgada |

## Resultado ejecutivo

La separación entre autenticación externa, User global y autorización tenant-scoped mediante
Membership es sólida. Los contratos fallan cerrado, no confían en claims editables, minimizan
tokens/PII y cubren delegación, branch scope, último OWNER, revocación e idempotencia.

La aprobación queda bloqueada por gobernanza y por un ciclo declarado de dependencias. La
existencia de código o tests en el checkout no sustituye la aprobación requerida por SPEC-225.

## Findings bloqueantes

### ID-REV-001 — Ciclo SPEC-017 ↔ SPEC-020

- Severidad: alta.
- Evidencia: SPEC-017 declara dependencia de SPEC-020; SPEC-020 declara dependencia de SPEC-017.
- Riesgo: orden de implementación/revisión y ownership de invariantes quedan indeterminados.
- Resolución: User puede referenciar conceptualmente Membership sin depender de su
  implementación; definir dirección de dependencia y actualizar metadata autoritativa,
  registry y tests de ciclos en el mismo cambio.

### ID-REV-002 — Owner/reviewer sin resolver

- Severidad: alta.
- Afecta: SPEC-017–026.
- Evidencia: metadata `UNASSIGNED`.
- Resolución: asignar owner y reviewer autorizados y registrar outcome contra commit exacto.

### ID-REV-003 — Readiness/lifecycle no canónicos

- Severidad: alta.
- Afecta: SPEC-017, SPEC-020 y SPEC-023.
- Evidencia: `WALKING_SKELETON_I0` no pertenece al enum vigente de SPEC-225 y coexiste con
  `Estado: IN_PROGRESS` sin aprobación registrada.
- Resolución: adoptar formalmente el valor o migrarlo; reconstruir o corregir la decisión de
  lifecycle preservando historial.

## Findings medios

### ID-REV-004 — Código de rol no uniforme

SPEC-018 README presenta `MAÎTRE`, mientras el contrato normativo define `MAITRE` ASCII. El
código persistido debe tener una única representación; la forma acentuada debe limitarse a la
etiqueta localizada. Alinear README, seeds, schemas y matrices antes de fijar datos.

### ID-REV-005 — Estrategia browser/session pendiente

SPEC-023 admite cookies o tokens según arquitectura elegida. Antes de aprobar el walking
skeleton debe fijarse mediante ADR el mecanismo concreto, almacenamiento, CSRF, refresh,
logout y revocación. La abstracción del proveedor y la prohibición de service-role en browser
se mantienen cualquiera sea la decisión.

### ID-REV-006 — Dependencias históricas incompletas

SPEC-018, 019 y 021–026 expresan relaciones en narrativa pero no serializan `Depende de` de
forma uniforme. Normalizar con el schema/baseline del registro para habilitar validación de
ruta crítica y consumidores.

## Evidencia positiva

- User no contiene credenciales, roles, tenants ni scopes.
- Membership es la autoridad tenant-scoped y conserva assignments normalizados.
- Revocación se evalúa server-side aunque el JWT siga vigente.
- Último OWNER, self-grant, peer admin y delegación superior están prohibidos.
- Auth valida issuer, audience, algoritmo, JWKS y tiempos mediante allowlists.
- Invitaciones y eventos no transportan tokens; datos de seguridad tienen retención explícita.
- APIs usan idempotencia, optimistic concurrency, Problem Details y anti-enumeración.
- Supabase Auth permanece detrás de un adapter y no se convierte en modelo de dominio.

## Próxima revisión

Revisar después de resolver ID-REV-001–005. La evidencia debe incluir ADR de sesión, catálogo
canónico de roles/permisos, matriz completa API→permission y contract tests de aislamiento,
revocación, rotación JWKS e invitación concurrente.

Contratos de remediación:

- [Sesión browser propuesta](../../spec-023-api-auth/browser-session-contract.md)
- [DAG y códigos canónicos](../../spec-026-rbac-identity/identity-dependency-contract.md)

La estrategia de sesión continúa bloqueada hasta ADR/spike aprobado; los documentos no asignan
owner/reviewer ni promueven readiness.
