# Propuestas de resolución del esquema I0 — SPEC-210

## Uso

Este documento propone resolver los conflictos registrados en
[`i0-physical-dictionary.md`](i0-physical-dictionary.md). Las propuestas se convierten en decisión
normativa únicamente cuando owner y reviewer de la spec fuente registren su aprobación. Hasta
entonces conservan estado `PROPOSED` y bloquean el DDL indicado.

Cada decisión debe cerrarse actualizando también `contract.md`, `specification.md`, `structure.md`,
tests de contrato y este registro. No se acepta cerrar sólo modificando una migración.

## Resumen

| ID | Recomendación | Estado |
| --- | --- | --- |
| OPEN-001 | Tenant usa display name y lifecycle `PROVISIONING/ACTIVE/SUSPENDED/CLOSED` | PROPOSED |
| OPEN-002 | Brand separa configuración visual/contacto; menú y políticas quedan fuera | PROPOSED |
| OPEN-003 | FiscalEntity usa `ACTIVE/INACTIVE/ARCHIVED`; certificados son otro agregado | PROPOSED |
| OPEN-004 | Branch usa `ACTIVE/INACTIVE`; no posee archive independiente en I0 | PROPOSED |
| OPEN-005 | Salon persiste `max_capacity`, no capacidad derivada | PROPOSED |
| OPEN-006 | Table se persiste como `dining_tables` sin estado operativo | PROPOSED |
| OPEN-017 | User usa `ACTIVE/DISABLED/DELETED` y timestamps homónimos | PROPOSED |
| OPEN-018 | Role es catálogo global persistido y versionado | PROPOSED |
| OPEN-019 | Permission es catálogo global con sensibilidad `NORMAL/SENSITIVE/CRITICAL` | PROPOSED |
| OPEN-020 | Membership admite una fila no revocada por tenant/user | PROPOSED |

## OPEN-001 — identidad y lifecycle de Tenant

### Recomendación

- reemplazar el ambiguo `name` por `display_name varchar(120)`;
- la razón social pertenece a FiscalEntity, no a Tenant;
- estados: `PROVISIONING`, `ACTIVE`, `SUSPENDED`, `CLOSED`;
- `CLOSED` es terminal y reemplaza `ARCHIVED`;
- `closed_at` y motivo auditado son obligatorios al cerrar;
- `PROVISIONING` permite una creación idempotente sin exponer un Tenant incompleto como activo.

### Motivo

Tenant es límite SaaS, no sujeto fiscal. El provisioning puede fallar entre la creación del root,
el primer owner y los defaults; modelarlo evita interpretar ausencia parcial como estado válido.
`CLOSED` expresa terminación del servicio, mientras la retención de datos vive en SPEC-220.

### Alternativa descartada

`ACTIVE/SUSPENDED/ARCHIVED` no distingue construcción inicial de disponibilidad y confunde archivo
organizacional con política de retención.

### Aceptación

- provisioning repetido converge al mismo Tenant;
- sólo `ACTIVE` admite operación normal;
- suspensión es reversible y cierre no;
- cierre no ejecuta hard delete ni pierde trazabilidad.

## OPEN-002 — configuración de Brand

### Recomendación

- conservar columnas propias para `name`, `slug`, descripción y URIs;
- permitir `visual_config jsonb` y `contact_config jsonb`, cada una con `schema_version` y JSON Schema
  versionado en código;
- no persistir `default_menu_id` hasta que Catalog defina ownership y herencia;
- no guardar cancelaciones, alérgenos, currency o reglas operativas dentro de Brand;
- `ACTIVE/INACTIVE/ARCHIVED` se conserva porque el contrato especializado ya distingue historia.

### Motivo

Separar configuraciones reduce el “cajón de sastre” JSONB y mantiene consultas/invariantes de otros
dominios en tablas propias. Las URIs no otorgan ownership sobre el objeto almacenado.

### Aceptación

- JSON desconocido o con versión no soportada falla cerrado;
- config no altera tenant, autorización ni lifecycle;
- Menu puede evolucionar sin FK circular en la migración I0.

