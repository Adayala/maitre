# SPECIFICATION — SPEC-211

## Frontend

### React.js + Vite

Vite compila `apps/web` a artefactos estáticos en `dist`, desplegables en Vercel y hosts alternativos. El MVP comienza como SPA porque Dash es una aplicación autenticada y no requiere SSR para SEO.

```text
apps/web/
├── src/app/              # composition, providers y routes
├── src/features/         # slices verticales por capacidad
├── src/components/       # componentes reutilizables con semántica clara
├── src/lib/              # cliente HTTP y utilidades browser-only
└── src/styles/           # tokens y estilos globales
```

- React Router administra rutas y guards de navegación.
- TanStack Query administra estado remoto, cache, invalidación y retries.
- Estado local permanece local; no se incorpora un store global hasta que una spec demuestre necesidad.
- Formularios se validan con schemas Zod derivados o compartidos desde `contracts`.
- El frontend no contiene reglas de autorización como única defensa.

## Backend

### Node.js + Fastify

Fastify compone plugins y rutas en `apps/api/src/app.ts` sin iniciar un listener. Dos entradas reutilizan la misma aplicación:

```text
apps/api/
├── src/app.ts            # instancia y plugins, sin listen()
├── src/routes/           # adapters HTTP delgados
├── src/composition/      # wiring de casos de uso y adapters
├── src/server.ts         # proceso Node.js estándar
└── api/serverless.ts     # adapter Vercel
```

- `server.ts` llama `listen()` para local/contenedor.
- `api/serverless.ts` adapta requests de Vercel.
- Rutas validan input, autentican, autorizan, invocan un caso de uso y mapean output.
- Fastify no aparece en `domain` ni `application`.

## Contratos y validación

### Zod como fuente para fronteras

`packages/contracts` define schemas para DTOs, params, query, responses, errores y eventos. Los tipos TypeScript se infieren desde schemas.

Reglas de dominio que requieren semántica propia permanecen en `domain`; un schema no reemplaza value objects ni invariantes.

### OpenAPI

- La API genera OpenAPI desde los mismos schemas registrados en rutas.
- CI compara el documento generado con el versionado.
- Cambios incompatibles requieren versión o migración explícita.
- Contract tests verifican ejemplos y status codes de las specs.

## PostgreSQL

### Drizzle ORM + postgres.js

- Drizzle modela tablas y queries tipadas dentro del adapter de persistencia.
- `postgres.js` conecta al pool de Supabase.
- En Supavisor transaction mode se configura `prepare: false`.
- Repositorios devuelven objetos de dominio o resultados de aplicación, nunca rows crudos fuera del adapter.
- SQL explícito se permite para RLS, índices, locking y queries donde sea más claro o eficiente.

### Migraciones

- Drizzle Kit genera migraciones SQL versionadas.
- Cada SQL generado se revisa antes de merge.
- `drizzle-kit push` queda prohibido en ambientes compartidos y demo.
- Migraciones se ejecutan como job separado, nunca al arrancar cada función serverless.
- RLS, grants, funciones y datos de referencia usan migraciones custom cuando corresponda.
- `drizzle-kit check` y una migración desde cero forman parte de CI.

## Tests

### Vitest

- Unit tests de `domain` y `application` sin red ni DB.
- Integration tests de adapters contra PostgreSQL efímero/local.
- Fastify `inject()` para rutas sin abrir puertos cuando sea posible.
- Cobertura V8 y reportes compatibles con Sonar.

### Testing Library

- Tests de React por comportamiento y accesibilidad observable.
- No afirmar detalles internos de componentes.
- Mock Service Worker puede simular HTTP en tests de web si se aprueba como dependencia de test.

### Playwright

- E2E solo para recorridos críticos.
- Navegadores mínimos: Chromium en cada PR; matriz ampliada programada o antes de release.
- Screenshots, traces y videos solo en fallo para ahorrar cuota CI.
- Datos aislados y limpiables por ejecución.

## Calidad estática

### ESLint

Flat config compartida con:

- `typescript-eslint` con reglas type-aware donde aporten valor;
- reglas de React Hooks;
- imports y exports consistentes;
- prohibición de `any`, non-null assertions injustificadas y floating promises;
- restricciones de imports según SPEC-209;
- cero warnings en CI.

### Prettier

Prettier decide formato mecánico. ESLint decide corrección y calidad. No se duplican reglas de estilo incompatibles.

### dependency-cruiser

Valida dirección de dependencias, ciclos, deep imports y módulos huérfanos relevantes. Su configuración es código versionado y se ejecuta en CI.

## Versiones y actualizaciones

- Node.js usa una línea LTS activa fijada en archivos de toolchain.
- Dependencias usan versiones exactas en lockfile reproducible.
- Renovaciones automáticas crean PRs, nunca merge automático de cambios mayores.
- Cambios mayores requieren tests, notas de migración y ADR si alteran arquitectura.
- Dependencias sin mantenimiento o con vulnerabilidades bloqueantes se reemplazan.
