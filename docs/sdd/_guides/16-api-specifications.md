# Especificaciones de APIs

## Principio

Cada aplicación tiene un contrato formal con el backend. Las APIs están agrupadas por dominio operativo y especificadas con:
- Endpoint y método HTTP
- Path parameters, query, body
- Response estructura
- Status codes y errores
- Entitlements requeridos
- Contexto de autorización

## Convenciones

Las convenciones normativas transversales están definidas en
[`SPEC-215 — HTTP API Standards`](../spec-215-transversal-http-api-standards/).

```
POST   /resource           → crear
GET    /resource/:id       → obtener
PATCH  /resource/:id       → actualizar parcial
DELETE /resource/:id       → borrar
GET    /resource           → listar (con paginación)
```

Headers requeridos:
```
Authorization: Bearer <token>
X-Tenant-Id: <tenantId>
X-Branch-Id: <branchId>  (si aplica)
Content-Type: application/json
Idempotency-Key: <uuid>  (para POSTs críticos)
```

`X-Tenant-Id` y `X-Branch-Id` expresan el contexto solicitado. El backend siempre debe validar ese contexto contra la identidad, memberships, roles y entitlements; estos headers nunca otorgan autoridad por sí mismos.

---

## Control Plane APIs

### Tenants

#### POST /tenants

Crear tenant.

```
Request:
{
  "name": "Grupo Aguero",
  "email": "admin@grupoaguero.com",
  "plan": "STARTER"
}

Response 201:
{
  "id": "tenant_123",
  "name": "Grupo Aguero",
  "status": "ACTIVE",
  "createdAt": "2025-01-10T14:30:00Z",
  "subscription": {
    "id": "sub_123",
    "status": "TRIALING",
    "trialEndsAt": "2025-02-10T14:30:00Z"
  }
}
```

---

#### GET /tenants/:id

Obtener detalles del tenant (solo admin o propietario).

```
Response 200:
{
  "id": "tenant_123",
  "name": "Grupo Aguero",
  "status": "ACTIVE",
  "brands": [...],
  "fiscalEntities": [...],
  "branches": [...],
  "subscription": {...},
  "entitlements": [...]
}
```

---

### Subscriptions

#### POST /subscriptions

Crear o actualizar suscripción (admin tenant).

```
Request:
{
  "items": [
    {
      "serviceCode": "CORE",
      "scope": "TENANT"
    },
    {
      "serviceCode": "FLOOR",
      "scope": "BRANCH",
      "branches": ["branch_palermo", "branch_belgrano"]
    },
    {
      "serviceCode": "QR_MENU",
      "scope": "BRANCH",
      "branches": ["branch_palermo"]
    }
  ],
  "billingCycle": "MONTHLY",
  "paymentMethod": "CREDIT_CARD"
}

Response 201:
{
  "id": "sub_456",
  "status": "ACTIVE",
  "items": [...],
  "nextBillingDate": "2025-02-10",
  "totalAmount": 45000,
  "currency": "ARS"
}
```

---

#### GET /subscriptions/:id/entitlements

Obtener derechos efectivos (cualquier app).

```
Response 200:
{
  "subscriptionId": "sub_456",
  "tenant": {
    "CORE": true,
    "IDENTITY": true
  },
  "byBranch": {
    "branch_palermo": {
      "FLOOR": true,
      "RESERVATIONS": true,
      "QR_MENU": true,
      "QR_ORDERING": false,
      "KITCHEN": true
    },
    "branch_belgrano": {
      "FLOOR": true,
      "QR_MENU": true
    }
  },
  "limits": {
    "BRANCHES": { "max": 3, "current": 2 },
    "USERS": { "max": 25, "current": 8 },
    "CASH_BOXES": { "max": 5, "current": 2 }
  }
}
```

---

## Identity APIs

### POST /users

Crear usuario (admin del tenant).

```
Request:
{
  "email": "mozo@grupo.com",
  "name": "Juan García",
  "role": "WAITER",
  "branches": ["branch_palermo"]
}

Response 201:
{
  "id": "user_789",
  "email": "mozo@grupo.com",
  "name": "Juan García",
  "role": "WAITER",
  "status": "INVITED",
  "inviteToken": "...",
  "inviteExpiresAt": "2025-01-12T14:30:00Z"
}
```

---

### POST /auth/login

Autenticar usuario.

```
Request:
{
  "email": "mozo@grupo.com",
  "password": "...",
  "deviceId": "tablet_001"
}

Response 200:
{
  "token": "eyJhbGc...",
  "refreshToken": "...",
  "expiresIn": 3600,
  "user": {
    "id": "user_789",
    "name": "Juan García",
    "role": "WAITER",
    "branches": ["branch_palermo"]
  }
}
```

---

## Organization APIs

### POST /branches

Crear sucursal (admin tenant).

