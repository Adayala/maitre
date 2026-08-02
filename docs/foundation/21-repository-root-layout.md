# Organización del root y artefactos

## Objetivo

Mantener el root del monorepo pequeño, predecible y libre de outputs transitorios dispersos. La
estructura normativa de workspaces vive en SPEC-209; este inventario explica el estado físico
vigente y cómo interpretar cada directorio.

## Directorios versionados de producto e ingeniería

| Directorio  | Responsabilidad                                      | ¿Se puede mover/unificar?             |
| ----------- | ---------------------------------------------------- | ------------------------------------- |
| `apps/`     | API y seis aplicaciones web desplegables             | No; boundary de workspaces            |
| `packages/` | contratos, telemetría y módulos de dominio           | No; boundary de workspaces            |
| `adapters/` | persistencia e identidad concretas                   | No; boundary arquitectónico           |
| `tests/`    | suites transversales, especialmente Playwright       | No; ownership de tests                |
| `tooling/`  | automatización de calidad, delivery, seguridad y E2E | No; código ejecutable del repo        |
| `supabase/` | migraciones y configuración Supabase                 | No; fuente versionada de persistencia |
| `docs/`     | Foundation, SDD, ADRs, runbooks e investigación      | No; documentación autoritativa        |
| `.github/`  | workflows y templates de colaboración                | No; configuración de plataforma       |

## Única raíz de artefactos transitorios

```text
.artifacts/
├── coverage/node-test-coverage.txt
├── playwright/report/
├── playwright/results/
├── quality/                    # SBOM y evidencia sanitizada de observabilidad
├── typescript/root.tsbuildinfo
└── archive/
```

`.artifacts/` está ignorado por Git y puede eliminarse/recrearse sin perder fuente ni datos de
negocio. `ARTIFACTS_DIR` permite redirigir coverage y Playwright en un runner sin cambiar código.

Los `dist/` internos de `apps`, `packages` y `adapters` no se trasladan: son builds consumidos por
Node, Vite preview, tests compilados y los campos `main`/`types` de cada workspace. Sólo se elimina
el antiguo `dist/` del root, que contenía exclusivamente el build info de TypeScript.

## Directorios y archivos exclusivamente locales

| Path                          | Tratamiento                                                                |
| ----------------------------- | -------------------------------------------------------------------------- |
| `.git/`                       | metadata Git; nunca manipular como artefacto                               |
| `node_modules/`               | dependencias reproducibles desde `package-lock.json`; ignoradas            |
| `.env`                        | configuración local; ignorada, con `.env.example` como contrato versionado |
| `.secrets/`                   | material sensible local; ignorado y nunca publicable                       |
| `.claude/worktrees/`          | checkouts auxiliares locales; ignorados y nunca anidados en Git            |
| `.claude/settings.local.json` | permisos personales; ignorados                                             |
| `.claude/settings.json`       | configuración compartible y sin credenciales                               |
| `.superpowers/`               | tooling personal/local; ignorado                                           |
| `.agents/`, `.codex/`         | mounts del entorno de agentes, no fuente del repositorio                   |

## Paths retirados del root

| Path anterior                | Destino vigente                                               |
| ---------------------------- | ------------------------------------------------------------- |
| `coverage/`                  | `.artifacts/coverage/`                                        |
| `playwright-report/`         | `.artifacts/playwright/report/`                               |
| `test-results/`              | `.artifacts/playwright/results/`                              |
| `dist/tsconfig.tsbuildinfo`  | `.artifacts/typescript/root.tsbuildinfo`                      |
| `maitre-foundation-v0.1.zip` | `.artifacts/archive/`; snapshot local, no fuente autoritativa |

## Reglas

1. Una herramienta nueva reutiliza `.artifacts/<tool-or-purpose>/`; no crea otro directorio de
   salida en el root.
2. CI publica subdirectorios explícitos con retención acotada, no toda `.artifacts/`.
3. Ningún secreto, dump de base, certificado o dato productivo se guarda como artifact local o CI.
4. La documentación y los datos persistentes nunca se clasifican como artefactos eliminables.
5. Antes de mover un `dist/` de workspace se deben cambiar y probar sus consumidores; no se hace
   sólo por estética del root.
6. Los validadores recorren fuente versionable y omiten `.artifacts/`, `.secrets/`, worktrees y
   tooling personal local; el scanner de secretos sigue inspeccionando `.claude/settings.json`.
