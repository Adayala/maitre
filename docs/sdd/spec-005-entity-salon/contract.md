# Contrato de dominio — SPEC-005

## Definición

Salon es un área física configurable dentro de una Branch. Agrupa mesas para navegación,
layout, capacidad administrativa y scopes operativos. No es una unidad de tenancy ni
almacena ocupación, disponibilidad o reservas.

## Identidad y campos

- `id`: UUID inmutable.
- `tenantId`, `branchId`: autoridad de pertenencia, inmutables.
- `name`: 1–80 caracteres, trim/NFC, único case-insensitive por branch.
- `description`: opcional, máximo 500 caracteres.
- `maxCapacity`: entero positivo y límite administrativo.
- `status`: `ACTIVE | INACTIVE`.
- `version`, `createdAt/By`, `updatedAt/By`: concurrencia y auditoría.

## Invariantes

1. Tenant de Salon coincide con Tenant de Branch.
2. Nombre normalizado es único dentro de Branch, no globalmente.
3. `maxCapacity` no es la suma automática de Table; expresa el límite operativo autorizado.
4. Capacidad configurada de mesas y ocupación activa no superan `maxCapacity`.
5. Un Salon inactivo no admite nuevas mesas, visitas o reservas.
6. Inactivar no borra mesas ni historia y requiere ausencia de operación activa.
7. Cambiar Branch no es una actualización: necesita workflow futuro con validación/migración.

## Lifecycle

```text
ACTIVE → INACTIVE
INACTIVE → ACTIVE
```

Reactivación vuelve a validar Branch, cuota y conflictos de nombre. No existe hard delete
para un salón referenciado.

## Relaciones

Branch posee 0..N Salons; Salon posee 0..N Tables. Visit/Reservation referencian mesas y
derivan Salon/Branch, pero no modifican este agregado directamente.

## Aceptación

- Aislamiento tenant y coherencia branch comprobados.
- Unicidad normalizada y concurrencia optimista probadas.
- Límites de capacidad cubren create/update/operación activa.
- Inactivación preserva historia y bloquea nuevas asignaciones.
- Auditoría registra actor, motivo y diff sin datos sensibles.
