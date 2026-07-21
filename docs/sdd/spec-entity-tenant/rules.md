# Tenant Rules

## Invariantes

### 1. Email único por Maitre

**Regla:** No pueden existir dos tenants con el mismo email.

**Validación:** En el backend, al crear tenant, verificar que email no existe.

**Implicación:** Si un usuario fue owner de un tenant baja, ese email se libera para usarse en otro tenant.

---

### 2. Tenant no puede existir sin usuario owner

**Regla:** Todo tenant tiene al menos un usuario con rol OWNER.

**Validación:** Al crear tenant:
1. Se crea automáticamente usuario OWNER inicial
2. No se puede eliminar el último OWNER

**Implicación:** Un tenant siempre es "responsable" por alguien.

---

### 3. Status transiciones válidas

**Regla:** 
```
ACTIVE → SUSPENDED ✅
SUSPENDED → ACTIVE ✅
ACTIVE → ARCHIVED ✅
SUSPENDED → ARCHIVED ✅
Cualquier otra combinación ❌
```

**Validación:** En endpoint PATCH /tenants/:id, validar transición.

**Implicación:** Una vez ARCHIVED, no hay vuelta atrás.

---

### 4. Datos de tenant ARCHIVED en read-only

**Regla:** Si tenant.status = ARCHIVED:
- No se pueden crear branches nuevas
- No se pueden crear users nuevas
- No se pueden cambiar configuraciones
- Sí se pueden leer todos los datos

**Validación:** En cada operación que modifique, chequear status != ARCHIVED.

**Implicación:** El historial operativo se preserva.

---

### 5. Timezone debe ser válido IANA

**Regla:** El campo timezone debe corresponder a una zona IANA válida.

**Validación:** Al crear/actualizar, verificar contra lista de IANA timezones.

**Implicación:** Los reportes y jornadas se calculan en la zona correcta.

---

### 6. Country debe ser ISO 3166-1 alpha-2

**Regla:** El campo country debe ser un código país válido (ej: AR, US, MX).

**Validación:** Al crear/actualizar, verificar contra lista ISO.

**Implicación:** Allows localization: moneda, impuestos, regulaciones por país.

---

### 7. Tenant aislado de otros tenants

**Regla:** Los datos de tenant A nunca se acceden desde tenant B.

**Validación:** Toda query en base de datos debe filtrar por tenant_id.

**Implicación:** Seguridad de datos, compliance.

---

## Reglas de cambio

### Cambiar email

**Precondición:** El nuevo email no debe existir en Maitre.

**Acción:** 
1. Validar email
2. Verificar unicidad
3. Actualizar tenant.email
4. Registrar en AuditLog

**Postcondición:** Email actualizado, users del tenant reciben notificación.

---

### Suspender tenant

**Precondición:** status = ACTIVE

**Acción:**
1. Cambiar status a SUSPENDED
2. Registrar lastSuspendedAt, lastSuspendedBy, suspensionReason
3. Enviar email a owners
4. Registrar en AuditLog

**Postcondición:** 
- Tenant en SUSPENDED
- Usuarios aún pueden ver datos, pero no modificar
- Suscripción entra en estado SUSPENDED

---

### Archivar tenant

**Precondición:** status = ACTIVE O status = SUSPENDED

**Acción:**
1. Cambiar status a ARCHIVED
2. Registrar archivedAt, archivedBy
3. Pasar datos operacionales a histórico (si aplica)
4. Registrar en AuditLog

**Postcondición:**
- Tenant en ARCHIVED (read-only)
- No se pueden hacer cambios operacionales
- Suscripción entra en estado CANCELLED
- Datos se conservan indefinidamente (compliance)

---

## Reglas de negocio

### Crear tenant

Requiere:
- Email válido y único
- Name (3-100 chars)
- Country (ISO code)
- Timezone (IANA timezone)

Opcional:
- Metadata (logo_url, website, phone, notes)

Resultado:
- Tenant creado con status ACTIVE
- Usuario OWNER creado automáticamente
- Suscripción DRAFT creada
- Evento TenantCreated publicado

---

### Tenants multipaís (futuro)

**Nota:** La arquitectura permite que Maitre sea país-agnóstico (country = variable).

Pero por ahora, cada tenant es de un solo país. En el futuro, podría haber:
- Múltiples países por tenant (array de countries)
- Reglas de impuestos por país
- Monedas locales
