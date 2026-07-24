# Contrato de jerarquía organizacional — SPEC-001/002/004

## Vocabulario autoritativo

| Concepto | Significado | Ejemplo |
| --- | --- | --- |
| `Tenant` | cliente u organización contratante de Maitre; frontera primaria de aislamiento | Grupo Gastronómico Pérez |
| `Brand` | marca comercial administrada por ese cliente | La Parolaccia |
| `Branch` | sucursal o unidad operativa de una marca | Palermo |

La relación canónica es:

```text
Tenant (cliente)
└── Brand (marca)
    └── Branch (sucursal)
        └── Salon
            └── Table
```

FiscalEntity es una entidad legal/fiscal del Tenant y puede ser referenciada por Branch; no forma un
nivel comercial entre Brand y Branch.

## Cardinalidad

- Un Tenant posee cero o más Brands.
- Una Brand pertenece exactamente a un Tenant.
- Una Brand posee cero o más Branches.
- Una Branch pertenece exactamente a un Tenant y exactamente a una Brand de ese mismo Tenant.
- Un Tenant puede operar varias Brands y cada Brand varias Branches.
- En I0 no existe Branch sin Brand ni Brand compartida entre Tenants.

La ausencia temporal de Brands/Branches durante onboarding no invalida al Tenant; indica que su setup
operativo todavía no está completo.

## Identidad y aislamiento

`tenantId` responde “¿a qué cliente pertenecen estos datos?” y es la frontera obligatoria de
aislamiento. `brandId` y `branchId` refinan el contexto comercial y operativo, pero nunca sustituyen
`tenantId`.

Todo recurso branch-scoped conserva `tenantId`, `branchId` y coherencia verificable con la Branch y
su Brand. Conocer un `branchId` no autoriza acceso ni permite inferir tenant context.

## Reglas de pertenencia

1. `tenantId` de Brand y Branch es inmutable.
2. La Brand referenciada por Branch pertenece al mismo Tenant.
3. Persistencia y aplicación impiden relaciones cross-tenant aunque los UUID sean válidos.
4. Archivar Tenant, Brand o Branch conserva historia; no borra descendientes en cascada.
5. Reasignar Branch a otra Brand sólo ocurre dentro del mismo Tenant mediante workflow explícito,
   auditoría y validación de impactos.
6. Transferir Brand o Branch entre Tenants no es una actualización ordinaria.

## Transferencias entre clientes

Una transferencia cross-tenant, si alguna vez se admite, es una migración organizacional separada.
Debe especificar autoridad contractual/fiscal, recursos, memberships, suscripción, referencias
históricas, objetos, integraciones, secretos, privacidad, ventana, rollback y reconciliación.

Hasta aprobar ese workflow, la operación está prohibida.

## Autorización y memberships

Membership vincula User con Tenant. Su scope puede limitar operaciones a una o más Branches del
mismo Tenant. Una asignación branch-scoped no crea otro Tenant, no habilita otras Branches y sigue
requiriendo permissions.

Los roles comerciales llamados `OWNER` o `ADMIN` no cambian la jerarquía ni sustituyen verificaciones
de tenant/branch.

## Suscripción y configuración

Subscription/Entitlement pertenecen al dominio comercial, normalmente con autoridad del Tenant y
scope más específico cuando el contrato lo permita. Tenant, Brand y Branch no duplican plan,
credenciales o flags de servicio.

La precedencia de defaults/overrides debe ser tipada y documentada. La existencia de Brand o Branch
no autoriza herencia genérica de JSON.

## Lenguaje de producto

En UI se puede mostrar “Cliente”, “Marca” y “Sucursal”. En contratos técnicos se conservan `Tenant`,
`Brand` y `Branch`.

No usar:

- “Brand” como sinónimo de cliente;
- “Branch” como tenant independiente;
- “Tenant” como usuario, suscripción o entidad fiscal;
- “sucursal” para un salón o una mesa.

## Criterios de aceptación documental

- SPEC-001 define Tenant como cliente/frontera de aislamiento.
- SPEC-002 define Brand como identidad comercial del Tenant.
- SPEC-004 define Branch como sucursal de una Brand del mismo Tenant.
- APIs, eventos y RBAC conservan `tenantId` y validan alcance por sucursal.
- Ningún contrato permite transferencias cross-tenant mediante CRUD/PATCH ordinario.
