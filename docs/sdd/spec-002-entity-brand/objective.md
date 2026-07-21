# Objetivo — SPEC-002

## Propósito

Una marca es la identidad comercial de un restaurante. Permite que un tenant agrupe sucursales bajo una marca, compartiendo menú, políticas y configuración. Un tenant puede tener múltiples marcas (ej: "La Parrilla", "Pizzería Bella", "Sushi Bar").

Sin un modelo de brand claro, no hay forma de organizar sucursales bajo identidades comerciales distintas ni de heredar configuración consistentemente.

## Resultado esperado

Cuando esta spec esté completa:

1. ✅ Una marca se puede crear con nombre, logo, configuración
2. ✅ Una marca pertenece a un tenant y puede heredar configuración a sus sucursales
3. ✅ Una marca tiene un menú por defecto que las sucursales pueden usar o sobrescribir
4. ✅ API CRUD completa: POST /brands, GET /brands/:id, PATCH /brands/:id
5. ✅ Un evento BrandCreated se emite cuando se crea
6. ✅ Datos de brand se aislan por tenant

## Criterios de aceptación

### CAD-1: Brand puede ser creado

**Criterio:** POST /brands con name, tenantId crea brand correctamente.

Validaciones:
- Name: mínimo 3 caracteres, máximo 100
- TenantId debe existir
- Slug generado automático (nombre normalizado, único dentro del tenant)
- Status inicia en ACTIVE
- Se genera UUID para id
- createdAt y updatedAt son ISO8601

**Cómo se verifica:**
```
POST /brands
{
  "tenantId": "tenant_123",
  "name": "La Parrilla",
  "logo_url": "https://...",
  "description": "Parrilla tradicional"
}

Response 201: brand con id, slug="la-parrilla", status ACTIVE
```

---

### CAD-2: Brand hereda a sucursales

**Criterio:** Una sucursal puede heredar configuración de su marca (menú, políticas).

Configuración heredable:
- Menú por defecto
- Políticas de cancelación
- Tono de voz para respuestas
- Políticas de alérgenos

Sucursal puede sobrescribir cualquiera.

**Cómo se verifica:**
```
1. Crear brand con menu_default_id
2. Crear branch con brand_id
3. GET /branches/:id → hereda menu_id de brand
4. PATCH /branches/:id para cambiar menu_id → sobrescribe
5. GET /branches/:id → nuevo menu_id
```

---

### CAD-3: API CRUD completa

**Criterio:** Endpoints POST, GET, PATCH funcionan según spec.

- **POST /brands** → 201, crea brand
- **GET /brands/:id** → 200, devuelve brand
- **PATCH /brands/:id** → 200, actualiza brand (name, logo, config)
- **GET /brands?tenantId=...** → 200, lista brands del tenant
- **GET /brands/:id sin permiso** → 403 Forbidden

**Cómo se verifica:** Tests de integración para cada endpoint.

---

### CAD-4: Evento BrandCreated publicado

**Criterio:** Cuando se crea un brand, se emite evento BrandCreated correctamente.

Evento debe tener:
```json
{
  "eventId": "uuid",
  "eventName": "BrandCreated",
  "aggregateId": "brand_id",
  "tenantId": "tenant_id",
  "timestamp": "ISO8601",
  "payload": {
    "brandId": "brand_id",
    "tenantId": "tenant_id",
    "name": "...",
    "slug": "..."
  }
}
```

**Cómo se verifica:** Event broker logs.

---

### CAD-5: Isolación por tenant

**Criterio:** Query de brand de tenant A nunca devuelve brands de tenant B.

Validaciones:
- Toda query filtra por tenant_id
- Intentos de acceso cruzado son bloqueados con 403
- AuditLog registra intentos

**Cómo se verifica:**
```
1. User A de tenant 1 intenta acceder a brand de tenant 2 → 403
2. DB query sin filtro tenant_id produce error
```

---

## User stories

```
Como gerente de cadena de restaurantes
Quiero crear una marca para cada concepto gastronómico
Para que cada sucursal tenga identidad clara

Criterios:
- Creo marca "La Parrilla"
- Asigno sucursales a esa marca
- La sucursal hereda menú de la marca
- Puedo cambiar menú por sucursal si quiero
```

```
Como dueño de tenant
Quiero que mis sucursales hereden configuración de marca
Para no duplicar configuración en cada sucursal

Criterios:
- Configuro políticas en brand
- Las sucursales las heredan automáticamente
- Puedo sobrescribir por sucursal
```

---

## Success metrics

- Tiempo de creación de brand: < 50ms
- Isolación verificada: 100% (no hay data leaks)
- API uptime: 99.9%
- Error rate: < 0.1%

---

## Next

Cuando SPEC-002 esté READY_FOR_IMPLEMENTATION, proceder a SPEC-003 (FiscalEntity) que depende de Brand.
