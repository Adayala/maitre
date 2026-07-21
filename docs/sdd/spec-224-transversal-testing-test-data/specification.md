# Especificación — SPEC-224

## 1. Principio de evidencia

Cada criterio de aceptación se cubre en la capa más baja que observe el comportamiento relevante:

| Riesgo | Test preferido |
| --- | --- |
| Invariante/cálculo | unit o property-based |
| Orquestación de caso de uso | unit con ports fakes |
| Query, transaction, RLS | integration con PostgreSQL real |
| Request/auth/error | Fastify route/contract test |
| Componente/interacción | Testing Library + axe |
| Cliente HTTP/cache/error | MSW + Testing Library/Vitest |
| Recorrido cross-app | Playwright E2E |
| Proveedor externo | adapter contract + sandbox controlado |
| Migración/restore | pipeline operacional aislado |

No se repite exhaustivamente la misma evidencia en todas las capas. E2E confirma integración; unit/integration explican reglas y bordes.

## 2. Unit tests

- `domain` y `application` no acceden a red, filesystem, DB ni variables globales.
- Dependencias no deterministas se inyectan: `Clock`, `IdGenerator`, `RandomSource` y ports.
- Fakes representan contratos propios y poseen comportamiento mínimo explícito.
- No se mockean métodos privados ni detalles internos.
- Casos cubren happy path, límites, invariantes, errores y transiciones inválidas.
- Tables/data-driven tests se usan para matrices de reglas sin duplicar setup.
- Property-based testing se aplica selectivamente a dinero, impuestos, capacidad, idempotencia, serialización y máquinas de estado cuando aporte casos no obvios.

## 3. Tests de integración de datos

Se ejecutan contra una versión PostgreSQL compatible con Supabase:

- migraciones desde cero y desde versión anterior representativa;
- constraints, tipos, índices y defaults;
- repositorios y mapping dominio/DB;
- transacciones, locks, concurrencia e idempotencia;
- outbox/inbox y leases;
- grants, functions y RLS;
- queries relevantes con plan/rendimiento cuando el riesgo lo exige.

No se usa SQLite como sustituto de PostgreSQL. Cada test incluye al menos los tenants/users/scopes necesarios para probar acceso positivo y negativo.

## 4. Aislamiento de integración

Estrategias permitidas:

- base/schema efímero por job/worker;
- IDs/tenant namespace únicos por ejecución con cleanup verificable;
- transacción rollback sólo cuando no invalide conexiones, RLS, jobs o concurrencia probada.

Un test no depende del orden ni de residuos de otro. Ejecuciones paralelas no comparten identidades fijas que colisionen. Al fallar, conserva metadata suficiente para reproducir sin dejar datos sensibles.

## 5. API y contratos

- Fastify `inject()` prueba transporte sin puerto cuando no se necesita red real.
- Schemas Zod se ejercitan con valid/invalid fixtures.
- OpenAPI generado se valida y compara por breaking changes.
- Auth tests cubren token ausente/inválido/vencido y autorización cross-tenant.
- Problem Details se verifica por status/type/code/shape, no por texto localizado completo.
- Idempotency tests cubren replay, payload conflict, concurrencia y recovery.
- Consumers toleran campos response/event adicionales según contrato.

## 6. Componentes React

- Testing Library consulta por role, label, name y texto percibido por usuario.
- No afirmar clases internas, hooks, estado privado o árbol incidental.
- User interactions usan eventos próximos al comportamiento real.
- axe-core cubre violaciones automatizables; teclado/foco y lector requieren tests/manual según SPEC-212.
- Estados loading, empty, error, offline, unauthorized, stale y success se prueban explícitamente.
- Storybook comparte builders, pero una story no reemplaza assertions.

## 7. Boundary HTTP web

MSW implementa contratos HTTP en tests de frontend:

- handlers se derivan/alinean con schemas y ejemplos;
- happy/error/delay/timeout/malformed response;
- no simula reglas del servidor para declarar backend correcto;
- requests inesperadas fallan tests;
- fixtures no se duplican dentro de cada componente;
- contract drift se detecta por schemas/OpenAPI y tests integrados.

