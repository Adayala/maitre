# Estructura de directorios para specs

Cada spec vive en su propio directorio con múltiples documentos.

## Convención de nombres

```
/docs/sdd/[spec-type]-[spec-name]/
├── README.md (overview y quickstart)
├── structure.md (schema, campos, tipos)
├── rules.md (invariantes, reglas de negocio)
├── examples.md (ejemplos concretos en JSON)
├── [tipo-específico-1].md
├── [tipo-específico-2].md
└── [tipo-específico-n].md
```

---

## Tipos de specs y sus documentos

### Entity Spec: `spec-entity-[name]/`

**Propósito:** Define una entidad de dominio.

**Documentos:**

```
spec-entity-tenant/
├── README.md
├── structure.md (JSON schema de Tenant)
├── rules.md (invariantes: cada tenant es único, etc)
├── lifecycle.md (creación, estados, eliminación)
├── examples.md (ejemplos de Tenant en JSON)
└── relationships.md (Tenant → Brands, FiscalEntities, Branches)
```

**README.md:**
```markdown
# Tenant Entity

Entidad organizacional que compra Maitre y limita isolación de datos.

- **Type:** Entity
- **Domain:** Organization
- **Status:** PLANNED | DRAFT | READY FOR IMPLEMENTATION
- **Related specs:** spec-api-tenants, spec-event-tenant-created
```

---

### API Spec: `spec-api-[resource]/`

**Propósito:** Define contratos HTTP para un recurso.

**Documentos:**

```
spec-api-tenants/
├── README.md
├── post-create.md (POST /tenants)
├── get-fetch.md (GET /tenants/:id)
├── patch-update.md (PATCH /tenants/:id)
├── errors.md (qué puede fallar)
├── examples.md (ejemplos de request/response)
└── authorization.md (quién puede, qué entitlements)
```

**README.md:**
```markdown
# Tenants API

Contratos HTTP para gestionar tenants.

- **Resource:** /tenants
- **Domain:** Organization
- **Status:** PLANNED | DRAFT | READY FOR IMPLEMENTATION
- **Related specs:** spec-entity-tenant, spec-event-tenant-created
```

---

### Event Spec: `spec-event-[event-name]/`

**Propósito:** Define un evento que publica un dominio.

**Documentos:**

```
spec-event-tenant-created/
├── README.md
├── structure.md (schema del evento base)
├── payload.md (qué contiene el payload)
├── consumers.md (quién lo consume, qué hacen)
├── examples.md (ejemplo completo del evento en JSON)
└── timing.md (cuándo se publica, frecuencia)
```

**README.md:**
```markdown
# TenantCreated Event

Emitido cuando se crea un nuevo tenant.

- **Namespace:** maitre.organization
- **Domain:** Organization
- **Status:** PLANNED | DRAFT | READY FOR IMPLEMENTATION
- **Related specs:** spec-entity-tenant, spec-api-tenants
```

---

### State Machine Spec: `spec-state-machine-[entity]/`

**Propósito:** Define estados válidos y transiciones.

**Documentos:**

```
spec-state-machine-order/
├── README.md
├── states.md (lista de estados válidos)
├── transitions.md (transiciones, precondiciones, postcondiciones)
├── diagram.md (diagrama ASCII o Mermaid)
├── rules.md (reglas de transición)
└── examples.md (escenarios de transición)
```

**README.md:**
```markdown
# Order State Machine

Define ciclo de vida válido de una orden.

- **Entity:** Order
- **Domain:** Ordering
- **Status:** PLANNED | DRAFT | READY FOR IMPLEMENTATION
```

---

### RBAC Spec: `spec-rbac-[domain]/`

**Propósito:** Define quién puede hacer qué en un dominio.

**Documentos:**

```
spec-rbac-floor/
├── README.md
├── roles.md (qué roles existen)
├── permissions.md (qué permisos por rol)
├── matrix.md (matriz de Role × Action × Resource)
├── rules.md (reglas especiales)
└── examples.md (escenarios: WAITER abre visita, etc)
```

**README.md:**
```markdown
# Floor RBAC

Control de acceso en el dominio Floor.

- **Domain:** Floor
- **Status:** PLANNED | DRAFT | READY FOR IMPLEMENTATION
```

---

### Calculation Spec: `spec-calculation-[name]/`

**Propósito:** Define una fórmula, algoritmo, o cálculo de negocio.

**Documentos:**

```
spec-calculation-entitlements/
├── README.md
├── formula.md (la fórmula/algoritmo)
├── inputs.md (qué datos de entrada)
├── outputs.md (qué se calcula)
├── examples.md (ejemplos con números reales)
└── edge-cases.md (casos especiales)
```

**README.md:**
```markdown
# Entitlements Calculation

Cómo se derivan entitlements desde subscription items.

- **Type:** Calculation
- **Domain:** Subscription
- **Status:** PLANNED | DRAFT | READY FOR IMPLEMENTATION
```

---

### Connector Spec: `spec-connector-[provider]/`

**Propósito:** Define integración con un sistema externo.

**Documentos:**

```
spec-connector-gbp/
├── README.md
├── authentication.md (OAuth2, credenciales)
├── sync.md (protocolo de sincronización)
├── endpoints.md (qué endpoints del proveedor se usan)
├── mapping.md (cómo mapean los datos)
├── examples.md (flujos completos)
└── error-handling.md (qué puede fallar)
```

