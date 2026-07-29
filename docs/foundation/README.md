# Maitre Foundationals — Spec-Driven Development

<p align="center">
  <img src="../assets/branding/maitre-logo.png" alt="Logo de Maitre" width="640">
</p>

Este directorio contiene las **especificaciones ejecutables** de la plataforma Maitre. No es código; es el contrato que el código debe cumplir.

## Qué es Spec-Driven Development

**Spec-Driven Development (SDD)** es escribir especificaciones formales y verificables *antes* de implementación. Las specs son:

- **Ejecutables:** Pueden verificarse sin código.
- **Vivas:** Se actualizan con la plataforma.
- **Contrato:** Son el acuerdo entre stakeholders, equipos técnicos y usuarios.
- **Independientes de implementación:** Las specs funcionales no presuponen stack; las decisiones técnicas vigentes se documentan por separado.

El flujo es:

```
Especificaciones escritas
  ↓
Verificadas contra casos reales
  ↓
Implementación según spec
  ↓
Tests validan spec
  ↓
Código es corolario de la spec
```

No es TDD (test-driven). **No escribimos tests primero; escribimos especificaciones primero.**

---

## Organización de documentos

### Capa 1: Producto y estrategia

| Doc | Propósito | Lector |
| --- | --- | --- |
| [00-vision.md](00-vision.md) | Problema, visión, propuesta de valor | Todos |
| [01-product-principles.md](01-product-principles.md) | 12 principios que guían decisiones | Product, Engineering |
| [02-market-and-business.md](02-market-and-business.md) | Cliente, segmento, modelo de ingresos | Product, Sales |

### Capa 2: Modelo de negocio y servicios

| Doc | Propósito | Lector |
| --- | --- | --- |
| [03-service-catalog.md](03-service-catalog.md) | Catálogo de 20+ servicios y dependencias | Product, Sales |
| [04-tenancy-subscriptions.md](04-tenancy-subscriptions.md) | Cómo se contrata, factura y controla acceso | Product, Billing, Engineering |
| [05-domain-glossary.md](05-domain-glossary.md) | 47 términos del dominio (lenguaje ubicuo) | Todos |

### Capa 3: Diseño de dominio

| Doc | Propósito | Lector |
| --- | --- | --- |
| [06-domain-model.md](06-domain-model.md) | Entidades, contextos, estados, invariantes | Engineering, Product |
| [07-core-journeys.md](07-core-journeys.md) | 10 recorridos principales de usuarios | Product, UX, Engineering |
| [08-feedback-reputation.md](08-feedback-reputation.md) | Modelo de feedback y reputación | Engineering |
| [09-ai-digital-twin.md](09-ai-digital-twin.md) | Capacidades de IA y predicción | AI/ML, Engineering |

### Capa 4: Arquitectura y principios

| Doc | Propósito | Lector |
| --- | --- | --- |
| [10-architecture-principles.md](10-architecture-principles.md) | Planos lógicos, desacoplamiento, eventos | Architecture, Engineering |
| [11-mvp-roadmap.md](11-mvp-roadmap.md) | 6 fases con apps asociadas | Product, Engineering |
| [12-site-messaging.md](12-site-messaging.md) | Posicionamiento y copy para landing | Marketing, Product |

### Capa 5: Decisiones y referencias

| Doc | Propósito | Lector |
| --- | --- | --- |
| [13-decisions-and-open-questions.md](13-decisions-and-open-questions.md) | Qué se decidió, qué aún es abierto | Todos |
| [14-references.md](14-references.md) | Links a normativa, APIs, benchmarks | Engineering, Compliance |

### Capa 5 bis: Vistas transversales

| Doc | Propósito | Lector |
| --- | --- | --- |
| [18-architecture-components-design-views.md](18-architecture-components-design-views.md) | Relevamiento visual consolidado de arquitectura, componentes y diseño | Product, UX, Architecture, Engineering |
| [19-runtime-persistence-inventory.md](19-runtime-persistence-inventory.md) | Inventario operativo de runtime, persistencia Supabase y gaps reales por dominio | Architecture, Engineering, Product |