TanStack Query usa un QueryClient nuevo por test, retries desactivados salvo test específico y cache limpiada.

## 8. E2E

Playwright cubre pocos recorridos:

- login → contexto → Dash;
- setup operativo I1;
- Floor pedido → Kitchen ready → Floor entrega;
- cuenta → pago manual → cierre;
- Guest menú QR read-only;
- fallos críticos de sesión/tenant/offline cuando corresponda.

Reglas:

- API/setup autorizado prepara datos; UI se usa para el comportamiento bajo prueba;
- test run posee tenant/branch/user únicos o seed aislado;
- selectors accesibles o `data-testid` estable sólo cuando no existe semántica;
- waits por condición observable, nunca sleeps arbitrarios;
- screenshot/trace/video principalmente en fallo;
- Chromium en PR, matriz adicional programada/release;
- tests son independientes y paralelizables según recursos.

## 9. Integraciones externas

Cada adapter posee:

1. unit tests con fake del transporte para mapping y errores;
2. contract tests contra fixtures oficiales/sanitizados;
3. sandbox/homologación cuando el proveedor la ofrece;
4. smoke no destructivo, manual/programado y con cuota;
5. reconciliación ante timeout/resultado incierto.

No se graban credenciales, certificados, CUIT reales, payloads de clientes o tokens en cassettes. ARCA/pagos nunca reciben requests reales desde PRs generales.

## 10. Test data

`packages/test-utils` ofrece builders por dominio:

- defaults mínimos válidos y overrides explícitos;
- Tenant A y Tenant B por defecto para pruebas de aislamiento;
- IDs, clock y random deterministas mediante seed;
- fechas relativas a un clock fijo, no “ahora” global;
- ejemplos argentinos sintéticos y claramente ficticios;
- relaciones creadas mediante builders, no fixtures JSON gigantes;
- datos inválidos construidos localmente para expresar el caso.

Un builder no replica lógica de producción compleja de modo que ambos puedan equivocarse igual. Invariantes críticas se expresan con assertions independientes.

## 11. Tiempo, IDs y concurrencia

- Tests fijan timezone/locale cuando afecta resultado.
- `Clock` controla expiración, turnos, retención y retries.
- `IdGenerator` evita snapshots cambiantes.
- Tests concurrentes usan barriers/latches controlados, no timing probabilístico.
- Retry/backoff usa fake timers sólo donde modele fielmente la librería.
- DST, medianoche, leap year y zona Argentina se cubren cuando la regla depende de calendario.

## 12. Coverage y mutation

- Sonar exige cobertura de código nuevo >= 80 % según SPEC-207.
- Cobertura por sí sola no acepta un cambio.
- Branch coverage se observa en reglas/errores, no sólo line coverage.
- Código generado, migrations declarativas, types y fixtures se excluyen con justificación consistente.
- Mutation testing puede ejecutarse de forma programada sobre cálculos/reglas críticas si el tiempo CI lo permite; sobrevivientes producen casos útiles, no assertions cosméticas.

## 13. Flakiness

Un flaky test:

- se registra con seed, ambiente, frecuencia e impacto;
- se reproduce/diagnostica antes de aumentar retries;
- bloquea el cambio si cubre un gate crítico;
- sólo se pone en cuarentena con issue, owner, vencimiento y cobertura compensatoria;
- no se elimina silenciosamente ni se ignora permanentemente;
- sale de cuarentena tras múltiples ejecuciones estables definidas.

Retries de CI recolectan evidencia pero no convierten el primer fallo en éxito limpio.

## 14. Rendimiento de la suite

- Unit/component rápidos por PR.
- Integration se paraleliza con límites de DB.
- E2E se divide por recorridos estables, no por cada feature.
- Suites completas/matrices/mutation se programan si exceden presupuesto PR.
- Duración p50/p95, flakes y top slow tests se observan.
- Optimización de CI nunca elimina evidencia requerida para el cambio.

La clasificación de un cambio como “afectado” sigue SPEC-207. SPEC-224 no define workflows o scripts alternativos; cada nivel se expone mediante la matriz raíz única.
