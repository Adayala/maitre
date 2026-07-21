# Contrato de delivery I0 — SPEC-221

## Estado de capacidades

| Capacidad | Estado inicial |
| --- | --- |
| workflows GitHub Actions | NOT_IMPLEMENTED |
| check `ci/required` | NOT_IMPLEMENTED |
| branch protection | NOT_VERIFIED |
| Vercel Git integration | pendiente confirmación del owner |
| Preview deployments | NOT_VERIFIED |
| staged Production/demo | NOT_CONFIGURED |
| migration workflow | NOT_IMPLEMENTED |
| Production comercial | DISABLED |

## Workflow PR

Eventos permitidos: `pull_request` sobre `main`; `workflow_dispatch` sólo para diagnóstico aprobado. Permisos globales iniciales:

```yaml
permissions:
  contents: read
```

Jobs que necesiten publicar checks/reports solicitan únicamente el permiso adicional en ese job. PRs de forks/no confiables no ejecutan código con secrets ni usan `pull_request_target` para checkout del head.

```text
changes
  ├── docs_quality: format + sdd:validate + secret scan
  ├── static: lint + typecheck + deps:check
  ├── unit_contract: unit/component + contract/OpenAPI
  ├── build: web + api (+ UI docs si ADR-004)
  ├── security: audit + Sonar cuando SPK-05 lo habilite
  ├── integration: PostgreSQL/RLS cuando el cambio aplica
  └── e2e: smoke sobre Preview cuando el recorrido aplica
        ↓
     ci/required (always)
```

`ci/required` usa `if: always()` y falla si un job obligatorio falló, fue cancelado o se omitió indebidamente. Los jobs no aplicables retornan éxito explícito con razón; no dependen de workflows enteros que nunca disparan y dejan checks pending.

## Reglas de cache y artifacts

- cache key incluye OS, Node/npm y hash de lockfile/config relevante;
- cache nunca contiene `.env`, tokens, DB, browser session o artifacts ejecutables no verificados;
- reports se retienen el mínimo necesario y se sanitizan;
- Playwright trace/video sólo ante fallo;
- concurrency cancela runs anteriores de la misma PR, no el SHA candidato actual.

## Delivery demo

1. PR SHA obtiene Preview con `APP_ENV=preview` y variables mínimas.
2. `ci/required` y review permiten squash merge.
3. `main` genera un Production deployment staged con variables `APP_ENV=demo`.
4. El dominio demo no se auto-asigna.
5. Se ejecutan health, smoke, synthetic y headers/security checks sobre staged URL.
6. Owner aprueba y promueve ese deployment sin rebuild.
7. Se registra deployment ID, SHA, config revision y evidencia.
8. Ante fallo, no se promueve; si ya era current, instant rollback al deployment compatible anterior.

## Migraciones

El workflow de migración no corre en PR, Preview, build ni API startup. Requiere:

- trigger manual/autorizado;
- target/`MIGRATION_ENV` verificados;
- `DATABASE_MIGRATION_URL` sólo en ese contexto;
- lock contra ejecución concurrente;
- migration status/plan visible antes de aplicar;
- migración desde cero/anterior ya probada;
- compatibilidad con app anterior;
- evidencia sanitizada y smoke posterior.

Cambios destructivos permanecen bloqueados en I0 hasta que SPEC-220 tenga backup durable aplicable; SPK-06 temporal no autoriza datos no regenerables.

## Branch protection objetivo

- pull request obligatorio;
- `ci/required` requerido y ligado a la GitHub App esperada cuando sea posible;
- branch actualizada antes de merge según política elegida;
- force pushes y deletion deshabilitados;
- conversaciones resueltas;
- una aprobación cuando exista reviewer independiente;
- admins incluidos salvo procedimiento break-glass documentado.

La configuración real se audita por API/dashboard y se adjunta como evidencia sin tokens. Si el plan/visibilidad no soporta el objetivo, I0 permanece NOT READY.
