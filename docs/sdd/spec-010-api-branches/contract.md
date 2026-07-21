# Contrato API — SPEC-010

## Alcance

Administrar sucursales dentro del tenant autenticado. Sigue SPEC-215 y usa rutas bajo
`/v1/branches`; el tenant nunca se recibe como autoridad desde body/query.

## Operaciones

| Operación | Resultado |
| --- | --- |
| `POST /v1/branches` | crea Branch `ACTIVE`; requiere brand y fiscal entity accesibles |
| `GET /v1/branches` | lista estable paginada, filtrable por brand/status |
| `GET /v1/branches/{branchId}` | devuelve Branch sin expandir agregados por defecto |
| `PATCH /v1/branches/{branchId}` | actualiza campos mutables con control de concurrencia |

No existe hard delete en este contrato. Desactivación usa `status: INACTIVE` y falla si
rompe una operación activa; el detalle de cierre pertenece a la spec operativa afectada.

## Crear

Entrada mínima: `brandId`, `fiscalEntityId`, `name`, `timezone`, dirección estructurada.
Opcionales: teléfono E.164 y metadata de contacto permitida. Se rechazan IDs de otro tenant,
timezone inválida, nombre vacío y cuota de sucursales agotada.

Respuesta `201` incluye recurso, `Location` y `ETag`. Reintentos usan `Idempotency-Key`;
misma clave con payload diferente devuelve conflicto.

## Consultar

- cursor opaco; límite acotado por SPEC-215;
- orden determinista por `createdAt,id`;
- filtros no revelan existencia cross-tenant;
- expansiones de salons/tables no se incluyen: usan SPEC-011/012.

## Actualizar

Campos mutables: `name`, dirección, teléfono, timezone y status permitido. IDs de tenant,
brand y fiscal entity no cambian silenciosamente. `If-Match` protege lost updates; versión
obsoleta devuelve `412`.

## Errores mínimos

`400` contrato inválido; `401` sin autenticación; `403` sin permiso; `404` inexistente o
fuera de scope; `409` unicidad/cuota/idempotencia; `412` versión; `422` regla de dominio.
Todos usan Problem Details de SPEC-215 y no filtran datos de otro tenant.

## Seguridad y auditoría

Autorización según SPEC-016. Crear/cambiar estado o datos fiscales genera auditoría con
actor, tenant, recurso, request/correlation ID y diff sanitizado. Ningún log copia dirección
o teléfono completos innecesariamente.

## Aceptación

- Casos positivos OWNER/ADMIN y lectura MANAGER según SPEC-016.
- Negativos cross-tenant indistinguibles de recurso inexistente.
- Cuota, idempotencia y concurrencia tienen tests.
- OpenAPI, ejemplos y errores coinciden con este contrato.
