# Especificación — SPEC-084

## Tipo de spec
Entity

## Definición formal
Un QR Menu es el menú digital accesible via QR code en cada mesa.
Contiene referencias a Menu, categorías, productos.

Propiedades:
- Pertenece a un branch o salón
- Vinculado a Menu entity
- Código QR único
- Traducciones en múltiples idiomas
- Estado: ACTIVE | DRAFT | ARCHIVED

## Schema JSON

```json
{
  "id": "uuid (PK)",
  "tenant_id": "uuid",
  "branch_id": "uuid",
  "salon_id": "uuid | null (si es específico por salón)",
  "menu_id": "uuid (referencia a Menu)",
  "qr_code": "string (URL única, ej: https://maitre.app/menu/xyz)",
  "qr_image": "string (data URI o URL a imagen)",
  "name": "string (ej: 'Menú Digital')",
  "status": "enum: ACTIVE | DRAFT | ARCHIVED",
  "language_codes": ["array: es, en, fr, pt"],
  "translations": {
    "es": {
      "title": "string",
      "description": "string"
    },
    "en": { ... }
  },
  "settings": {
    "show_prices": "boolean",
    "show_descriptions": "boolean",
    "show_allergen_info": "boolean"
  },
  "created_at": "ISO8601",
  "last_updated_at": "ISO8601"
}
```

## Validaciones

- menu_id: debe existir y pertenecer al tenant
- qr_code: único global (es URL)
- language_codes: códigos ISO 639-1 válidos
- translations: debe haber entrada para cada language_code

## Reglas e invariantes

### 1. QR Code único global

**Regla:** qr_code es único a nivel global (no solo por tenant).

### 2. Si Menu se modifica, QR se invalida parcialmente

**Regla:** Si Menu.status → ARCHIVED, este QRMenu → ARCHIVED automáticamente.

### 3. Translations siempre sincronizadas

**Regla:** language_codes.length == translations.keys().length

### 4. Show prices puede ser oculto

**Regla:** Si show_prices=false, el cliente NO ve precios (ej: para menú de cortesía).