La implementación inicial usa **React.js**, **Node.js** y **Vercel**, manteniendo el núcleo portable. Consulta [el perfil técnico vigente](../sdd/TECH_STACK.md).

### Capa 6: Especificaciones ejecutables (SDD)

**Estos 3 documentos son el corazón del SDD:**

| Doc | Propósito | Lector | Estado |
| --- | --- | --- | --- |
| [15-applications-and-devices.md](../sdd/_guides/15-applications-and-devices.md) | 6 apps, dispositivos, mobile-first, capacidades offline | Product, UX, Engineering | ✅ MVP ready |
| [16-api-specifications.md](../sdd/_guides/16-api-specifications.md) | Contratos HTTP de cada API: método, path, request/response | Backend Engineering, Frontend | ✅ MVP ready |
| [17-event-specifications.md](../sdd/_guides/17-event-specifications.md) | Eventos que publican/consumen los dominios: estructura, payload, consumidores | Backend Engineering, Integration | ✅ MVP ready |

---

## Lógica de lectura para desarrollar

### Si eres **Frontend (Guest, Floor, Kitchen, Dash)**

1. Lee [05-domain-glossary.md](05-domain-glossary.md) — entiende términos.
2. Lee [15-applications-and-devices.md](../sdd/_guides/15-applications-and-devices.md) — tu app, dispositivo, flujos.
3. Lee [16-api-specifications.md](../sdd/_guides/16-api-specifications.md) — contrato con backend.
4. Lee [07-core-journeys.md](07-core-journeys.md) — recorridos de usuario.

### Si eres **Backend (cualquier dominio)**

1. Lee [05-domain-glossary.md](05-domain-glossary.md) — lenguaje ubicuo.
2. Lee [06-domain-model.md](06-domain-model.md) — entidades y estados de tu contexto.
3. Lee [16-api-specifications.md](../sdd/_guides/16-api-specifications.md) — APIs que expones.
4. Lee [17-event-specifications.md](../sdd/_guides/17-event-specifications.md) — eventos que publicas/consumes.
5. Lee [10-architecture-principles.md](10-architecture-principles.md) — patrones globales.
6. Usa [18-architecture-components-design-views.md](18-architecture-components-design-views.md) para conectar las specs con la estructura real del repo.

### Si eres **Product/UX**

1. Lee [00-vision.md](00-vision.md) — el problema que resolvemos.
2. Lee [01-product-principles.md](01-product-principles.md) — cómo decidimos.
3. Lee [03-service-catalog.md](03-service-catalog.md) — qué vendemos.
4. Lee [07-core-journeys.md](07-core-journeys.md) — experiencias principales.
5. Lee [15-applications-and-devices.md](../sdd/_guides/15-applications-and-devices.md) — cómo se materializan.

### Si eres **Lead técnico**

Lee todos. En orden:

1. 00–07 (visión, dominio, recorridos)
2. 10 (arquitectura)
3. 11 (MVP phases)
4. 15–17 (especificaciones ejecutables)
5. 18 (vistas visuales consolidadas)

---

## Cómo usar las especificaciones

### 16-api-specifications.md

Cada endpoint es un **contrato:**

```
POST /orders

Request:  [items] → cada ítem es {productId, qty, modifiers}
Response: {orderId, status, ticket}
Status:   201 Created, 400 Bad Request, 403 Forbidden, 409 Conflict

Entitlement: FLOOR.ACCESS = true
Authorized:  User can access this branch
```

**Implementación:** Tu código debe cumplir exactamente esto. Tests validan.

### 17-event-specifications.md

Cada evento es un **hecho ocurrido:**

```
OrderSubmitted
  ├─ estructura fija (eventId, namespace, aggregateId, payload)
  ├─ payload = {orderId, items, total, submittedAt}
  └─ consumidores = Kitchen, Cash, Analytics

KitchenTicketCreated
  ├─ se produce cuando OrderSubmitted llega a cocina
  └─ contiene referencia a order y ticket
```

**Implementación:** Tu dominio publica este evento exactamente. Consumidores lo procesan idempotentemente.

