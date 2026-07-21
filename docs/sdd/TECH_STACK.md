# Stack técnico y estrategia de plataforma

**Fecha de decisión:** 2026-07-21
**Estado:** ACEPTADA
**Alcance:** Implementación inicial de Maitre

## Decisión

Maitre se implementará inicialmente con:

- **Frontend:** React.js.
- **Backend:** Node.js.
- **Plataforma inicial:** Vercel.
- **Lenguaje recomendado:** TypeScript tanto en frontend como en backend.

Vercel acelera la primera entrega y operación, pero no constituye un límite arquitectónico. El sistema debe poder migrar total o parcialmente a otra plataforma cuando el volumen, la latencia, los costos, las conexiones persistentes, requisitos regulatorios u operación regional lo justifiquen.

## Lo que esta decisión no define

Permanecen abiertas y requieren una decisión separada:

- Framework de React y estrategia de renderizado.
- Framework HTTP de Node.js.
- Proveedor y motor de base de datos.
- Proveedor de identidad.
- Almacenamiento de objetos.
- Procesamiento de colas y eventos.
- Proveedor de observabilidad.
- Proveedor de pagos.
- Plataforma destino de una futura migración.

Ninguna spec puede asumir Next.js, Supabase, Railway, AWS, Fastify, Prisma, Stripe u otro proveedor hasta que exista una decisión aceptada para ese componente.

## Perfil de despliegue inicial

```text
Usuarios
   |
   v
Aplicaciones React.js
   |
   v
APIs y procesos Node.js en Vercel
   |
   +--> Datos (contrato independiente del proveedor)
   +--> Objetos (contrato independiente del proveedor)
   +--> Integraciones externas
```

El despliegue inicial puede compartir repositorio y plataforma, pero debe conservar límites claros entre presentación, transporte, aplicación, dominio e infraestructura.

## Arquitectura portable

### Capas

```text
React UI
   |
HTTP / Event adapters
   |
Application services
   |
Domain model
   |
Ports
   |
Vercel, database, storage and provider adapters
```

Las capas de dominio y aplicación:

- no importan SDKs de Vercel;
- no dependen de objetos específicos del runtime HTTP;
- no conocen el proveedor de base de datos, objetos, colas o identidad;
- reciben configuración mediante variables de entorno validadas;
- exponen casos de uso testeables fuera de Vercel.

Los adaptadores traducen entre contratos internos y cada tecnología concreta.

### Contratos mínimos

Las dependencias externas deben estar detrás de interfaces propias:

- `DatabasePort`
- `ObjectStoragePort`
- `EventPublisherPort`
- `JobSchedulerPort`
- `IdentityProviderPort`
- `SecretProviderPort`
- `TelemetryPort`
- conectores por proveedor, como `ArcaFiscalPort`

## Reglas para React.js

1. Componentes de presentación separados de acceso a datos y reglas de negocio.
2. El cliente consume APIs documentadas; no accede directamente a bases de datos privadas.
3. Estado de servidor y estado de interfaz se modelan por separado.
4. Rutas, autenticación y configuración no deben quedar acopladas a APIs exclusivas de Vercel.
5. Las aplicaciones críticas contemplan degradación, reintentos y la estrategia offline definida por sus specs.
6. El build debe poder ejecutarse en CI sin servicios propietarios.

## Reglas para Node.js

1. Usar una versión LTS soportada, fijada por proyecto y actualizada mediante política explícita.
2. Mantener handlers delgados; la lógica vive en servicios de aplicación y dominio.
3. No depender de filesystem local persistente ni memoria entre invocaciones.
4. Toda operación externa incluye timeout, idempotencia y estrategia de reintento.
5. Tareas largas, conexiones persistentes y consumidores continuos se aíslan detrás de puertos migrables.
6. Los procesos deben poder ejecutarse localmente y en una imagen de contenedor estándar.

## Reglas para Vercel

### Permitido en la primera etapa

- Hosting de aplicaciones React.
- Funciones Node.js para APIs y webhooks compatibles con sus límites operativos.
- Preview deployments por rama o pull request.
- Configuración por ambiente y secretos referenciados desde runtime.
- Tareas programadas no críticas, siempre detrás de `JobSchedulerPort`.

### No permitido en el núcleo

