# Diseño del harness E2E reproducible — SPEC-224

## 1. Propósito

Definir un único harness para verificar, antes de desplegar, que el artefacto candidato integra
correctamente las aplicaciones, la API, identidad y persistencia de Maitre. La suite se organiza
por aplicación para facilitar ownership y diagnóstico, pero conserva una capa separada de
recorridos cross-app para verificar el servicio completo.

Este documento especializa la sección E2E de SPEC-224. La obligatoriedad, los scripts raíz y los
triggers continúan gobernados por SPEC-207; la promoción y el deploy continúan gobernados por
SPEC-221.

## 2. Objetivos

- Ejecutar localmente y en CI el mismo comando y la misma topología.
- Construir y probar el mismo commit y configuración que se propone desplegar.
- Partir siempre de infraestructura limpia, migraciones versionadas y datos sintéticos conocidos.
- Agrupar escenarios, reportes y ownership por aplicación.
- Verificar también recorridos que atraviesan varias aplicaciones.
- Bloquear una promoción cuando falle un escenario requerido o el harness no pueda producir
  evidencia confiable.
- Producir artefactos suficientes para reproducir un fallo sin exponer secretos ni PII.

## 3. Fuera de alcance

- Reemplazar unit, component, contract, integration, RLS o migration tests.
- Probar exhaustivamente cada combinación de reglas desde el navegador.
- Contactar ARCA, procesadores de pago u otros proveedores productivos.
- Usar datos copiados de producción.
- Validar performance, carga, disaster recovery o compatibilidad completa de navegadores dentro
  del gate E2E funcional.
- Convertir un ambiente remoto compartido y mutable en la fuente principal de evidencia pre-deploy.

## 4. Sistemas y agrupación

La agrupación lógica usa el nombre de producto aunque el workspace físico conserve temporalmente
otro nombre:

| Grupo E2E | Workspace actual | Responsabilidad |
| --- | --- | --- |
| `dash` | `apps/web` | administración, configuración y suscripciones |
| `host` | `apps/host` | recepción, reservas, espera y asignación |
| `floor` | `apps/waiter` | visitas, mesas, pedidos y entrega |
| `kitchen` | `apps/kitchen` | recepción, preparación y despacho |
| `cash` | `apps/cashier` | caja, cuenta, pagos y cierre |
| `guest` | `apps/customer` | reserva pública, menú QR y cuenta digital |
| `api` | `apps/api` | health, auth, contratos y capacidades server-side no visibles por UI |
| `journeys` | varias | consistencia de punta a punta entre aplicaciones |

`api` no duplica los contract/integration tests. Sólo contiene precondiciones y recorridos
black-box indispensables para afirmar que el sistema desplegable funciona por red real.

## 5. Arquitectura propuesta

```text
tests/e2e/
├── playwright.config.ts
├── global-setup.ts
├── global-teardown.ts
├── apps/
│   ├── dash/
│   ├── host/
│   ├── floor/
│   ├── kitchen/
│   ├── cash/
│   ├── guest/
│   └── api/
├── journeys/
├── fixtures/
│   ├── auth.fixture.ts
│   ├── branch.fixture.ts
│   └── test.fixture.ts
├── support/
│   ├── api-client.ts
│   ├── clock.ts
│   ├── ids.ts
│   ├── seed.ts
│   └── diagnostics.ts
└── README.md

tooling/e2e/
├── compose.yaml
├── env.e2e.example
├── healthcheck.mjs
├── provision.mjs
├── reset.mjs
└── verify-clean.mjs
```

La implementación puede ajustar nombres mediante ADR, pero debe conservar estas fronteras:

1. **orquestación de infraestructura**, sin assertions de producto;
2. **fixtures y clientes compartidos**, sin page objects que oculten comportamiento;
3. **specs por aplicación**, ejecutables de manera independiente;
4. **journeys cross-app**, dueños de la evidencia entre superficies;
5. **reporting**, desacoplado de los tests.

## 6. Topología hermética

Cada run levanta una topología efímera y direccionable sólo por la red del job:

```text
Playwright
   ├── Dash / Host / Floor / Kitchen / Cash / Guest (builds del commit)
   └── API (build del commit)
          ├── PostgreSQL/Supabase local compatible
          ├── identidad local
          └── adapters externos simulados por contrato
```

Requisitos:

- imágenes de contenedor fijadas por versión y, para release, preferentemente por digest;
- dependencias instaladas con lockfile (`npm ci`);
- aplicaciones servidas desde su build de producción, no desde Vite dev server;
- API ejecutada desde el build de producción;
- migraciones aplicadas desde cero en orden versionado;
- health/readiness explícitos antes de comenzar Playwright;
- puertos asignables para permitir runs paralelos y evitar colisiones locales;
- red saliente denegada o controlada para proveedores externos;
- cleanup idempotente incluso después de fallo o cancelación;
- ninguna dependencia del proyecto Supabase remoto enlazado en `supabase/.temp`.

