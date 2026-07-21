# Especificación — SPEC-067

## Tipo de spec
Entity

## Definición formal
Un guest es un cliente/huésped que hace reservas o visitas.
Almacena preferencias, historial, información de contacto.

Propiedades:
- Nombre, teléfono, email
- Preferencias de mesa, alergias
- Historial de visitas
- Puntos de lealtad (opcional)

## Schema JSON

```json
{
  "id": "uuid (PK)",
  "tenant_id": "uuid",
  "name": "string (100 chars)",
  "email": "string (RFC 5322) | null",
  "phone": "string (E.164) | null",
  "birth_date": "ISO8601 date | null",
  "preferences": {
    "favorite_table_type": "WINDOW | BAR | QUIET | OUTDOOR | null",
    "dietary_restrictions": ["array of strings, ej: VEGETARIAN, GLUTEN_FREE"],
    "allergies": ["array of strings, ej: NUTS, SHELLFISH"],
    "language": "string (ISO 639-1) | null",
    "special_occasions": "string | null (ej: 'aniversario, cumpleaños')"
  },
  "visit_count": "integer (total visitas)",
  "last_visit_at": "ISO8601 timestamp | null",
  "loyalty_points": "integer (puntos acumulados)",
  "status": "enum: ACTIVE | INACTIVE | BLOCKED",
  "created_at": "ISO8601",
  "created_by": "uuid | null",
  "updated_at": "ISO8601"
}
```

## Status Enum

- **ACTIVE** — Cliente activo, puede reservar/visitar
- **INACTIVE** — No ha visitado en 2 años, pero no bloqueado
- **BLOCKED** — Bloqueado (por comportamiento)

## Validaciones

- name: 1-100 chars, mínimo 2 palabras recomendado
- email: RFC 5322 válido
- phone: E.164 válido
- birth_date: coherente (> 18 años)
- loyalty_points: >= 0

## Reglas e invariantes

### 1. Email único por tenant (si se proporciona)

**Regla:** No pueden existir 2 guests en un tenant con el mismo email.

### 2. Visit count se actualiza automáticamente

**Regla:** Cada vez que se crea una Visit con este guest, incrementar visit_count.

### 3. Last visit se actualiza al SEATED

**Regla:** Cuando Visit → SEATED, actualizar last_visit_at.

### 4. Alergias siempre visibles

**Regla:** Si un guest tiene allergies, deben mostrarse en orden/check para seguridad.

### 5. Guests BLOCKED no pueden reservar

**Regla:** En CREATE Reservation, verificar status != BLOCKED.
