# SPECIFICATION — SPEC-209

## Estructura normativa

```text
maitre/
├── apps/
│   ├── web/                    # Aplicación React.js
│   └── api/                    # API y webhooks Node.js
├── packages/
│   ├── domain/                 # Entidades, value objects y reglas puras
│   ├── application/            # Casos de uso y puertos
│   ├── contracts/              # DTOs, schemas, APIs y eventos públicos
│   ├── config/                 # Parsing tipado de configuración
│   ├── observability/          # Contratos y adaptadores base de telemetría
│   ├── test-utils/             # Builders y fixtures sin datos reales
│   └── tooling/                # Config compartida de lint, TS y tests
├── adapters/
│   ├── persistence/            # Implementaciones de repositorios
│   ├── identity/               # Proveedor de identidad
│   ├── messaging/              # Eventos, jobs y notificaciones
│   ├── storage/                # Objetos
│   └── integrations/           # ARCA y proveedores externos
├── docs/                       # Foundations y SDD
├── scripts/                    # Automatización portable
└── package.json                # npm workspaces y comandos raíz
```

Los directorios se crean cuando contienen una primera necesidad aprobada. El scaffolding no debe generar paquetes vacíos salvo los mínimos requeridos para demostrar los límites.

## Dirección de dependencias

```text
apps/web --------------------> contracts
apps/api -----> application -> domain
    |               |           ^
    v               v           |
adapters --------> ports -------+

domain -> ninguna capa externa
application -> domain + contracts propios
adapters -> application ports + contratos del proveedor
apps -> composición, transporte y presentación
```

### Importaciones permitidas

| Origen | Puede importar |
| --- | --- |
| `domain` | librería estándar y utilidades puras explícitamente permitidas |
| `application` | `domain`, contratos y puertos propios |
| `contracts` | schemas/tipos sin lógica de infraestructura |
| `adapters/*` | `application`, `domain`, `contracts` y SDK del proveedor adaptado |
| `apps/api` | casos de uso, contratos y adaptadores durante composición |
| `apps/web` | contratos, cliente API y componentes propios |

## Workspaces y comandos raíz

Se usarán npm workspaces, consistente con SPEC-048. Todo desarrollador y CI opera desde comandos raíz:

```text
npm run format:check
npm run lint
npm run typecheck
npm run test
npm run test:integration
npm run test:contracts
npm run build
npm run sonar
npm run sdd:validate
```

Los scripts delegan a los workspaces afectados y devuelven código distinto de cero ante fallos.

## TypeScript

- Configuración base central y extensiones por runtime.
- `strict` habilitado.
- Sin alias que oculten dependencias entre capas.
- Tipos de dominio separados de DTOs externos.
- Entradas `unknown` validadas con schemas en las fronteras.
- Builds sin emitir artefactos en verificación de tipos.

## Contratos

`packages/contracts` contiene schemas versionados para:

- requests y responses HTTP;
- eventos de dominio publicados;
- webhooks;
- errores públicos;
- paginación y metadatos comunes.

Los tipos TypeScript se derivan de los schemas cuando sea posible. No se mantienen manualmente dos representaciones equivalentes.

## Composición

Solo los composition roots de cada aplicación conocen implementaciones concretas. Un caso de uso recibe sus puertos mediante construcción explícita; no consulta singletons globales de infraestructura.

## Estrategia de apps

### Web

- React.js y TypeScript.
- Presentación separada de consultas/comandos.
- Sin acceso directo a base de datos o secretos.
- Configuración pública validada al iniciar.

### API

- Node.js LTS fijado por el repositorio.
- Handlers delgados: parsear, autorizar, ejecutar caso de uso y mapear respuesta.
- Sin estado persistente en memoria o filesystem local.
- Arranque compatible con Vercel y con un proceso/contenedor estándar.

## Versionado interno

Los paquetes se versionan juntos durante el MVP. No se publican a un registry. Los cambios incompatibles en contratos requieren actualización atómica de consumidores y evidencia de contract tests.
