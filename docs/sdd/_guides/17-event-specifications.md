# Especificaciones de eventos

## Principio

Los dominios operativos comunican cambios relevantes mediante eventos. Cada evento:
- Es un hecho inmutable ocurrido en el pasado.
- Posee versión y namespace.
- Contiene contexto: tenant, sucursal, actor, timestamp.
- Es consumido idempotentemente por otros dominios.
- Se guarda para auditoría y reconstrucción de estado.

## Estructura base

```json
{
  "eventId": "evt_unique_uuid",
  "eventName": "OrderSubmitted",
  "eventVersion": "1.0",
  "namespace": "maitre.floor",
  "aggregateId": "order_888",
  "aggregateType": "Order",
  "tenantId": "tenant_123",
  "branchId": "branch_palermo",
  "actor": {
    "type": "USER",
    "id": "user_789",
    "name": "Juan García",
    "role": "WAITER"
  },
  "timestamp": "2025-01-10T12:40:15Z",
  "correlationId": "visit_555",
  "payload": { ... },
  "metadata": {
    "source": "FLOOR_APP",
    "deviceId": "tablet_001",
    "version": "2.0.1"
  }
}
```

---

## Eventos principales

### Organization Domain

#### TenantCreated

```json
{
  "eventName": "TenantCreated",
  "namespace": "maitre.organization",
  "aggregateId": "tenant_123",
  "payload": {
    "name": "Grupo Aguero",
    "email": "admin@grupoaguero.com",
    "country": "AR",
    "timezone": "America/Argentina/Buenos_Aires"
  }
}
```

**Consumidores:** Identity, Billing, Analytics

---

#### BranchCreated

```json
{
  "eventName": "BranchCreated",
  "namespace": "maitre.organization",
  "aggregateId": "branch_palermo",
  "correlationId": "tenant_123",
  "payload": {
    "branchId": "branch_palermo",
    "tenantId": "tenant_123",
    "code": "PALERMO",
    "name": "Palermo",
    "address": "Av. Córdoba 1234",
    "fiscalEntityId": "fiscal_001",
    "status": "ACTIVE"
  }
}
```

**Consumidores:** Floor, Reservations, Kitchen, Billing

---

### Identity Domain

#### UserInvited

```json
{
  "eventName": "UserInvited",
  "namespace": "maitre.identity",
  "aggregateId": "user_789",
  "correlationId": "tenant_123",
  "payload": {
    "userId": "user_789",
    "tenantId": "tenant_123",
    "email": "mozo@grupo.com",
    "role": "WAITER",
    "branches": ["branch_palermo"],
    "inviteToken": "...",
    "inviteExpiresAt": "2025-01-12T14:30:00Z"
  }
}
```

**Consumidores:** Email Service, Audit

---

#### UserAuthenticated

```json
{
  "eventName": "UserAuthenticated",
  "namespace": "maitre.identity",
  "aggregateId": "user_789",
  "correlationId": "tenant_123",
  "payload": {
    "userId": "user_789",
    "email": "mozo@grupo.com",
    "role": "WAITER",
    "deviceId": "tablet_001",
    "ipAddress": "192.168.1.10"
  }
}
```

**Consumidores:** Audit, Security, Analytics

---

### Subscription Domain

#### ServiceActivated

```json
{
  "eventName": "ServiceActivated",
  "namespace": "maitre.subscription",
  "aggregateId": "sub_456",
  "correlationId": "tenant_123",
  "payload": {
    "subscriptionId": "sub_456",
    "tenantId": "tenant_123",
    "serviceCode": "FLOOR",
    "scope": "BRANCH",
    "branches": ["branch_palermo", "branch_belgrano"],
    "activatedAt": "2025-01-10T14:00:00Z",
    "entitlements": {
      "FLOOR.ACCESS": true,
      "FLOOR.BRANCHES": ["branch_palermo", "branch_belgrano"]
    }
  }
}
```

**Consumidores:** Floor, Provisioning, Audit

---

#### ServiceDeactivated

```json
{
  "eventName": "ServiceDeactivated",
  "namespace": "maitre.subscription",
  "aggregateId": "sub_456",
  "correlationId": "tenant_123",
  "payload": {
    "subscriptionId": "sub_456",
    "tenantId": "tenant_123",
    "serviceCode": "FLOOR",
    "deactivatedAt": "2025-01-10T14:00:00Z",
    "dataRetention": "READ_ONLY",
    "reason": "customer_request"
  }
}
```