### 15-applications-and-devices.md

Cada app tiene **capacidades y responsabilidades:**

```
Floor (tablet)
  ├─ Primario: mozo toma pedidos
  ├─ Offline: guarda pedidos localmente, sincroniza al conectar
  ├─ APIs consume: GET /menus, POST /orders, PATCH /visits
  └─ Eventos consume: KitchenItemReady (push), TableStatusChanged

Kitchen (tablet)
  ├─ Primario: cocina ve comandas
  ├─ Offline: descarga comandas, marca estados localmente
  ├─ APIs consume: GET /kitchen/tickets, PATCH /kitchen/tickets/:id/items/:itemId
  └─ Eventos publica: KitchenItemReady
```

**Implementación:** Tu app debe cumplir exactamente esto. No más, no menos.

---

## Estructura de una especificación

```markdown
## [Nombre de entidad/flujo]

### [Operación o evento específico]

[Propósito en 1-2 líneas]

```
Request:  [estructura JSON esperada]
Response: [estructura JSON que devuelves]
Status:   [códigos HTTP posibles]
[Reglas/notas importantes]
```

[Ejemplo concreto]

Consumidores / Publicadores: [quién usa esto]
Entitlements: [qué derecho se requiere]
```

---

## Evolución de especificaciones

### Agregar funcionalidad

1. **Identifica** qué entidad o app afecta.
2. **Actualiza** la especificación (API o evento).
3. **Versioná:** `"eventVersion": "1.1"` o `POST /v2/orders`.
4. **Documenta** cambios en 13-decisions-and-open-questions.md.
5. **Implementa** y **testea contra spec**.

### Cambiar comportamiento existente

1. **No modificas** la v1 si algo la depende.
2. **Creás** versión nueva (v2) en paralelo.
3. **Implementas** ambas por un período.
4. **Migrás** consumidores.
5. **Desactivás** v1 cuando todo migró.

---

## Siguiente paso

**Ya existe:** Especificación completa de producto, dominio, APIs y eventos.

**Que falta:**

1. **Gherkin scenarios** — Traducir [07-core-journeys.md](07-core-journeys.md) a BDD.
   ```
   Scenario: Mozo toma pedido desde tablet
     Given una visita está abierta en la mesa T1
     When el mozo escanea la cámara QR de la mesa
     Then se abre el menú
     And el mozo ve productos disponibles en Palermo
   ```

2. **RBAC specification** — Matriz de quién puede hacer qué.
   ```
   Waiter:   POST /orders, PATCH /visits, GET /menus
   Cashier:  POST /payments, PATCH /bills, GET /reports (limited)
   Admin:    * (pero audita todo)
   ```

3. **State machine diagrams** — Visualizar transiciones formales.
   ```
   Order: DRAFT → SUBMITTED → ACCEPTED → IN_PREP → READY → DELIVERED
                          ↓ (rechazado)
                       CANCELLED (con motivo y autorizador)
   ```

4. **Error catalog** — Qué puede fallar y cómo responde el sistema.
   ```
   INSUFFICIENT_ENTITLEMENT
   BRANCH_INACTIVE
   KITCHEN_OVERLOADED
   PAYMENT_GATEWAY_UNREACHABLE
   ```

---

## Checklist para SDD

- [x] Visión y estrategia claras
- [x] Glosario del dominio
- [x] Modelo de dominio (entidades, relaciones)
- [x] Recorridos de usuario (happy paths)
- [x] APIs formalizadas (request/response)
- [x] Eventos formalizados (estructura y payload)
- [x] Apps y dispositivos especificados
- [ ] Gherkin scenarios (para BDD)
- [ ] RBAC specification
- [ ] State machines (diagramas)
- [ ] Error catalog
- [ ] Casos de integración con terceros

---

## Contacto y cambios

- **Cambio en spec:** Registra en 13-decisions-and-open-questions.md.
- **Pregunta abierta:** Agregá a 13.
- **Feedback de implementación:** Crea issue o Pull Request.

Maitre es especificación viva. Se actualiza con el aprendizaje.
