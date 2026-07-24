# Contrato API — SPEC-011

## Alcance

Administrar salones de una sucursal accesible mediante rutas
`/v1/branches/{branchId}/salons`. Un salón organiza mesas; no representa ocupación ni
disponibilidad operativa.

## Operaciones

| Operación | Resultado |
| --- | --- |
| `POST /v1/branches/{branchId}/salons` | crea salón activo |
| `GET /v1/branches/{branchId}/salons` | lista salones de la sucursal |
| `GET /v1/salons/{salonId}` | detalle del salón |
| `PATCH /v1/salons/{salonId}` | modifica nombre, descripción, capacidad o status |

No hay eliminación física. `INACTIVE` impide nuevas asignaciones pero conserva referencias.

## Contrato de datos

Entrada de creación: `name` (normalizado, único case-insensitive dentro de la sucursal),
`maxCapacity` entero positivo y `description` opcional acotada. Tenant/branch se resuelven
desde path/contexto autorizado.

`maxCapacity` es un límite administrativo; no se recalcula desde las mesas. Reducirlo por
debajo de la capacidad configurada/ocupada requiere corrección previa y devuelve `422`.

## Lectura y concurrencia

La lista tiene cursor/orden determinista y no expande mesas. El detalle puede incluir
conteos resumidos, nunca estado operativo mutable como autoridad. PATCH requiere `If-Match`
y devuelve nuevo `ETag`.

## Errores y seguridad

Usa Problem Details de SPEC-215. `404` cubre salón/sucursal inexistente o cross-tenant;
`409` nombre duplicado; `412` versión; `422` capacidad/status incompatible. Permisos según
SPEC-016 y auditoría para create/update/status.

## Aceptación

- Un ID de branch de otro tenant nunca crea ni lista salones.
- Un nombre normalizado duplicado falla de forma determinista.
- No se inactiva con ocupación/operación activa.
- Paginación, concurrencia, auditoría y OpenAPI poseen pruebas.