## OPEN-003 — lifecycle y certificados de FiscalEntity

### Recomendación

- estados: `ACTIVE`, `INACTIVE`, `ARCHIVED`;
- `INACTIVE` impide nuevas emisiones pero admite correcciones/consultas permitidas;
- `ARCHIVED` es terminal para configuración nueva y preserva comprobantes históricos;
- certificados y claves pertenecen a SPEC-140 y nunca son columnas de `fiscal_entities`;
- `certificate_id`, `certificate_key_encrypted` y `arca_authorized_at` se eliminan del structure de
  SPEC-003;
- la vigencia fiscal propia usa `valid_from/valid_to` y no sustituye vigencia de certificados.

### Motivo

La identidad legal y una credencial ARCA tienen lifecycles, sensibilidad y rotación diferentes.
Mantenerlas juntas impediría least privilege y complicaría historial fiscal.

### Aceptación

- ninguna clave privada aparece en dumps generales de la entidad;
- Branch sólo selecciona una FiscalEntity compatible y activa para nueva operación;
- archivar no reescribe invoices emitidas.

## OPEN-004 — lifecycle de Branch

### Recomendación

- estados I0: `ACTIVE`, `INACTIVE`;
- no agregar `ARCHIVED` hasta que un workflow de cierre de Branch defina operación pendiente,
  retención y reapertura;
- una Branch inactiva conserva identidad y relaciones, pero bloquea nuevas operaciones;
- la eliminación física permanece prohibida cuando exista historia.

### Motivo

La spec especializada sólo define activación reversible. Inventar `ARCHIVED` en persistencia crea
una transición sin comando, permisos ni tratamiento de datos asociados.

### Aceptación

- transición simétrica ACTIVE↔INACTIVE;
- inactivación valida ausencia o resolución de operación activa;
- RLS no usa status como sustituto de tenant isolation.

## OPEN-005 — capacidad de Salon

### Recomendación

- persistir `max_capacity integer NOT NULL CHECK (max_capacity > 0)`;
- no persistir `capacity` derivada;
- sumar capacidades de mesas sólo para validar que no superen el máximo;
- cambios concurrentes de Salon/Table se serializan o verifican con versión dentro de una unidad
  de trabajo.

### Motivo

El límite administrativo y la suma actual son conceptos distintos. Una columna `capacity` ambigua
puede quedar desincronizada o aplicar reglas incorrectas.

### Aceptación

- una mesa nueva no puede superar el máximo;
- reducir el máximo falla si la configuración/operación vigente lo excede;
- ausencia de mesas no cambia automáticamente `max_capacity`.

## OPEN-006 — representación física de Table

### Recomendación

- usar `maitre.dining_tables` para evitar ambigüedad con el término SQL “table”;
- conservar `tenant_id`, `branch_id` y `salon_id` con FK compuesta de tres columnas;
- guardar sólo estado administrativo `ACTIVE/INACTIVE`;
- estado operativo pertenece a la proyección de SPEC-051/057;
- `features` y `layout` requieren schema versionado, límites de tamaño y claves permitidas.

### Motivo

Separar configuración estable de ocupación/reserva evita writes contradictorios y permite reconstruir
la proyección operacional.

### Aceptación

- no existe columna `operational_status` en I0;
- no se puede asociar una mesa a Salon y Branch incompatibles;
- número normalizado es único dentro del Salon.

## OPEN-017 — lifecycle de User

### Recomendación

- estados: `ACTIVE`, `DISABLED`, `DELETED`;
- `DISABLED` es reversible, deniega nuevas sesiones y usa `disabled_at`;
- `DELETED` es terminal, usa `deleted_at` e inicia anonymization según SPEC-219/220;
- no usar simultáneamente `SUSPENDED/DEACTIVATED`, reservados para Membership/Tenant;
- reactivar User no reactiva automáticamente memberships suspendidas o revocadas.

### Motivo

