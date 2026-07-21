# Especificación — SPEC-101

## Tipo de spec
Entity

## Definición formal
Una alerta es una notificación de problema o condición en la cocina.
Ej: "Retraso en Grill", "Producto fuera de stock", "Equipo dañado", etc.

Propiedades:
- Tipo: DELAY | OUT_OF_STOCK | EQUIPMENT_ISSUE | ALLERGY_WARNING | OTHER
- Prioridad: LOW | MEDIUM | HIGH | CRITICAL
- Estado: ACTIVE | RESOLVED
- Puede estar asignada a estación o global

## Schema JSON

```json
{
  "id": "uuid (PK)",
  "tenant_id": "uuid",
  "branch_id": "uuid",
  "station_id": "uuid | null (null = alerta global cocina)",
  "alert_type": "enum: DELAY | OUT_OF_STOCK | EQUIPMENT_ISSUE | ALLERGY_WARNING | OTHER",
  "priority": "enum: LOW | MEDIUM | HIGH | CRITICAL",
  "title": "string (ej: 'Retraso en Grill')",
  "description": "string (detalles, 500 chars)",
  "status": "enum: ACTIVE | ACKNOWLEDGED | RESOLVED | ESCALATED",
  "affected_products": ["array of product_ids (si OUT_OF_STOCK)"],
  "affected_tickets": ["array of ticket_ids (órdenes impactadas)"],
  "created_at": "ISO8601",
  "created_by": "uuid (chef o system)",
  "acknowledged_by": "uuid | null",
  "acknowledged_at": "ISO8601 | null",
  "resolved_by": "uuid | null",
  "resolved_at": "ISO8601 | null",
  "escalation_reason": "string | null (si escaló a meseros)"
}
```

## Alert Types

- **DELAY** — Retraso estimado (ej: "Grill +15min")
- **OUT_OF_STOCK** — Producto agotado (afecta órdenes)
- **EQUIPMENT_ISSUE** — Horno/freidora rota
- **ALLERGY_WARNING** — Alerta de alergia crítica (PEANUTS detected)
- **OTHER** — Otra situación

## Status Lifecycle

```
ACTIVE (recién creada)
  ↓ (cook confirma que vio)
ACKNOWLEDGED
  ↓ (problema resuelto)
RESOLVED

O

ESCALATED (se notifica a meseros/manager)
```

## Validaciones

- title: 1-100 chars
- description: 1-500 chars
- priority: válido enum
- alert_type: válido enum

## Reglas e invariantes

### 1. CRITICAL alerts se notifican automáticamente

**Regla:** alert.priority = CRITICAL → se envía notificación a todos los meseros.

Afecta DigitalBill (muestra "Demora esperada en X plato").

### 2. OUT_OF_STOCK afecta órdenes pendientes

**Regla:** Si OUT_OF_STOCK para product_id, órdenes que contienen ese producto se marcan como UNAVAILABLE.

### 3. ALLERGY_WARNING bloquea servicio

**Regla:** Si ALLERGY_WARNING de alergia crítica (PEANUTS, SHELLFISH), la orden debe ser revalidada.

### 4. Alertas viejas se limpian

**Regla:** Tras 2 horas de RESOLVED, se archiva (no se borra).
