# Contrato de dominio — SPEC-006

## Definición

Table es la configuración estable de una mesa física dentro de un Salon. Su estado
operativo se deriva de visitas, ocupaciones, reservas, limpieza y bloqueos; no forma parte
de la entidad configurable ni se actualiza como un campo CRUD.

## Identidad y configuración

- `id`, `tenantId`, `branchId`, `salonId`: UUID; pertenencia inmutable.
- `number`: 1–16 caracteres, trim/NFC, único case-insensitive por salón.
- `name`: etiqueta opcional de hasta 80 caracteres.
- `capacity`: entero 1–20.
- `shape`: `ROUND | RECTANGULAR | SQUARE | IRREGULAR` opcional.
- `zone`: etiqueta opcional normalizada.
- `features`: wheelchair accessible, outdoors y otros flags versionados.
- `layout`: posición/rotación opcional para UI, sin semántica de autorización.
- `status`: configuración `ACTIVE | INACTIVE`; no confundir con estado operativo.
- `version` y timestamps/actores de auditoría.

## Estado operativo derivado

SPEC-051/057 define la proyección. Precedencia mínima ante señales simultáneas:

```text
BLOCKED > OCCUPIED/PAYING > CLEANING > RESERVED > AVAILABLE
```

La proyección incluye `asOf`/versión y puede quedar stale; una mutación operativa vuelve a
validar invariantes contra la fuente autoritativa.

## Invariantes

1. Tenant/branch/salon son coherentes.
2. Número normalizado es único por Salon.
3. Capacidad total respeta `Salon.maxCapacity`.
4. No se reduce capacidad por debajo de huéspedes/asignaciones activas.
5. No se mueve una mesa de Salon mediante update común.
6. `INACTIVE` impide nuevas reservas/visitas y requiere ausencia de operación activa.
7. Layout, nombre o features nunca cambian tenancy, permisos ni estado operativo.

## Aceptación

- Tests positivos/negativos multi-tenant y de unicidad.
- Rechazo de writes que intentan establecer estado derivado.
- Conflictos de capacidad, ocupación y versión son deterministas.
- Proyección converge ante señales duplicadas/desordenadas según SPEC-223.
- Auditoría conserva cambios de configuración y estado administrativo.
