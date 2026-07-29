# Reglas de ingeniería para agentes

Estas instrucciones aplican a todos los agentes y asistentes que creen o modifiquen código en Maitre. Son obligatorias en todo el repositorio salvo que un `AGENTS.md` más específico imponga requisitos todavía más estrictos.

## Definition of Done de una feature

Una feature nueva no está terminada ni puede proponerse para merge si no cumple todo lo siguiente:

1. Parte de una spec aprobada y mantiene actualizados sus contratos, decisiones y criterios de aceptación.
2. Todo el código nuevo o modificado queda cubierto al **100% por unit tests**:
   - 100% de statements;
   - 100% de branches;
   - 100% de functions;
   - 100% de lines.
3. La cobertura debe ejercitar comportamiento y resultados observables, incluidos happy path, errores, límites y reglas de autorización. Tests triviales destinados solamente a incrementar el porcentaje no satisfacen esta regla.
4. Si la feature tiene cualquier parte visual, debe incluir cobertura Playwright completa antes del merge.
5. Todos los quality gates del repositorio deben quedar verdes.

## Cobertura Playwright obligatoria

“Cobertura completa” de una feature visual significa que los tests Playwright verifican, como mínimo:

- entrada y recorrido principal del usuario;
- todos los estados nuevos relevantes: loading, empty, success, validation y error;
- acciones, navegación y persistencia de datos visibles;
- permisos o roles que cambien lo mostrado o lo permitido;
- comportamiento responsive en el dispositivo definido para la aplicación;
- accesibilidad WCAG A/AA sin violaciones serias o críticas;
- integración real con la API cuando forme parte del criterio de aceptación.

Cada test debe vivir bajo `tests/e2e/apps/<app>/` dentro de la aplicación dueña. Si una feature afecta varias aplicaciones, cada aplicación debe tener sus tests y el recorrido transversal debe tener una prueba de journey explícita. No se acepta reemplazar esta granularidad por una única suite monolítica.

## Responsabilidad del agente

Antes de implementar, el agente debe identificar y declarar:

- unidades, branches y errores que necesitarán tests;
- aplicaciones y recorridos Playwright afectados;
- fixtures deterministas y aislamiento necesarios.

Antes de entregar, el agente debe:

- ejecutar y reportar unit tests, cobertura y proyectos Playwright afectados;
- mostrar evidencia del 100% en las cuatro métricas para los archivos nuevos o modificados;
- tratar una caída de cobertura, un test flaky o un escenario visual faltante como trabajo incompleto;
- no bajar thresholds, excluir archivos, borrar assertions ni agregar excepciones de coverage para conseguir un PASS;
- documentar cualquier bloqueo externo real y dejar la feature sin marcar como terminada.

Código generado, declaraciones de tipos y adaptadores inevitables sólo pueden excluirse mediante una decisión explícita documentada en la spec y aprobada por un responsable humano.

## Comandos mínimos

```bash
npm run format:check
npm run lint
npm run typecheck
npm run deps:check
npm run test:coverage
npm run test:e2e:run -- --project=<app>
```

Los scripts del repositorio son el contrato ejecutable. Si todavía no pueden medir alguna de estas reglas sobre código nuevo, la feature debe incorporar primero la instrumentación necesaria.