El primer corte puede usar Supabase CLI local o servicios equivalentes en Compose. La opción
elegida debe fijar versiones, exponer healthchecks y comportarse igual en local y CI.

## 7. Reproducibilidad

Todo run recibe un `E2E_RUN_ID` y un `E2E_SEED`. Si el caller no provee seed, el harness la deriva
del commit SHA y la registra en el reporte. Un fallo debe poder repetirse con:

```bash
E2E_SEED=<seed-reportada> npm run test:e2e -- --project=<grupo>
```

Son obligatorios:

- timezone de proceso explícita (`America/Argentina/Buenos_Aires` cuando se prueba negocio y UTC
  para timestamps técnicos);
- locale explícito;
- clock de negocio inyectable o endpoint de test habilitado sólo con `APP_ENV=e2e`;
- IDs deterministas o namespaced por run;
- estado inicial descrito por builders versionados;
- ausencia de `Date.now()`, random sin seed y sleeps en los tests;
- espera por respuestas, eventos, estados persistidos o elementos observables;
- orden independiente y paralelización segura;
- registro de SHA, seed, versiones, navegador, schema/migration head y configuración no sensible.

## 8. Datos, identidad y aislamiento

El provisioner crea como mínimo:

- Tenant A y Tenant B, para verificar aislamiento;
- una marca y una sucursal operativa por tenant;
- usuarios sintéticos por rol: owner/manager, host, waiter, kitchen y cashier;
- menú, salón, mesas, estaciones, caja y políticas mínimas;
- una identidad guest pública/no privilegiada;
- adapters simulados para fiscalidad, pagos, notificaciones y storage.

Reglas:

- provisioning por API o acceso administrativo controlado; nunca por UI salvo que el setup sea el
  comportamiento bajo prueba;
- cada test crea sólo el delta necesario sobre un baseline mínimo;
- tests no comparten entidades mutables, aunque pertenezcan al mismo worker;
- fixtures exponen roles y capacidades, no tokens hardcodeados;
- Tenant B se usa para negative assertions en operaciones sensibles;
- teardown verifica ausencia de procesos y recursos del run;
- una falla de cleanup invalida el run o lo marca `INFRA_ERROR`, nunca `PASS`.

## 9. Catálogo inicial de escenarios

Cada escenario declara ID estable, aplicaciones, precondiciones, riesgo, spec/CAD cubierto y
criticidad `smoke | release | extended`.

### Por aplicación

| Grupo | Escenarios iniciales |
| --- | --- |
| Dash | login y selección de tenant; crear/configurar branch; consultar suscripción y entitlement |
| Host | consultar reservas; registrar llegada; pasar a espera; asignar mesa/iniciar visita |
| Floor | abrir visita; tomar y enviar pedido; observar item listo; marcar entrega |
| Kitchen | recibir comanda enviada; iniciar/preparar; marcar item listo; despachar |
| Cash | abrir caja; consultar cuenta; registrar pago manual simulado; cerrar/reconciliar |
| Guest | abrir menú QR publicado; crear reserva; consultar cuenta sin cruzar tenant |
| API | readiness/version SHA; rechazo sin auth; rechazo cross-tenant; idempotency black-box crítica |

### Cross-app

| ID | Recorrido |
| --- | --- |
| `J-001` | Host registra llegada y asigna mesa → Floor observa visita |
| `J-002` | Floor envía pedido → Kitchen recibe y marca ready → Floor observa y entrega |
| `J-003` | Floor solicita cuenta → Cash registra pago → visita/cuenta cierran consistentemente |
| `J-004` | Guest crea reserva → Host la observa y procesa |
| `J-005` | Tenant A opera un recorrido → usuario de Tenant B no puede leer ni mutar sus recursos |

Los escenarios inexistentes en el producto se incorporan a la suite cuando la capacidad pasa a
implementada. Un test `skip` no cuenta como evidencia y no puede satisfacer un gate.

## 10. Perfiles de ejecución

| Perfil | Comando raíz | Contenido | Uso |
| --- | --- | --- | --- |
| smoke | `npm run test:e2e:smoke` | health + un recorrido crítico mínimo | PR afectado y verificación post-deploy |
| app | `npm run test:e2e -- --project=<grupo>` | una aplicación o journey | desarrollo y diagnóstico |
| release | `npm run test:e2e` | todos los grupos `release` en Chromium | gate obligatorio antes de deploy/promoción |
| extended | `npm run test:e2e:extended` | navegadores/viewports y casos adicionales | programado o release de riesgo alto |

