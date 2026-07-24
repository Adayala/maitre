# Especificación — SPEC-001

## 1. Definición

Tenant es una organización cliente de Maitre y la raíz de aislamiento de sus datos. No representa una suscripción ni una cuenta de autenticación.

## 2. Contrato de dominio

```ts
type TenantStatus = 'ACTIVE' | 'SUSPENDED' | 'ARCHIVED';

type Tenant = {
  id: string;
  name: string;
  status: TenantStatus;
  defaultLocale: string;
  defaultCurrency: string;
  defaultTimezone: string;
  contactEmail?: string;
  contactPhone?: string;
  createdAt: Date;
  createdBy?: string;
  updatedAt: Date;
  updatedBy?: string;
};
```

`createdBy` y `updatedBy` identifican un User cuando existe. Durante bootstrap o automatizaciones autorizadas pueden ser nulos y el audit context registra actor `SYSTEM` y correlation ID.

## 3. Campos

| Campo | Restricción |
| --- | --- |
| `id` | UUID inmutable, generado por servidor |
| `name` | trim, 1–120 caracteres |
| `status` | `ACTIVE`, `SUSPENDED` o `ARCHIVED` |
| `defaultLocale` | locale BCP 47 soportado |
| `defaultCurrency` | ISO 4217 soportado |
| `defaultTimezone` | identificador IANA soportado |
| `contactEmail` | email normalizado opcional; no es identidad ni clave única |
| `contactPhone` | E.164 opcional |
| timestamps | UTC con timezone, asignados por servidor |

La configuración futura debe introducir campos tipados y versionados. No se agrega un JSON `config` genérico como escape hatch en I0.

## 4. Estados y transiciones

```text
ACTIVE <-> SUSPENDED
ACTIVE  -> ARCHIVED
SUSPENDED -> ARCHIVED
```

- `ACTIVE`: admite operaciones sujetas a Membership, RBAC y entitlements.
- `SUSPENDED`: bloquea comandos operativos; las lecturas administrativas explícitas dependen de política.
- `ARCHIVED`: terminal y de sólo lectura salvo procesos de retención/exportación autorizados.

El estado comercial `TRIALING`, expiraciones y cancelaciones pertenecen a Subscription. Un cambio comercial puede solicitar una transición organizacional mediante un caso de uso, pero no modifica Tenant por acceso directo a tablas.

## 5. Aislamiento

Toda entidad con alcance tenant contiene `tenantId`; repositories y casos de uso lo reciben explícitamente. Los identificadores de recurso no sustituyen el contexto tenant. La defensa combina:

- autorización de aplicación basada en Membership y alcance por sucursal;
- predicates con alcance tenant en repositories;
- RLS de PostgreSQL cuando el spike de SPEC-226 demuestre el patrón;
- tests negativos entre Tenant A y Tenant B.

Tablas globales, como User, deben documentar expresamente por qué no contienen `tenant_id`.

## 6. Capacidades delegadas

Tenant no persiste:

- plan, precio, trial o vencimiento;
- máximos de recursos o uso actual;
- features habilitadas;
- estado de pago;
- roles o usuarios embebidos.

Subscription/Entitlement son la fuente autoritativa de capacidades. Membership/RoleAssignment son la fuente autoritativa de acceso humano.

## 7. Provisioning

Crear una organización es un workflow orquestado, autenticado e idempotente; no un endpoint público de CRUD genérico. El workflow puede crear Tenant, Membership OWNER inicial y Subscription inicial mediante pasos independientes, claves de idempotencia y compensación/reintento.

`TenantCreated` se registra en el outbox dentro de la transacción de Tenant. Los consumidores no asumen que Membership o Subscription ya estén disponibles salvo que el evento/versionado lo garantice.

## 8. Contratos y persistencia

La API representa campos en camelCase. PostgreSQL usa snake_case (`default_timezone`, `created_at`) y el repository realiza el mapping. Los timestamps se almacenan como `timestamptz` y se serializan ISO 8601 en UTC.