**Consumidores:** Floor, Audit, DataGovernance

---

### Floor Domain

#### ServiceDayOpened

```json
{
  "eventName": "ServiceDayOpened",
  "namespace": "maitre.floor",
  "aggregateId": "serviceday_001",
  "correlationId": "branch_palermo",
  "payload": {
    "serviceDayId": "serviceday_001",
    "tenantId": "tenant_123",
    "branchId": "branch_palermo",
    "date": "2025-01-10",
    "shift": "LUNCH",
    "tours": [
      {
        "tourId": "tour_1",
        "waiterId": "user_789",
        "tableIds": ["table_1", "table_2", "table_3", "table_4"]
      }
    ],
    "openedAt": "2025-01-10T12:00:00Z",
    "openedBy": "user_manager"
  }
}
```

**Consumidores:** Analytics, Kitchen, Audit

---

#### VisitOpened

```json
{
  "eventName": "VisitOpened",
  "namespace": "maitre.floor",
  "aggregateId": "visit_555",
  "correlationId": "branch_palermo",
  "payload": {
    "visitId": "visit_555",
    "tenantId": "tenant_123",
    "branchId": "branch_palermo",
    "serviceDayId": "serviceday_001",
    "groupSize": 4,
    "tableIds": ["table_1"],
    "reservationId": null,
    "status": "SEATED",
    "openedAt": "2025-01-10T12:35:00Z",
    "openedBy": "user_789"
  }
}
```

**Consumidores:** Kitchen, Cash, Feedback, Analytics

---

#### TableStatusChanged

```json
{
  "eventName": "TableStatusChanged",
  "namespace": "maitre.floor",
  "aggregateId": "table_1",
  "correlationId": "visit_555",
  "payload": {
    "tableId": "table_1",
    "tenantId": "tenant_123",
    "branchId": "branch_palermo",
    "serviceDayId": "serviceday_001",
    "previousStatus": "AVAILABLE",
    "newStatus": "OCCUPIED",
    "visitId": "visit_555",
    "changedAt": "2025-01-10T12:35:00Z",
    "changedBy": "user_789"
  }
}
```

**Consumidores:** Floor UI (push), Dash, Analytics

---

### Ordering Domain

#### OrderSubmitted

```json
{
  "eventName": "OrderSubmitted",
  "namespace": "maitre.ordering",
  "aggregateId": "order_888",
  "correlationId": "visit_555",
  "payload": {
    "orderId": "order_888",
    "tenantId": "tenant_123",
    "branchId": "branch_palermo",
    "visitId": "visit_555",
    "origin": "WAITER", // o CUSTOMER_QR
    "submittedBy": "user_789",
    "items": [
      {
        "itemId": "orderitem_1",
        "productId": "prod_milanesa",
        "quantity": 2,
        "modifiers": ["sin papas"],
        "price": 650,
        "subtotal": 1300
      }
    ],
    "subtotal": 1300,
    "submittedAt": "2025-01-10T12:40:15Z",
    "requiresApproval": false
  }
}
```

**Consumidores:** Kitchen, Cash, Analytics

---

#### OrderItemApproved

```json
{
  "eventName": "OrderItemApproved",
  "namespace": "maitre.ordering",
  "aggregateId": "order_888",
  "correlationId": "visit_555",
  "payload": {
    "orderId": "order_888",
    "itemId": "orderitem_1",
    "approvedAt": "2025-01-10T12:40:20Z",
    "approvedBy": "user_789",
    "reason": null
  }
}
```

**Consumidores:** Kitchen, Audit

---

### Kitchen Domain

#### KitchenTicketCreated

```json
{
  "eventName": "KitchenTicketCreated",
  "namespace": "maitre.kitchen",
  "aggregateId": "ticket_101",
  "correlationId": "order_888",
  "payload": {
    "ticketId": "ticket_101",
    "tenantId": "tenant_123",
    "branchId": "branch_palermo",
    "orderId": "order_888",
    "visitId": "visit_555",
    "station": "KITCHEN",
    "items": [
      {
        "ticketItemId": "ticketitem_1",
        "productId": "prod_milanesa",
        "quantity": 2,
        "modifiers": ["sin papas"],
        "createdAt": "2025-01-10T12:40:15Z"
      }
    ],
    "priority": 1,
    "createdAt": "2025-01-10T12:40:15Z",
    "createdBy": "system"
  }
}
```

