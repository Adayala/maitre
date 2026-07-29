# Contrato de delivery I0 — SPEC-221

## Estado de capacidades

| Capacidad                          | Estado inicial                             |
| ---------------------------------- | ------------------------------------------ |
| workflows GitHub Actions           | IMPLEMENTED                                |
| check `ci/required`                | NOT_IMPLEMENTED                            |
| branch protection                  | NOT_VERIFIED                               |
| Deploy Vercel por GitHub Actions   | IMPLEMENTED                                |
| Vercel Git integration             | NOT_REQUIRED para el delivery autoritativo |
| Preview deployments                | NOT_VERIFIED                               |
| Deploy selectivo desde `main`      | IMPLEMENTED                                |
| staged Production/demo sin rebuild | NOT_IMPLEMENTED                            |
| migration workflow                 | NOT_IMPLEMENTED                            |
| Production comercial               | DISABLED                                   |

## Workflow PR

Eventos permitidos: `pull_request` sobre `main`; `workflow_dispatch` sólo para diagnóstico aprobado. Permisos globales iniciales:

```yaml
permissions:
  contents: read
```

Jobs que necesiten publicar checks/reports solicitan únicamente el permiso adicional en ese job. PRs de forks/no confiables no ejecutan código con secrets ni usan `pull_request_target` para checkout del head.

```text
affected
  ├── quality: format + lint + typecheck + deps + SDD + unit/coverage + security + budgets + SBOM
  ├── CodeQL: JavaScript/TypeScript
  └── e2e: matriz de clientes afectados
        ↓
 push main → deploy: matriz Vercel afectada
```

La agregación futura `ci/required`, integration/RLS y preview smoke continúan pendientes. El job
`affected` siempre corre y decide explícitamente si E2E/deploy aplican; una ruta desconocida
selecciona todo.

`ci/required` usa `if: always()` y falla si un job obligatorio falló, fue cancelado o se omitió indebidamente. Los jobs no aplicables retornan éxito explícito con razón; no dependen de workflows enteros que nunca disparan y dejan checks pending.

## Reglas de cache y artifacts

- cache key incluye OS, Node/npm y hash de lockfile/config relevante;
- cache nunca contiene `.env`, tokens, DB, browser session o artifacts ejecutables no verificados;
- reports se retienen el mínimo necesario y se sanitizan;
- Playwright trace/video sólo ante fallo;
- concurrency cancela runs anteriores de la misma PR, no el SHA candidato actual.

## Delivery demo

1. PR SHA ejecuta Quality, CodeQL y E2E afectados sin secretos de deploy.
2. Review/checks permiten squash merge.
3. El SHA integrado en `main` repite los gates.
4. Si pasan, GitHub Actions ejecuta `vercel pull` y `vercel deploy --prod` sólo para la matriz
   afectada.
5. GitHub Actions y Vercel registran job, SHA y deployment.
6. Ante fallo de gates no se despliega; ante fallo de una aplicación, las demás matrices no se
   cancelan.

Preview aislado, smoke post-deploy, promoción staged sin rebuild e instant rollback permanecen
como estado objetivo, no como capacidad ya verificada.

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