```
Request:
{
  "code": "PALERMO",
  "name": "Palermo",
  "address": "Av. Córdoba 1234",
  "phone": "+54 11 4321-1234",
  "brand": "brand_123",
  "fiscalEntity": "fiscal_001",
  "timezone": "America/Argentina/Buenos_Aires",
  "services": ["FLOOR", "QR_MENU", "KITCHEN", "CASH"]
}

Response 201:
{
  "id": "branch_palermo",
  "code": "PALERMO",
  "name": "Palermo",
  "status": "ACTIVE",
  "configuration": {
    "salons": [],
    "menu": null
  }
}
```

---

### GET /branches/:id

Obtener sucursal con configuración operativa.

```
Response 200:
{
  "id": "branch_palermo",
  "name": "Palermo",
  "salons": [
    {
      "id": "salon_main",
      "name": "Salón Principal",
      "capacity": 80,
      "tables": [
        {
          "id": "table_1",
          "number": 1,
          "capacity": 4,
          "x": 100,
          "y": 150,
          "status": "AVAILABLE"
        }
      ]
    }
  ],
  "menu": { "id": "menu_current", ... },
  "fiscalEntity": { "id": "fiscal_001", ... }
}
```

---

## Floor APIs (Maitre Floor app — mozo, tablet)

### POST /service-days

Abrir jornada de servicio.

```
Request:
{
  "date": "2025-01-10",
  "shift": "LUNCH", // o DINNER
  "tours": [
    {
      "wayfierId": "mozo_juan",
      "tables": ["table_1", "table_2", "table_3", "table_4"]
    }
  ]
}

Response 201:
{
  "id": "serviceday_001",
  "status": "OPEN",
  "tours": [...],
  "tables": [
    {
      "id": "table_1",
      "status": "AVAILABLE"
    }
  ]
}
```

---

### POST /visits

Crear visita (llegada de grupo).

```
Request:
{
  "serviceDayId": "serviceday_001",
  "groupSize": 4,
  "tables": ["table_1"],
  "reservationId": null, // si viene de reserva
  "openedBy": "user_789"
}

Response 201:
{
  "id": "visit_555",
  "status": "SEATED",
  "groupSize": 4,
  "tables": ["table_1"],
  "openedAt": "2025-01-10T12:35:00Z",
  "orders": []
}
```

---

### PATCH /visits/:id

Cambiar estado de visita.

```
Request:
{
  "status": "CHECK_REQUESTED",
  "timestamp": "2025-01-10T13:10:00Z"
}

Response 200:
{
  "id": "visit_555",
  "status": "CHECK_REQUESTED",
  "updatedAt": "2025-01-10T13:10:00Z"
}
```

---

### POST /orders

Crear pedido (móvil o mozo desde salón).

```
Request:
{
  "visitId": "visit_555",
  "items": [
    {
      "productId": "prod_milanesa",
      "quantity": 2,
      "modifiers": ["sin papas"],
      "origin": "WAITER", // o CUSTOMER_QR
      "approvedBy": "user_789"
    }
  ],
  "idempotencyKey": "uuid-unique"
}

Response 201:
{
  "id": "order_888",
  "visitId": "visit_555",
  "status": "SUBMITTED",
  "items": [...],
  "createdAt": "2025-01-10T12:40:00Z",
  "ticket": {
    "id": "ticket_101",
    "status": "PENDING",
    "station": "KITCHEN"
  }
}
```

---

## Kitchen APIs (Maitre Kitchen app — tablet)

### GET /kitchen/tickets

Obtener comandas pendientes (por estación).

```
Query: ?station=KITCHEN&status=PENDING

Response 200:
[
  {
    "id": "ticket_101",
    "visitId": "visit_555",
    "status": "PENDING",
    "items": [
      {
        "id": "ticketitem_1",
        "product": "Milanesa",
        "quantity": 2,
        "modifiers": ["sin papas"],
        "createdAt": "2025-01-10T12:40:00Z",
        "estimatedTime": 15
      }
    ],
    "priority": 1,
    "alerts": []
  }
]
```

---

### PATCH /kitchen/tickets/:id/items/:itemId

Marcar ítem como listo.

```
Request:
{
  "status": "READY",
  "readyAt": "2025-01-10T12:55:00Z"
}

Response 200:
{
  "ticketItemId": "ticketitem_1",
  "status": "READY",
  "readyAt": "2025-01-10T12:55:00Z",
  "ticket": {
    "id": "ticket_101",
    "status": "PARTIALLY_READY"
  },
  "event": "KitchenItemReady"
}
```

---

## Cash APIs (Maitre Cash app — web/tablet)

### POST /bills

Generar cuenta.

```
Request:
{
  "visitId": "visit_555",
  "subtotal": 1200,
  "tax": 240,
  "tip": 0,
  "discounts": []
}

Response 201:
{
  "id": "bill_333",
  "visitId": "visit_555",
  "subtotal": 1200,
  "tax": 240,
  "total": 1440,
  "status": "OPEN",
  "items": [...]
}
```

---

### POST /payments

Registrar pago.

```
Request:
{
  "billId": "bill_333",
  "amount": 1440,
  "method": "CASH", // o CARD, TRANSFER
  "reference": "...",
  "idempotencyKey": "uuid-unique"
}

Response 201:
{
  "id": "payment_666",
  "billId": "bill_333",
  "amount": 1440,
  "method": "CASH",
  "status": "COMPLETED",
  "receipt": {
    "number": "0001-00000123",
    "type": "INVOICE",
    "url": "..."
  },
  "event": "PaymentCompleted"
}
```

