# Contrato API — SPEC-074

`GET /v1/branches/{id}/availability` consulta `partySize`, `startAt` y `durationMinutes`,
devolviendo `asOf`, `timezone`, `freshness`, `available` y `freeTableIds`. Es una query, no
reserva ni garantía; confirmar vuelve a validar. El I0 actual calcula live sobre
salons/tables/occupancies/reservations sin versión de policy, sin capability pública y sin
slots/range elaborados. Tests cubren respuesta básica y permisos; DST, boundaries,
desactualización, concurrency y determinismo fino siguen diferidos.

La capacidad declarada de un salón no crea inventario virtual. Si la sucursal no tiene mesas,
la consulta responde `available: false` aunque el salón declare capacidad positiva.
