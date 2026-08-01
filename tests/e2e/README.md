# Harness E2E

Playwright mantiene dos clases de evidencia:

- los proyectos por aplicación validan shells y contratos UI; los casos
  `@ui-contract` interceptan respuestas y no cuentan como evidencia de release;
- `journeys` usa Floor, Kitchen y Cash contra una API y persistencia compartidas,
  sin interceptar requests del producto.

## Comandos

```bash
# Construye API y webapps, levanta todos los servicios y ejecuta la suite.
npm run test:e2e

# Igual que el anterior, limitado al walking skeleton.
npm run test:e2e:smoke

# Reutiliza builds ya generados durante el desarrollo del harness.
npm run test:e2e:run -- --project=host

# Levanta únicamente Host y la API, como hace su job de CI.
E2E_APP=host npm run test:e2e:run -- --project=host

# Valida que el journey no tenga mocks, skips, focus ni sleeps fijos.
npm run e2e:journey:policy

# Ejecuta el perfil local del journey (no es evidencia release).
# Requiere APP_ENV=e2e, un run ID/seed/reloj, secreto ligado al run ID y
# tokens sintéticos distintos para waiter, cook, cashier, auditor y Tenant B.
npm run test:e2e:journey

# Después del journey, reinicia la API y verifica el checkpoint durable.
# Requiere E2E_DURABILITY_CHECKPOINT y el mismo stack PostgreSQL/Supabase.
npm run test:e2e:journey:restart
```

Los puertos dedicados al harness son: API `3101`, Dash `5273`, Cash `5274`, Kitchen `5275`,
Floor `5276`, Host `5278` y Guest `5279`. Un puerto ocupado falla de forma explícita para evitar
probar accidentalmente un proceso ajeno.

Los smokes iniciales validan carga, routing y estructura accesible sin autenticación. Floor además
incluye un recorrido autenticado determinista que intercepta la API: verifica estados y filtros de
mesa y abre una Visit desde una mesa libre, sin depender de estado manual ni de Supabase remoto.
Kitchen cubre del mismo modo el ciclo operativo completo de una comanda en el KDS:
`RECEIVED → CLAIMED → IN_PROGRESS → READY → COMPLETED`, incluida la desaparición de la cola luego
del handoff.
Ordering se verifica desde Floor con una visita ocupada: el mozo abre cuenta y borrador, navega el
menú, agrega cantidad y nota a un producto y envía el pedido a cocina.
Reservations se verifica desde Host: recepción identifica o crea al huésped, carga la reserva,
envía el contrato esperado a la API y comprueba que la nueva entrada aparezca en la agenda.

## Estado de MVP-J-001

El proyecto y el harness fallan de forma cerrada, registran manifiesto y
diagnósticos, crean identidades fixture con roles limitados y usan un cliente
API black-box. El journey autoritativo recorre las UIs reales para sentar una
mesa, enviar un pedido, prepararlo y entregarlo en Kitchen, pedir y capturar el
pago en Cash, cerrar la visita y comprobar que la mesa quedó libre. También
verifica el pago y su único movimiento de caja, registra evidencia correlacionada
y prueba que Tenant B no puede leer ni mutar el estado de Tenant A.

`local-memory` sirve únicamente para desarrollo. El job obligatorio
`E2E · Release journey (ephemeral Supabase)` usa el perfil `release-postgres`:
levanta un stack Supabase local aislado, reconstruye PostgreSQL desde todas las
migraciones, ejecuta el recorrido, reinicia la API y vuelve a leer el estado
persistido. Finalmente destruye el stack con `--no-backup`, verifica que ya no
esté activo y publica clasificación, manifiesto, migraciones y evidencia
Playwright. Un fallo de infraestructura, producto, persistencia o limpieza
bloquea `E2E gate` y, por extensión, el deploy.

En GitHub Actions cada aplicación es un job de matriz independiente, con build, ejecución y
artifacts propios. `fail-fast` está deshabilitado: un fallo de Host no impide obtener evidencia de
Floor, Kitchen, Cash, Guest o Dash.