El perfil `release` no puede basarse sólo en detección de archivos afectados: valida el sistema
integrado completo. Los filtros por impacto se permiten en PR para feedback, pero cambios en API,
contratos, migrations, auth, shared packages, lockfile o tooling E2E invalidan el filtro.

## 11. Ciclo de vida del run

1. validar toolchain, variables permitidas y ausencia de credenciales productivas;
2. instalar dependencias desde lockfile;
3. construir todos los artefactos candidatos;
4. crear red e infraestructura efímera;
5. aplicar migraciones desde cero;
6. provisionar baseline determinista;
7. iniciar API y builds frontend;
8. esperar readiness y verificar SHA/configuración;
9. ejecutar Playwright por grupos;
10. recolectar resultados y diagnósticos;
11. destruir recursos y verificar cleanup;
12. emitir un único resultado `PASSED`, `FAILED` o `INFRA_ERROR`.

Un `INFRA_ERROR` bloquea el release igual que `FAILED`, aunque se reporte por separado para no
atribuirlo erróneamente al producto.

## 12. Integración CI/CD

Pipeline objetivo:

```text
quality gates
    → build inmutable del SHA
    → test:e2e (topología efímera, suite release)
    → staged deployment del mismo SHA/artefacto
    → test:e2e:smoke contra staged
    → promoción aprobada
```

- El deploy job declara dependencia dura del resultado exitoso de `test:e2e`.
- El build probado y el desplegado deben compartir SHA y hashes; no se ejecuta un rebuild mutable.
- Migraciones destructivas o incompatibles conservan los gates adicionales de SPEC-221.
- El smoke remoto valida routing/configuración del deployment, no sustituye el release E2E
  hermético.
- Los secretos de CI se limitan al deployment; el E2E pre-deploy usa credenciales efímeras.
- La suite publica JUnit/HTML y traces de fallo como artifacts sanitizados.
- La retención es mínima y definida por el pipeline.

## 13. Evidencia y diagnóstico

Por run se conserva:

- resultado por escenario, grupo y criticidad;
- commit SHA, hash de artefactos y migration head;
- seed, run ID, timezone, navegador y versiones de toolchain;
- tiempos de setup, ejecución, teardown y top tests lentos;
- trace de Playwright y screenshot sólo ante fallo;
- logs estructurados y correlacionados por run/scenario, sanitizados;
- clasificación `PRODUCT_FAILURE | TEST_FAILURE | INFRA_ERROR`;
- conteo de retries diagnóstico y primer fallo, sin convertirlo en pass limpio.

Videos quedan deshabilitados por defecto salvo que un caso demuestre valor diagnóstico adicional.

## 14. Política de estabilidad

- Cero retries como mecanismo de aprobación; un retry opcional sólo recolecta evidencia.
- Un test flaky de criticidad release bloquea hasta corregirse.
- Cuarentena exige issue, owner, vencimiento y evidencia compensatoria conforme SPEC-224.
- Ningún test release puede quedar silenciosamente `skip`, `fixme` o `only`.
- El harness falla si detecta console errors no allowlisted, requests inesperadas o unhandled
  rejections.
- El presupuesto inicial objetivo es <= 15 minutos para release E2E en CI; debe medirse antes de
  adoptarlo como SLO. La optimización prioriza paralelismo e inicialización compartida segura.

## 15. Criterios de aceptación del harness

### E2E-H-01 — Equivalencia local/CI

El comando raíz levanta la misma topología, aplica las mismas migrations y ejecuta los mismos
artefactos en una máquina limpia y en CI.

### E2E-H-02 — Estado reproducible

Dos runs con el mismo SHA, seed y perfil producen el mismo baseline y resultados equivalentes; el
reporte contiene toda metadata necesaria para repetir un fallo.

### E2E-H-03 — Cobertura por aplicación y cross-app

Cada aplicación implementada posee un proyecto ejecutable independiente y los recorridos
J-001–J-005 verifican propagación y aislamiento entre sistemas.

### E2E-H-04 — Release fail-closed

`FAILED`, `INFRA_ERROR`, cleanup incompleto, skips prohibidos o falta de artifacts requeridos
bloquean el job del deploy.

### E2E-H-05 — Artefacto probado igual al desplegado

El SHA y los hashes reportados por el harness coinciden con el staged deployment; cualquier
divergencia bloquea promoción.

### E2E-H-06 — Seguridad del entorno

El run usa sólo datos sintéticos y credenciales efímeras, no alcanza proveedores productivos y no
publica secretos/PII en logs o artifacts.

### E2E-H-07 — Operabilidad

Es posible ejecutar smoke, suite completa o un grupo individual; los fallos se atribuyen a una
aplicación/journey y tienen trace/logs correlacionados.

## 16. Plan incremental

