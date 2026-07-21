# Objetivo — SPEC-001

## Propósito

Un tenant es la entidad organizacional que compra Maitre. Define el límite principal de aislamiento de datos y permite que un cliente pueda tener múltiples marcas, entidades fiscales y sucursales bajo un único contrato.

Sin una definición clara de tenant, no hay isolación multi-tenant posible, lo que es crítico para seguridad y compliance.

## Resultado esperado

Cuando esta spec esté completa:

1. ✅ Un tenant se puede crear con email único, nombre, país y timezone
2. ✅ El tenant tiene estados válidos (ACTIVE, SUSPENDED, ARCHIVED) con transiciones claras
3. ✅ API CRUD completa: POST /tenants, GET /tenants/:id, PATCH /tenants/:id
4. ✅ Un evento TenantCreated se emite cuando se crea
5. ✅ Datos de tenant son aislados de otros tenants en base de datos
6. ✅ AuditLog registra cambios: quién, qué, cuándo, por qué

## Criterios de aceptación

### CAD-1: Tenant puede ser creado

**Criterio:** POST /tenants con email válido, name, country, timezone crea tenant correctamente.

Validaciones:
- Email único (no existen 2 tenants con mismo email)
- Email pasa validación RFC 5322
- Name: mínimo 3 caracteres, máximo 100
- Country: código ISO 3166-1 alpha-2 válido (AR, US, MX, etc)
- Timezone: IANA timezone válido (America/Argentina/Buenos_Aires, etc)
- Status inicia en ACTIVE
- Se genera UUID para id
- createdAt y updatedAt son ISO8601

**Cómo se verifica:**
```
POST /tenants
{
  "name": "Grupo Aguero",
  "email": "admin@grupoaguero.com",
  "country": "AR",
  "timezone": "America/Argentina/Buenos_Aires"
}

Response 201: tenant con id, status ACTIVE, timestamps
Verificar en BD: tenant_id = uuid, tenant_id en otros rows
```

---

### CAD-2: Tenant tiene estados válidos y transiciones claras

**Criterio:** Los únicos estados son ACTIVE, SUSPENDED, ARCHIVED. Las transiciones válidas son claras.

Transiciones:
- ACTIVE ↔ SUSPENDED (reversible)
- ACTIVE → ARCHIVED (irreversible)
- SUSPENDED → ARCHIVED (irreversible)

**Cómo se verifica:**
```
1. Crear tenant (ACTIVE)
2. PATCH para cambiar a SUSPENDED → éxito
3. PATCH para cambiar de vuelta a ACTIVE → éxito
4. PATCH para cambiar a ARCHIVED → éxito
5. PATCH para cambiar de ARCHIVED a ACTIVE → error 409 Conflict
6. PATCH con status inválido → error 400 Bad Request
```

---

### CAD-3: API CRUD completa

**Criterio:** Endpoints POST, GET, PATCH funcionan según spec.

- **POST /tenants** → 201, crea tenant
- **GET /tenants/:id** → 200, devuelve tenant
- **PATCH /tenants/:id** → 200, actualiza tenant (email, name, status)
- **GET /tenants/:id con unauthorized** → 401 Unauthorized
- **PATCH /tenants/:id sin permiso** → 403 Forbidden

**Cómo se verifica:** Tests de integración para cada endpoint.

---

### CAD-4: Evento TenantCreated publicado

**Criterio:** Cuando se crea un tenant, se emite evento TenantCreated correctamente.

Evento debe tener:
```json
{
  "eventId": "uuid",
  "eventName": "TenantCreated",
  "aggregateId": "tenant_id",
  "tenantId": "tenant_id",
  "timestamp": "ISO8601",
  "payload": {
    "name": "...",
    "email": "...",
    "country": "...",
    "timezone": "..."
  }
}
```

Consumidores (Identity, Billing) reciben el evento.

**Cómo se verifica:** Event broker logs, verify event queue.

---

### CAD-5: Isolación multi-tenant

**Criterio:** Query de tenant A nunca devuelve datos de tenant B.

Validaciones:
- Toda query filtra por tenant_id
- Endpoints reciben X-Tenant-Id header
- Intentos de acceso cruzado son bloqueados con 403
- AuditLog registra intentos

**Cómo se verifica:**
```
1. User A de tenant 1 intenta acceder a tenant 2 → 403
2. DB query sin filtro tenant_id produce error
3. Código review verifica tenant_id en cada SQL
```

---

### CAD-6: AuditLog registra cambios

**Criterio:** Cada cambio en tenant crea entrada en AuditLog.

Registro debe incluir:
- actor: userId
- action: "CREATE_TENANT" o "UPDATE_TENANT_STATUS"
- resource: "Tenant"
- resourceId: tenant_id
- oldValue: estado anterior
- newValue: estado nuevo
- timestamp
- reason: motivo del cambio (si aplica)

**Cómo se verifica:**
```
1. Crear tenant → AuditLog entry con action CREATE_TENANT
2. Cambiar status ACTIVE → SUSPENDED → AuditLog entry con reason
3. GET /audit/logs?resource=Tenant&resourceId=... devuelve historial
```

---

## User stories

```
Como Owner de restaurante
Quiero registrar mi negocio en Maitre
Para que pueda acceder a la plataforma

Criterios:
- Ingreso email, nombre, país, zona horaria
- Se crea mi tenant automáticamente
- Recibo confirmación por email
- Puedo ya comenzar a configurar
```

```
Como Admin de tenant
Quiero cambiar el estado de mi tenant a SUSPENDED
Para pausar operaciones sin perder datos

Criterios:
- Puedo cambiar ACTIVE → SUSPENDED
- Mis usuarios reciben notificación
- Mis datos se conservan
- Puedo volver a ACTIVE después
```

---

## Success metrics

- Tiempo de creación de tenant: < 100ms
- Isolación verificada: 100% (no hay data leaks)
- AuditLog completitud: 100% de cambios registrados
- Error rate: < 0.1% en endpoints de tenant

---

## Next step

Una vez esta spec está READY_FOR_IMPLEMENTATION, pasar a SPEC-002 (Brand) y SPEC-003 (FiscalEntity) que dependen de Tenant.