Los nombres elegidos coinciden con el contrato especializado y distinguen bloqueo global reversible
de eliminación lógica. Reducir vocabularios evita mappings silenciosos entre dominio y base.

### Aceptación

- User DISABLED no obtiene contexto aunque Membership esté ACTIVE;
- User DELETED no se reactiva;
- email/PII se minimiza sin romper referencias auditables permitidas;
- la revocación de sesiones tiene evidencia en SPEC-023.

## OPEN-018 — persistencia de Role

### Recomendación

- Role es catálogo global, no contiene `tenant_id`;
- persistirlo con seed idempotente y versionado aunque su definición nazca en código;
- estados `ACTIVE/DEPRECATED`; no borrar códigos usados históricamente;
- Membership referencia `role_code`, nunca un nombre visible ni claims del proveedor;
- no usar wildcard `*`; OWNER recibe permisos atómicos explícitos;
- modelar `assignableBy` en una matriz normativa antes de crear una tabla adicional.

### Motivo

Sólo hardcodear impide integridad referencial y auditoría del snapshot efectivo. CRUD dinámico, en
cambio, permitiría modificar autorización sin release. Catálogo por código + seed conserva ambas
propiedades deseadas.

### Aceptación

- código y seed contienen exactamente el mismo catálogo;
- seed repetido no duplica ni resucita roles deprecated;
- una referencia desconocida falla por FK y por autorización deny-by-default.

## OPEN-019 — persistencia y sensibilidad de Permission

### Recomendación

- Permission es catálogo global persistido mediante seed idempotente;
- sensibilidad: `NORMAL`, `SENSITIVE`, `CRITICAL`;
- `SENSITIVE` exige auditoría del resultado; `CRITICAL` además exige política reforzada/segregación
  definida por la spec consumidora;
- retiro mediante `DEPRECATED` + `successor_code`, sin rename ni delete;
- prohibir wildcards persistidos y permisos desconocidos.

### Motivo

La sensibilidad necesita una clasificación estable consumible por auditoría y tests. Tres niveles
son suficientes para I0 sin introducir un motor de políticas genérico.

### Aceptación

- todo código cumple `resource.action`;
- successor existe, es distinto y no forma ciclos;
- endpoints sensibles trazan a un permiso del catálogo.

## OPEN-020 — unicidad y reinvitación de Membership

### Recomendación

- considerar `INVITED`, `ACTIVE` y `SUSPENDED` como relación no terminal;
- permitir como máximo una fila con `status <> 'REVOKED'` por `(tenant_id, user_id)` mediante índice
  unique parcial;
- conservar Memberships `REVOKED` para historia;
- reinvitar reutiliza la fila `INVITED` idempotentemente, reactiva mediante workflow una `SUSPENDED`
  o crea una nueva fila si todas las anteriores están `REVOKED`;
- nunca reactivar una fila `REVOKED`;
- cambios de roles/scopes permanecen transaccionales con la Membership efectiva.

### Motivo

`UNIQUE (tenant_id, user_id)` permanente impide preservar ciclos de relación. Permitir más de una
fila no revocada genera autorización ambigua y carreras de aceptación.

### Aceptación

- dos invitaciones concurrentes convergen en una Membership no revocada;
- resolver contexto devuelve a lo sumo una Membership efectiva por tenant/user;
- historia revocada no concede acceso ni bloquea una invitación futura;
- el último OWNER sigue protegido bajo concurrencia.

## Sign-off requerido

| Bloque | Owner | Reviewer | Evidencia | Resultado |
| --- | --- | --- | --- | --- |
| OPEN-001–006 Organization | UNASSIGNED | UNASSIGNED | specs y tests de contrato actualizados | PENDING |
| OPEN-017–020 Identity/RBAC | UNASSIGNED | UNASSIGNED | specs, matrices y tests actualizados | PENDING |
| Revisión Security/RLS | UNASSIGNED | UNASSIGNED | threat model + SPK-04 | PENDING |
| Revisión Data/Migrations | UNASSIGNED | UNASSIGNED | plan de migración + SPK-02/06 | PENDING |