### Fase 0 — Decisiones y esqueleto

- elegir Supabase CLI local versus Compose equivalente y fijar versiones;
- adoptar Playwright y estructura `tests/e2e`;
- crear scripts raíz y validador de configuración;
- implementar lifecycle, readiness, reporting y cleanup.

### Fase 1 — Walking skeleton

- seed Tenant A/B y roles;
- implementar API health/auth/cross-tenant;
- implementar un smoke de UI;
- demostrar reproducción local/CI con seed registrada.

### Fase 2 — Suites por aplicación

- incorporar cada proyecto a medida que su capacidad esté implementada;
- añadir contratos de selectors accesibles;
- medir duración y ajustar paralelismo.

### Fase 3 — Journeys y release gate

- implementar J-001–J-005;
- ejecutar la suite release repetidamente para medir flake;
- conectar dependencia dura pre-deploy;
- verificar identidad SHA/hash y smoke staged.

### Fase 4 — Extensión controlada

- Firefox/WebKit y viewports críticos en schedule/release de alto riesgo;
- escenarios offline/reconnect cuando SPEC-218 esté implementada;
- sharding si la duración medida excede el presupuesto.

## 17. Decisiones pendientes

El primer corte resolvió Supabase CLI local `2.110.0`, clock por
`E2E_BUSINESS_CLOCK`, identidad/seed namespaced por run, puertos de los builds y catálogo
MVP-J-001. Continúan pendientes:

1. promover exactamente el mismo artefacto staged sin rebuild;
2. asignar ownership formal de cada proyecto y del harness transversal;
3. aprobar un presupuesto CI estable y workers aceptables a partir de runs históricos;
4. aprobar la política de retención de traces/logs;
5. ampliar journeys sólo cuando el riesgo lo justifique, sin convertir cantidad de UI tests en
   sustituto del recorrido autoritativo.

## 18. Implementación vigente — 2026-07-30

La implementación difiere en nombres de la topología propuesta, pero conserva sus fronteras:

```text
playwright.config.mjs
tests/e2e/
├── apps/{dash,host,floor,kitchen,cash,guest}/
└── journeys/
    ├── fixtures.ts
    ├── api-client.ts
    ├── mvp-j-001.spec.ts
    └── restart-durability.spec.ts

tooling/e2e/
├── check-authoritative-policy.mjs
└── run-manifest.mjs
```

### Perfiles reales

| Perfil | Comando | Evidencia |
| --- | --- | --- |
| Aplicación | `npm run test:e2e:run -- --project=<app>` | UI-contract/smoke de la superficie seleccionada |
| Journey local | `npm run test:e2e:journey` | Feedback del recorrido con perfil local controlado |
| Journey release | `npm run test:e2e:journey:run` | MVP-J-001 contra Supabase efímero en CI |
| Durabilidad | `npm run test:e2e:journey:restart` | Lecturas del mismo estado después de reiniciar API |
| Policy | `npm run e2e:journey:policy` | Prohíbe skips/fixme/only, mocks de requests de producto y aprobación por retry |

### Gate autoritativo

El job `E2E · Release journey (ephemeral Supabase)`:

1. fija Node `20.19.0`, Playwright y Supabase CLI;
2. genera run ID, seed, clock, bootstrap secret y tokens por rol;
3. construye API, Dash, Floor, Kitchen y Cash;
4. recrea PostgreSQL desde todas las migraciones;
5. ejecuta MVP-J-001 sin mocks de requests de producto;
6. guarda un checkpoint y reinicia la API;
7. verifica estado durable, aislamiento Tenant B y audit;
8. destruye Supabase sin backup y confirma que no queden recursos;
9. publica manifest, clasificación, resultados y evidencia sanitizada.

`E2E gate` exige el éxito de este job incluso cuando el cambio no afecta una aplicación
individual. Los E2E por aplicación pueden filtrarse por impacto; MVP-J-001 no.

### Semántica del baseline

El perfil PostgreSQL incluye datos demo operativos intencionales. Por eso MVP-J-001 captura las
métricas de Dash antes de crear su visita y exige que, tras pago y cierre, regresen exactamente al
mismo baseline. La aserción detecta residuos del recorrido sin interpretar datos demo preexistentes
como un fallo.

### Estado de los criterios

- E2E-H-01, E2E-H-02, E2E-H-04, E2E-H-06 y E2E-H-07 tienen evidencia automatizada.
- E2E-H-03 está cubierto por proyectos de aplicación y MVP-J-001 para el recorrido core; J-001–J-005
  no se mantienen como cinco journeys separados.
- E2E-H-05 sigue parcial: el SHA queda trazado y el deploy depende de los gates, pero la promoción
  staged sin rebuild continúa pendiente en SPEC-221.
