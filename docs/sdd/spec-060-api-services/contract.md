# Contrato API — SPEC-060 ServicePeriods

API para planificar/listar y abrir/cerrar ServicePeriod por Branch/businessDate. Create
recibe `businessDate`, tipo y ventana local. `GET /v1/branches/{branchId}/service-periods`
lista todos los períodos del Branch sin filtros. `POST /v1/service-periods/{id}/force-close`
está disponible y exige `reason` en body. El I0 actual no usa `If-Match`/`Idempotency-Key`,
no expone blockers tipados de cierre ni políticas DST/recovery; sí cubre actor autorizado,
doble apertura y transición explícita a `CLOSING`/`CLOSED`.