**Consumidores:** Kitchen UI (push), Analytics

---

#### KitchenItemReady

```json
{
  "eventName": "KitchenItemReady",
  "namespace": "maitre.kitchen",
  "aggregateId": "ticket_101",
  "correlationId": "order_888",
  "payload": {
    "ticketId": "ticket_101",
    "ticketItemId": "ticketitem_1",
    "tenantId": "tenant_123",
    "branchId": "branch_palermo",
    "visitId": "visit_555",
    "productId": "prod_milanesa",
    "readyAt": "2025-01-10T12:55:00Z",
    "readyBy": "user_cook",
    "prepTime": 15, // minutos
    "ticketStatus": "PARTIALLY_READY"
  }
}
```

**Consumidores:** Floor UI (alert), Analytics, AI (timing insights)

---

#### KitchenTicketCompleted

```json
{
  "eventName": "KitchenTicketCompleted",
  "namespace": "maitre.kitchen",
  "aggregateId": "ticket_101",
  "correlationId": "order_888",
  "payload": {
    "ticketId": "ticket_101",
    "tenantId": "tenant_123",
    "branchId": "branch_palermo",
    "visitId": "visit_555",
    "completedAt": "2025-01-10T12:55:00Z",
    "completedBy": "user_cook",
    "totalPrepTime": 15
  }
}
```

**Consumidores:** Floor, Analytics

---

### Cash Domain

#### CheckRequested

```json
{
  "eventName": "CheckRequested",
  "namespace": "maitre.cash",
  "aggregateId": "bill_333",
  "correlationId": "visit_555",
  "payload": {
    "visitId": "visit_555",
    "tenantId": "tenant_123",
    "branchId": "branch_palermo",
    "requestedAt": "2025-01-10T13:10:00Z",
    "requestedBy": "user_789", // mozo o guest
    "format": "PRINTED" // o DIGITAL
  }
}
```

**Consumidores:** Cash, Floor, Audit

---

#### BillGenerated

```json
{
  "eventName": "BillGenerated",
  "namespace": "maitre.cash",
  "aggregateId": "bill_333",
  "correlationId": "visit_555",
  "payload": {
    "billId": "bill_333",
    "visitId": "visit_555",
    "tenantId": "tenant_123",
    "branchId": "branch_palermo",
    "items": [
      {
        "productId": "prod_milanesa",
        "quantity": 2,
        "unitPrice": 650,
        "subtotal": 1300
      }
    ],
    "subtotal": 1300,
    "tax": 240,
    "total": 1540,
    "status": "OPEN",
    "generatedAt": "2025-01-10T13:10:00Z"
  }
}
```

**Consumidores:** Guest (mostrar en app), Floor (UI), Audit

---

#### PaymentCompleted

```json
{
  "eventName": "PaymentCompleted",
  "namespace": "maitre.cash",
  "aggregateId": "payment_666",
  "correlationId": "bill_333",
  "payload": {
    "paymentId": "payment_666",
    "billId": "bill_333",
    "visitId": "visit_555",
    "tenantId": "tenant_123",
    "branchId": "branch_palermo",
    "amount": 1540,
    "method": "CASH", // o CARD, TRANSFER
    "status": "COMPLETED",
    "reference": "...",
    "receipt": {
      "type": "INVOICE",
      "number": "0001-00000123",
      "url": "..."
    },
    "completedAt": "2025-01-10T13:12:00Z",
    "completedBy": "user_cashier"
  }
}
```

**Consumidores:** Floor (permitir cerrar visita), Billing, Analytics, Audit

---

### Visit Domain

#### VisitClosed

```json
{
  "eventName": "VisitClosed",
  "namespace": "maitre.floor",
  "aggregateId": "visit_555",
  "correlationId": "branch_palermo",
  "payload": {
    "visitId": "visit_555",
    "tenantId": "tenant_123",
    "branchId": "branch_palermo",
    "serviceDayId": "serviceday_001",
    "groupSize": 4,
    "covers": 4,
    "duration": 97, // minutos
    "totalRevenue": 1540,
    "tables": ["table_1"],
    "closedAt": "2025-01-10T13:15:00Z",
    "closedBy": "user_789",
    "feedback": null
  }
}
```