---

## Guest APIs (Maitre Guest app — celular)

### GET /public/branches/:branchId/menu

Obtener menú (sin autenticación, QR público).

```
Response 200:
{
  "branchId": "branch_palermo",
  "menu": {
    "id": "menu_current",
    "categories": [
      {
        "id": "cat_cold",
        "name": "Entradas frías",
        "products": [
          {
            "id": "prod_milanesa",
            "name": "Milanesa de ternera",
            "price": 650,
            "photo": "...",
            "description": "Con puré y ensalada",
            "allergens": ["gluten", "huevo"],
            "available": true
          }
        ]
      }
    ]
  }
}
```

---

### POST /reservations (público)

Crear reserva remota.

```
Request:
{
  "branchId": "branch_palermo",
  "date": "2025-01-15",
  "time": "20:30",
  "guests": 4,
  "name": "García",
  "email": "client@email.com",
  "phone": "+54 11 1234-5678",
  "notes": ""
}

Response 201:
{
  "id": "reservation_999",
  "status": "HELD",
  "date": "2025-01-15",
  "time": "20:30",
  "guests": 4,
  "confirmationToken": "...",
  "confirmationUrl": "https://maitre.app/confirm/...",
  "message": "Reserva confirmada. Receverás un recordatorio 24 horas antes."
}
```

---

### POST /orders (público, desde QR)

Crear pedido desde Guest sin autenticación.

```
Request:
{
  "sessionId": "qr_session_abc123",
  "branchId": "branch_palermo",
  "tableId": "table_1",
  "items": [
    {
      "productId": "prod_milanesa",
      "quantity": 2,
      "modifiers": ["sin papas"]
    }
  ]
}

Response 201:
{
  "id": "order_guest_777",
  "status": "PENDING_APPROVAL",
  "items": [...],
  "total": 1300,
  "message": "Tu pedido fue registrado. El mozo lo revisará en instantes."
}
```

---

### POST /visits/:id/feedback

Registrar feedback post-visita.

```
Request:
{
  "rating": 5,
  "categories": {
    "food": 5,
    "service": 4,
    "cleanliness": 5,
    "value": 4
  },
  "comment": "Excelente experiencia, vuelvo pronto.",
  "recommend": true
}

Response 201:
{
  "id": "feedback_111",
  "visitId": "visit_555",
  "rating": 5,
  "status": "RECEIVED",
  "createdAt": "2025-01-10T14:00:00Z"
}
```

---

## Dashboard APIs (Maitre Dash — web)

### GET /analytics/today

Resumen del día actual.

```
Response 200:
{
  "date": "2025-01-10",
  "branch": "branch_palermo",
  "summary": {
    "visits": 47,
    "covers": 156,
    "revenue": 45600,
    "avgCheck": 292,
    "serviceTime": 65, // minutos promedio
    "feedback": {
      "count": 23,
      "avgRating": 4.7
    }
  },
  "currentStatus": {
    "openVisits": 8,
    "tablesOccupied": 15,
    "pendingKitchenTickets": 12,
    "alerts": []
  }
}
```

---

### GET /reports/:period

Reportes por período (día, semana, mes).

```
Query: ?branch=branch_palermo&period=MONTH&month=2025-01

Response 200:
{
  "period": "2025-01",
  "branch": "branch_palermo",
  "revenue": 1856000,
  "visits": 487,
  "covers": 1623,
  "services": [...],
  "topProducts": [...],
  "feedback": {...}
}
```

---

## Consideraciones cross-cutting

### Errores estándar

```json
{
  "error": {
    "code": "INVALID_REQUEST",
    "message": "El cantidad debe ser > 0",
    "field": "items[0].quantity",
    "timestamp": "2025-01-10T14:30:00Z"
  }
}
```

Códigos comunes:
- `400 BAD_REQUEST` — Validación fallida
- `401 UNAUTHORIZED` — Token inválido o expirado
- `403 FORBIDDEN` — Sin permisos (entitlement fallido)
- `404 NOT_FOUND` — Recurso no existe
- `409 CONFLICT` — Estado incompatible (ej: cambio de estado inválido)
- `429 TOO_MANY_REQUESTS` — Rate limit
- `500 INTERNAL_SERVER_ERROR` — Error del servidor

### Idempotencia

POSTs críticos (pedidos, pagos) requieren `Idempotency-Key`.

Si se reintenta con la misma key:
- Se devuelve la respuesta anterior, no se duplica.
- El servidor almacena key + response por 24 horas mínimo.

---

## Roadmap de madurez

**Fase 1:** APIs de Tenant, Identity, Organization, Dash
**Fase 2:** APIs de Floor, Kitchen
**Fase 3:** APIs de Guest (público y autenticado)
**Fase 4:** APIs de Cash, Billing
**Fase 5:** APIs de Integrations (webhooks, OAuth, sincronización)
