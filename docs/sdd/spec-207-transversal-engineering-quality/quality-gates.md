# Matriz de quality gates — SPEC-207

Los scripts son el contrato estable. La herramienta interna puede cambiar mediante ADR sin modificar el significado del gate.

## Scripts raíz

| Gate | Script npm raíz | PR afectado | `main` | Release |
| --- | --- | ---: | ---: | ---: |
| formato | `npm run format:check` | sí | sí | sí |
| Markdown/SDD/links | `npm run specs:validate` | sí | sí | sí |
| lint | `npm run lint` | sí | sí | sí |
| tipos | `npm run typecheck` | sí | sí | sí |
| boundaries | `npm run deps:check` | sí | sí | sí |
| unit/component | `npm run test:unit` | sí | sí | sí |
| integración | `npm run test:integration` | si afecta datos/adapters | sí | sí |
| contratos/OpenAPI | `npm run test:contract` | si afecta boundary | sí | sí |
| build | `npm run build` | sí | sí | sí |
| dependency audit | `npm run security:audit` | sí | sí | sí |
| secret scan | `npm run secrets:scan` | sí | sí | sí |
| coverage | `npm run test:coverage` | sí | sí | sí |
| Sonar | `npm run sonar` | según modalidad SPK-05 | sí | sí |
| E2E walking skeleton | `npm run test:e2e:smoke` | si afecta recorrido | sí | sí |
| E2E/matriz completa | `npm run test:e2e` | no por defecto | programado | sí |

“Afectado” se decide mediante reglas versionadas por workspace/path. Cambios en contratos, config compartida, lockfile, toolchain o scripts raíz invalidan el filtro y ejecutan todos los gates relevantes.

## Política de fallo

- Todo gate obligatorio falla cerrado: exit code distinto de cero bloquea integración.
- Warnings nuevos de lint no están permitidos; el baseline inicial debe ser cero.
- Tests reintentados conservan el primer fallo y siguen la política de flakiness de SPEC-224.
- Un scanner indisponible no produce PASS. El job distingue `FAILED` de `BLOCKED/INFRA_ERROR` y ambos bloquean cuando el gate es requerido.
- Cancelar runs obsoletos ahorra cuota; nunca cancela el último run del commit candidato.
- Artifacts se retienen el mínimo necesario y no contienen secrets o datos reales.

## Sonar sobre código nuevo

| Métrica | Umbral inicial |
| --- | ---: |
| blocker issues | 0 |
| critical issues | 0 |
| vulnerabilidades nuevas | 0 |
| security hotspots revisados | 100 % |
| coverage | >= 80 % |
| duplicación | <= 3 % |
| maintainability | A |
| reliability | A |
| security | A |

La modalidad concreta permanece pendiente de SPK-05. El token de análisis es server/CI-only, se restringe a eventos confiables y nunca se entrega a builds de forks no autorizados.

## Evidencia mínima por run

- commit SHA, Node/npm y lockfile;
- resultado/duración por gate;
- tests y coverage en formatos consumibles por CI/Sonar;
- seed y ambiente para fallos reproducibles;
- links sanitizados a artifacts;
- consumo aproximado de minutos/storage para SPEC-208.

## Canarios de aceptación

Antes de proteger `main`, un cambio temporal demuestra que cada gate detecta: formato inválido, lint, type error, dependency boundary, test fallido, breaking OpenAPI, secreto canario, dependencia vulnerable controlada y Quality Gate Sonar fallido. Los canarios se eliminan en el mismo ejercicio y la evidencia queda enlazada desde SPEC-226 SPK-05.