- Importar SDKs de Vercel desde dominio o aplicación.
- Usar URLs, regiones o identificadores de Vercel como identidad de negocio.
- Asumir disco local persistente.
- Asumir que una instancia permanece viva.
- Depender de una función propietaria sin adaptador y alternativa documentada.

## Capacidades que disparan una reevaluación

Se revisará la plataforma cuando aparezca cualquiera de estas condiciones:

- conexiones persistentes o tiempo real que excedan el modelo elegido en Vercel;
- workers o consumidores que deban permanecer activos;
- procesos fiscales, reportes o IA de larga duración;
- alta tasa sostenida de eventos o webhooks;
- requisitos de residencia, red privada o topología regional;
- costos que superen una alternativa equivalente;
- límites de ejecución, concurrencia o payload incompatibles con los SLO;
- necesidad de despliegue local o edge en una sucursal.

La reevaluación no obliga a migrar todo el sistema: frontend, APIs, workers, datos y almacenamiento pueden moverse de forma independiente.

## Requisitos de migración

Antes de considerar una capacidad lista para producción debe existir:

- build reproducible fuera de Vercel;
- suite de tests ejecutable localmente;
- configuración documentada por variables de entorno;
- migraciones de datos independientes del hosting;
- exportación y restauración probadas para datos y objetos;
- observabilidad basada en estándares o interfaces propias;
- runbook de despliegue y rollback;
- inventario de dependencias específicas de plataforma.

## Validación por etapas

### Etapa inicial

- [ ] Aplicaciones React desplegadas en Vercel.
- [ ] APIs Node.js desplegadas en Vercel.
- [ ] Preview deployments y ambientes separados.
- [ ] Secretos fuera del repositorio.
- [ ] Dominio sin dependencias de Vercel.
- [ ] Tests unitarios ejecutables sin red.
- [ ] Contratos de datos e integraciones definidos.

### Revisión antes de escalar

- [ ] Medir latencia, errores, uso, concurrencia y costo.
- [ ] Identificar funciones largas y conexiones persistentes.
- [ ] Probar el backend Node.js fuera de Vercel.
- [ ] Probar backup, exportación y restauración.
- [ ] Comparar alternativas usando requisitos reales, no una plataforma predeterminada.
- [ ] Registrar la decisión en un ADR.

## Relación con SDD

Las specs funcionales continúan siendo contratos independientes de tecnología. Este documento define el perfil de implementación vigente y puede cambiar sin alterar comportamiento de negocio, APIs públicas ni invariantes del dominio.

La implementación debe cumplir además:

- [`SPEC-207 — Engineering Quality & SDD Gates`](spec-207-transversal-engineering-quality/)
- [`SPEC-208 — Zero-Cost MVP Platform`](spec-208-transversal-zero-cost-mvp/)
- [`SPEC-209 — Monorepo Architecture`](spec-209-transversal-monorepo-architecture/)
- [`SPEC-210 — Data & Identity Platform`](spec-210-transversal-data-identity-platform/)
- [`SPEC-211 — Implementation Toolchain`](spec-211-transversal-implementation-toolchain/)
- [`SPEC-212 — Design System & Accessibility`](spec-212-transversal-design-system-accessibility/)
- [`SPEC-213 — MVP Walking Skeleton`](spec-213-transversal-mvp-walking-skeleton/)
- [`SPEC-214 — Environments, Configuration & Secrets`](spec-214-transversal-environments-configuration-secrets/)
- [`SPEC-215 — HTTP API Standards`](spec-215-transversal-http-api-standards/)
- [`SPEC-216 — Observability & Reliability`](spec-216-transversal-observability-reliability/)
- [`SPEC-217 — Events & Async Processing`](spec-217-transversal-events-async-processing/)
- [`SPEC-218 — Offline Operation & Synchronization`](spec-218-transversal-offline-sync/)

Cuando una limitación de Vercel afecte una spec —por ejemplo tiempo real, procesamiento continuo u operación offline— la spec declara la capacidad requerida y la arquitectura selecciona el adaptador o despliegue que la satisfaga.

## Criterios de aceptación

- React.js y Node.js son las tecnologías base visibles en scaffolding, CI y documentación.
- Vercel es el destino inicial de frontend y backend compatible.
- Ninguna regla de negocio depende del SDK o runtime propietario de Vercel.
- Cada servicio externo posee un contrato reemplazable.
- Es posible ejecutar y probar el núcleo fuera de Vercel.
- Los disparadores y el procedimiento de migración están documentados.