**Consumidores:** Feedback, Analytics, Reservation (si venía de reserva)

---

### Feedback Domain

#### FeedbackRequested

```json
{
  "eventName": "FeedbackRequested",
  "namespace": "maitre.feedback",
  "aggregateId": "visit_555",
  "correlationId": "branch_palermo",
  "payload": {
    "visitId": "visit_555",
    "tenantId": "tenant_123",
    "branchId": "branch_palermo",
    "guestEmail": "guest@email.com", // si disponible
    "guestPhone": "+54 11 1234-5678", // si disponible
    "feedbackLink": "https://maitre.app/feedback/...",
    "method": "SMS", // o EMAIL, QR
    "requestedAt": "2025-01-10T13:16:00Z"
  }
}
```

**Consumidores:** SMS/Email Service, Analytics

---

#### FeedbackReceived

```json
{
  "eventName": "FeedbackReceived",
  "namespace": "maitre.feedback",
  "aggregateId": "feedback_111",
  "correlationId": "visit_555",
  "payload": {
    "feedbackId": "feedback_111",
    "visitId": "visit_555",
    "tenantId": "tenant_123",
    "branchId": "branch_palermo",
    "rating": 5,
    "categories": {
      "food": 5,
      "service": 4,
      "cleanliness": 5,
      "value": 4
    },
    "comment": "Excelente experiencia, vuelvo pronto.",
    "recommend": true,
    "sentiment": "POSITIVE",
    "receivedAt": "2025-01-10T14:00:00Z"
  }
}
```

**Consumidores:** Reputation (si vinculada con reseña externa), Analytics, Dash

---

### Reputation Domain

#### ExternalReviewReceived

```json
{
  "eventName": "ExternalReviewReceived",
  "namespace": "maitre.reputation",
  "aggregateId": "review_gbp_999",
  "correlationId": "branch_palermo",
  "payload": {
    "reviewId": "review_gbp_999",
    "provider": "GOOGLE_BUSINESS_PROFILE",
    "externalReviewId": "...",
    "tenantId": "tenant_123",
    "branchId": "branch_palermo",
    "rating": 4,
    "title": "Muy bueno",
    "comment": "Comida excelente, servicio rápido.",
    "reviewerPublicName": "Juan G.",
    "publishedAt": "2025-01-08T10:30:00Z",
    "language": "es",
    "sentiment": "POSITIVE",
    "categories": ["food", "service"],
    "synchronizedAt": "2025-01-10T08:00:00Z"
  }
}
```

**Consumidores:** Reputation Dashboard, Analytics, AI (analysis)

---

#### ReponseDrafted

```json
{
  "eventName": "ReponseDrafted",
  "namespace": "maitre.reputation",
  "aggregateId": "review_gbp_999",
  "correlationId": "branch_palermo",
  "payload": {
    "reviewId": "review_gbp_999",
    "provider": "GOOGLE_BUSINESS_PROFILE",
    "draftedAt": "2025-01-10T08:15:00Z",
    "draftedBy": "ai_system",
    "draft": {
      "text": "Muchas gracias por tu comentario. Nos alegra haber superado tus expectativas...",
      "tone": "PROFESSIONAL_WARM"
    }
  }
}
```

**Consumidores:** Reputation UI (para que humano revise y apruebe)

---

## Patrones de consumo

### Idempotencia

Si un evento se reentrega:
```
Si eventId ya fue procesado → ignorar
Almacenar eventId + timestamp por 24 horas mínimo
```

### Ordenamiento

Eventos relacionados deben procesarse en orden:
```
OrderSubmitted (1) → OrderItemApproved (2) → KitchenTicketCreated (3)
```

Por eso cada evento incluye `correlationId` para agrupar.

### Retry

```
Evento enviado pero consumidor offline:
Reintentar con backoff exponencial (1s, 2s, 4s, 8s...)
Máximo 5 reintentos.
Después: dead-letter queue para investigación.
```

---

## Roadmap de versiones

**v1.0:** Eventos de Organization, Identity, Subscription, Floor, Ordering, Kitchen, Cash, Feedback
**v2.0:** Reputation, AI (predictions), Integration webhooks
**v3.0:** Eventos financieros de detalle, análisis predictivo maduro

