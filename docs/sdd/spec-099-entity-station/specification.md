# Especificación — SPEC-099

## Tipo de spec
Entity

## Definición formal
Una estación es un área de la cocina especializada en preparar ciertos platos.
Ej: Grill (carnes), Pasta, Repostería, Frutos de mar, etc.

Propiedades:
- Nombre, descripción
- Categorías de productos que prepara
- Número de cocineros asignados
- Estado: ACTIVE | CLOSED
- Prioridad default

## Schema JSON

```json
{
  "id": "uuid (PK)",
  "tenant_id": "uuid",
  "branch_id": "uuid",
  "name": "string (ej: 'Grill', 'Pasta', 'Repostería')",
  "description": "string | null",
  "station_type": "enum: GRILL | PASTA | PASTRY | SEAFOOD | SAUTE | FRY | PREP | ASSEMBLY",
  "product_categories": ["array of category_ids que prepara esta estación"],
  "staff_count": "integer (cocineros asignados)",
  "status": "enum: ACTIVE | CLOSED",
  "can_handle_rush": "boolean (¿puede procesar muchas órdenes rápidamente?)",
  "average_prep_time_minutes": "integer (promedio histórico)",
  "max_parallel_tickets": "integer (cuántos tickets simultáneos puede manejar)",
  "created_at": "ISO8601",
  "created_by": "uuid"
}
```

## Station Types

- **GRILL** — Carnes a la parrilla
- **PASTA** — Pastas y risottos
- **PASTRY** — Repostería
- **SEAFOOD** — Frutos de mar
- **SAUTE** — Técnicas de salteado
- **FRY** — Fritura
- **PREP** — Preparación previa
- **ASSEMBLY** — Armar platos

## Validaciones

- name: 1-50 chars
- staff_count: >= 1
- average_prep_time_minutes: > 0
- max_parallel_tickets: >= 1

## Reglas e invariantes

### 1. Station CLOSED no recibe tickets nuevos

**Regla:** Si status=CLOSED, no se pueden crear Commands para esta estación.

### 2. Staff count afecta velocidad

**Regla:** average_prep_time_minutes puede variar según staff_count disponible.

### 3. Product categories definen qué se prepara

**Regla:** Los productos cuya category está en product_categories, van a esta estación.

### 4. Max parallel tickets es límite físico

**Regla:** Si en_progress_tickets >= max_parallel_tickets, nuevo ticket debe esperar.