**README.md:**
```markdown
# Google Business Profile Connector

Integración con Google Business Profile para reputación.

- **Provider:** Google
- **Type:** Connector
- **Domain:** Reputation
- **Status:** PLANNED | DRAFT | READY FOR IMPLEMENTATION
```

---

### App Spec: `spec-app-[app-name]/`

**Propósito:** Define un flujo de usuario en una app.

**Documentos:**

```
spec-app-floor-take-order/
├── README.md
├── user-journey.md (pasos del usuario)
├── states.md (estados de la UI)
├── api-calls.md (qué endpoints llama)
├── offline-behavior.md (cómo funciona sin conectividad)
├── examples.md (screenshots, mockups)
└── error-scenarios.md (qué pasa si falla)
```

**README.md:**
```markdown
# Floor App — Take Order Flow

Flujo completo de tomar un pedido desde la tablet del mozo.

- **App:** Maitre Floor
- **Type:** App Flow
- **Status:** PLANNED | DRAFT | READY FOR IMPLEMENTATION
```

---

### Transversal Spec: `spec-transversal-[name]/`

**Propósito:** Define patrones o reglas que aplican a todo.

**Documentos:**

```
spec-transversal-multi-tenancy/
├── README.md
├── principles.md (qué significa multi-tenancy en Maitre)
├── data-isolation.md (cómo se aíslan datos)
├── propagation.md (cómo se propagan tenant IDs)
├── testing.md (cómo se testea)
└── examples.md (flujos multi-tenant)
```

**README.md:**
```markdown
# Multi-tenancy

Principios y patrones de aislamiento de datos.

- **Type:** Transversal
- **Applies to:** Todas las fases
- **Status:** PLANNED | DRAFT | READY FOR IMPLEMENTATION
```

---

## Ejemplo completo: Tenant

```
/docs/sdd/
├── spec-entity-tenant/
│   ├── README.md (50 líneas)
│   ├── structure.md (JSON schema)
│   ├── rules.md (3-5 invariantes)
│   ├── lifecycle.md (creación, estados)
│   ├── examples.md (3 ejemplos JSON)
│   └── relationships.md (cómo se relaciona con otros)
│
├── spec-api-tenants/
│   ├── README.md
│   ├── post-create.md (POST /tenants)
│   ├── get-fetch.md (GET /tenants/:id)
│   ├── patch-update.md (PATCH /tenants/:id)
│   ├── errors.md (400, 401, 403, 404, 409)
│   ├── examples.md (request/response JSON)
│   └── authorization.md (OWNER, ADMIN)
│
├── spec-event-tenant-created/
│   ├── README.md
│   ├── structure.md (schema base)
│   ├── payload.md (qué contiene)
│   ├── consumers.md (Identity, Billing, Analytics)
│   └── examples.md (evento completo)
│
├── spec-rbac-organization/
│   ├── README.md
│   ├── roles.md (OWNER, ADMIN, MANAGER)
│   ├── permissions.md (crear tenant, editar tenant)
│   ├── matrix.md (quién puede qué)
│   └── examples.md (escenarios)
│
└── spec-calculation-entitlements/
    ├── README.md
    ├── formula.md (cómo se calculan)
    ├── inputs.md (subscription items)
    ├── outputs.md (TENANT.ACCESS, BRANCHES.MAX)
    └── examples.md (ejemplos numéricos)
```

Total: 5 specs × 5-7 documentos cada una = 25-35 .md para una entidad (Tenant).

---

## Ventajas de esta estructura

✅ **Autocontendida:** Cada spec es independiente, se puede entender sin saltar a otro directorio.

✅ **Escalable:** Agregar un nuevo documento a una spec no afecta a otras.

✅ **Navegable:** `ls spec-entity-order/` te muestra todos los documentos sobre Order.

✅ **Vincular:** Links internos: `../spec-api-orders/post-create.md`.

✅ **CI/CD ready:** Se puede validar cada spec por separado.

---

## Índice maestro

Archivo `/docs/sdd/INDEX.md` lista todas las specs:

```markdown
# Specifications Index

## Fase 1: Plataforma Fundacional

### Organization
- [spec-entity-tenant](spec-entity-tenant/)
- [spec-entity-brand](spec-entity-brand/)
- [spec-api-tenants](spec-api-tenants/)
- [spec-api-branches](spec-api-branches/)
- [spec-event-tenant-created](spec-event-tenant-created/)
- [spec-rbac-organization](spec-rbac-organization/)

### Identity
- [spec-entity-user](spec-entity-user/)
- [spec-api-users](spec-api-users/)
- [spec-api-auth](spec-api-auth/)
- [spec-event-user-invited](spec-event-user-invited/)
- [spec-rbac-identity](spec-rbac-identity/)

### Subscription
- [spec-entity-subscription](spec-entity-subscription/)
- [spec-api-subscriptions](spec-api-subscriptions/)
- [spec-calculation-entitlements](spec-calculation-entitlements/)
- [spec-event-service-activated](spec-event-service-activated/)

## Fase 2: Operación Mínima
...
```

---

## Cómo empezar a escribir una spec

```bash
# 1. Crear directorio
mkdir -p /docs/sdd/spec-entity-order

# 2. Crear README.md con propósito y links relacionados
echo "# Order Entity" > /docs/sdd/spec-entity-order/README.md

# 3. Crear documentos específicos
touch /docs/sdd/spec-entity-order/structure.md
touch /docs/sdd/spec-entity-order/rules.md
touch /docs/sdd/spec-entity-order/examples.md

# 4. Escribir cada documento

# 5. Link en INDEX.md
```

