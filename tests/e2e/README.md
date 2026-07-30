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
# tokens sintéticos distintos para waiter, cook, cashier y Tenant B.
npm run test:e2e:journey
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

`local-memory` sirve para desarrollo y no prueba migraciones ni RLS. El gate de
release seguirá desactivado hasta disponer de PostgreSQL/Supabase efímero,
provisionamiento Tenant A/B, limpieza verificada y el recorrido completo verde.

En GitHub Actions cada aplicación es un job de matriz independiente, con build, ejecución y
artifacts propios. `fail-fast` está deshabilitado: un fallo de Host no impide obtener evidencia de
Floor, Kitchen, Cash, Guest o Dash.
