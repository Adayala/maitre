# /docs/sdd — Specifications (Spec-Driven Development)

Artefactos de especificación ejecutable. **No es código; es el contrato que el código debe cumplir.**

## Documentos por tipo

### Roadmap y Planning

- **00-mvp-specifications-roadmap.md** — Listado completo de ~193 specs a realizar para MVP (Fases 1-5)
  - Organizadas por fase
  - Checklist de status
  - Conteo y categorización

### Arquitectura y Diseño (de foundation)

- **15-applications-and-devices.md** — 6 apps, dispositivos, mobile-first, offline capabilities
- **16-api-specifications.md** — Contratos HTTP formales: endpoints, request/response, status codes, entitlements
- **17-event-specifications.md** — Eventos del sistema: estructura, payload, consumidores, versionamiento

---

## Estructura de una especificación

Cada spec sigue este formato:

```markdown
# [Nombre de entidad/API/Evento]

## Propósito
[Qué es, por qué existe]

## Estructura / Definición
[JSON schema, campos, tipos]

## Reglas / Invariantes
- [Regla 1]
- [Regla 2]

## Ejemplos
[JSON o pseudo-código]

## Consumidores / Publicadores
[Quién usa esto]

## Entitlements
[Qué derechos se requieren]

## Status
[PLANNED, DRAFT, READY FOR IMPLEMENTATION, IN PROGRESS, DONE]
```

---

## Cómo se generan specs

Para cada artefacto en el roadmap:

1. **Create file:** `spec-[type]-[name].md`
   - `spec-entity-order.md` — Entidad Order
   - `spec-api-orders.md` — API de Orders
   - `spec-event-order-submitted.md` — Evento OrderSubmitted
   - `spec-state-machine-order.md` — Máquina de estados
   - `spec-rbac-floor.md` — Control de acceso del dominio Floor

2. **Write spec:** Seguir formato y completar todas las secciones.

3. **Update roadmap:** Marcar como READY FOR IMPLEMENTATION.

4. **Link in foundation:** Si la spec afecta docs en /foundation/, actualizar referencias.

---

## Categorías de especificaciones

### Entity Specs (`spec-entity-*.md`)

Define una entidad de dominio: campos, tipos, ciclo de vida.

```markdown
## Estructura

{
  "id": "uuid",
  "tenantId": "tenant_123",
  "branchId": "branch_palermo",
  "name": "string",
  "status": "ACTIVE | INACTIVE",
  "createdAt": "ISO8601",
  "updatedAt": "ISO8601"
}

## Reglas

- Cada orden pertenece a una visita
- Los ítems de una orden no se eliminan, se cancelan
```

### API Specs (`spec-api-*.md`)

Define contratos HTTP: endpoints, métodos, request/response.

```markdown
## Endpoints

### POST /orders

Crear orden.

Request:
{
  "visitId": "visit_555",
  "items": [...]
}

Response 201: { "id": "order_888", ... }
```

### Event Specs (`spec-event-*.md`)

Define eventos que publica un dominio.

```markdown
## Estructura Base

{
  "eventId": "evt_unique",
  "eventName": "OrderSubmitted",
  "eventVersion": "1.0",
  "aggregateId": "order_888",
  "tenantId": "tenant_123",
  "timestamp": "ISO8601",
  "payload": {...}
}

## Payload

{ "orderId", "items", "submittedAt" }

## Consumidores

Kitchen, Cash, Analytics
```

### State Machine Specs (`spec-state-machine-*.md`)

Define estados válidos y transiciones.

```markdown
## Estados

DRAFT → SUBMITTED → ACCEPTED → IN_PREP → READY → DELIVERED
               ↓
            CANCELLED (con reason, authorizer)

## Transiciones

- SUBMITTED → ACCEPTED: precondición = tiene ítems, entitlement = ORDERING.APPROVE
- SUBMITTED → CANCELLED: precondición = ninguna, actor debe ser MANAGER+
```

### RBAC Specs (`spec-rbac-*.md`)

Define quién puede hacer qué en un dominio.

```markdown
## Matriz

WAITER:
  - POST /orders (crear orden)
  - PATCH /visits/:id (cambiar status)
  - GET /menus (ver catálogo)

COOK:
  - GET /kitchen/tickets (ver comandas)
  - PATCH /kitchen/tickets/:id/items/:id (cambiar estado)
```

### Calculation Specs (`spec-calculation-*.md`)

Define cálculos, fórmulas, algoritmos.

```markdown
## Entitlements from Subscription

FLOOR.ACCESS = (existe FLOOR en subscription items)
FLOOR.BRANCHES = [lista de branches donde FLOOR está activo]
MAX_USERS = (suma de capacidad en subscription items)
```

### Connector Specs (`spec-connector-*.md`)

Define integraciones con terceros.

```markdown
## Google Business Profile

1. OAuth2 flow → obtener access token
2. Sincronizar reviews cada 4 horas
3. Si review nueva → ConnectorSynchronized event
```

### Transversal Specs

- `spec-tenant-isolation.md` — Datos multi-tenant
- `spec-idempotency.md` — Deduplicación de requests
- `spec-offline-sync.md` — Sincronización de datos offline
- `spec-error-codes.md` — Catálogo de errores

---

## Roadmap de escritura

### Prioridad 1 (escribir primero)

Specs de Fase 1 y Fase 2: los pilares.

```
spec-entity-tenant.md
spec-entity-subscription.md
spec-api-tenants.md
spec-api-subscriptions.md
spec-entity-order.md
spec-state-machine-order.md
spec-api-orders.md
spec-event-order-submitted.md
spec-rbac-floor.md
```

### Prioridad 2

Specs de Fase 3: reservas y guest.

### Prioridad 3

Fases 4-5 y transversales.

---

## Status de escritura

```
PLANNED       = Identificada en roadmap, no iniciada
DRAFT         = Escritura en progreso
READY FOR IMP = Completada, lista para implementar
IN PROGRESS   = Se está implementando según la spec
DONE          = Implementada y testeo pasa
```

Cada spec tiene un campo `Status` al inicio.

---

## Versioning de especificaciones

Si una spec cambia:

1. **Cambio menor (no breaking):** Versión +0.1 (v1.1)
   - Agregar un campo opcional
   - Cambiar descripción
   - Agregar un status válido

2. **Cambio mayor (breaking):** Versión +1.0 (v2.0)
   - Eliminar campo
   - Cambiar tipo
   - Cambiar comportamiento crítico
   
   En código: nueva versión de API (`POST /v2/orders`) o nuevo evento (`OrderSubmittedV2`)

---

## Verificación

Cada spec debe pasar:

```
✅ Estructura: campos definidos, tipos claros
✅ Ejemplos: JSON válido, coherente
✅ Reglas: invariantes posibles y verificables
✅ Consumidores: linkeados correctamente
✅ Errores: qué puede fallar y cómo responder
✅ Status: actualizado
```

---

## Linking

Las specs se referencian entre sí:

```markdown
Vea también:
- spec-entity-order.md
- spec-event-order-submitted.md
- spec-api-orders.md
```

En herramientas futuras: grafo de specs, dependencias automáticas.

